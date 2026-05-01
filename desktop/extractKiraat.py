import os
import zipfile
import json
import unicodedata
import re
from pathlib import Path

def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '_', text)
    return text.strip('_')

def extractKiraat(zip_path, okumalar_dir):
    okumalar_dir = Path(okumalar_dir)
    okumalar_json_path = okumalar_dir / "okumalar.json"
    
    if not okumalar_json_path.exists():
        okumalar_json_path.write_text(json.dumps({"gamadi": "Saad al-Ghamidi", "muaykli": "Mahir el-Muaykli"}, ensure_ascii=False, indent=2), encoding='utf-8')
        
    with zipfile.ZipFile(zip_path, 'r') as zf:
        if "recitation.json" not in zf.namelist():
            raise Exception("ZIP dosyasının kök dizininde recitation.json bulunamadı.")
            
        with zf.open("recitation.json") as f:
            try:
                recitation_info = json.load(f)
            except Exception as e:
                raise Exception("recitation.json formatı hatalı: " + str(e))
                
        reciter_name = recitation_info.get("reciter")
        if not reciter_name:
            raise Exception("recitation.json içinde 'reciter' alanı bulunamadı.")
            
        reciter_id = slugify(reciter_name)
        if not reciter_id:
            reciter_id = "custom_reciter"
            
        target_dir = okumalar_dir / reciter_id
        if not target_dir.exists():
            target_dir.mkdir(parents=True, exist_ok=True)
            
        # Extract files, skip recitation.json
        for file_info in zf.infolist():
            if file_info.filename == "recitation.json" or file_info.is_dir():
                continue
            
            # extract directly to maintain internal directory structure (e.g., 001/001.mp3)
            zf.extract(file_info, path=target_dir)

    # Update okumalar.json
    okumalar_data = json.loads(okumalar_json_path.read_text(encoding='utf-8'))
    okumalar_data[reciter_id] = reciter_name
    okumalar_json_path.write_text(json.dumps(okumalar_data, ensure_ascii=False, indent=2), encoding='utf-8')
    return True

def extract(zip_path, okumalar_dir):
    return extractKiraat(zip_path, okumalar_dir)
