import json
import re
from pathlib import Path
import unicodedata

def extractMeal(txt_path: str | Path, data_dir: str | Path = None) -> dict:
    txt_path = Path(txt_path)
    if data_dir is None:
        data_dir = Path(__file__).parent.parent / "www" / "sureler"
    else:
        data_dir = Path(data_dir)

    lines = [
        line.strip()
        for line in txt_path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]

    if not lines:
        raise ValueError("Dosya boş.")

    header_parts = lines[0].split("|", maxsplit=1)
    if len(header_parts) != 2:
        raise ValueError(
            f"Geçersiz başlık satırı: '{lines[0]}'\n"
            "Beklenen format: 'dil_kodu|Görünen Ad'  (ör: 'tr|Benim Mealim')"
        )

    lang = header_parts[0].strip()
    meal_display_name = header_parts[1].strip()

    # Generate meal_key from display name
    # e.g. "Benim Mealim" -> "benim_mealim"
    # remove special chars
    def slugify(text):
        text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
        text = text.lower()
        text = re.sub(r'[^a-z0-9]+', '_', text)
        return text.strip('_')
        
    meal_key = slugify(meal_display_name)
    if not meal_key:
        meal_key = "custom_meal"

    meal_map: dict[str, str] = {}
    for line in lines[1:]:
        parts = line.split("|")
        if len(parts) < 3:
            continue
        sure = parts[0].strip()
        ayet = parts[1].strip()
        text = "|".join(parts[2:]).strip()
        meal_map[f"{sure}:{ayet}"] = text

    json_files = sorted(
        data_dir.glob("*.json"),
        key=lambda f: int(m.group()) if (m := re.search(r"\d+", f.name)) else 0,
    )

    total = 0
    missing = 0
    missing_keys: list[str] = []

    for json_file in json_files:
        data: list[dict] = json.loads(json_file.read_text(encoding="utf-8"))
        for verse in data:
            key = f"{verse['sure']}:{verse['ayet']}"
            text = meal_map.get(key)
            if text is None:
                missing_keys.append(key)
                missing += 1
                continue
            
            if "translations" not in verse:
                verse["translations"] = {}
            if lang not in verse["translations"]:
                verse["translations"][lang] = {}
                
            verse["translations"][lang][meal_key] = {
                "name": meal_display_name,
                "text": text,
            }
            total += 1

        json_file.write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    return {"total": total, "missing": missing, "missing_keys": missing_keys}

def extract(meal_path, sureler_path):
    # wrapper for fileManager.py backward compatibility during transition
    return extractMeal(meal_path, sureler_path)