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

def extractTefsir(zip_path, tefsirler_dir):
    tefsirler_dir = Path(tefsirler_dir)
    tefsirler_json_path = tefsirler_dir / "tefsirler.json"
    
    if not tefsirler_json_path.exists():
        # Initialize if it doesn't exist (though it should)
        tefsirler_json_path.write_text(json.dumps({}, ensure_ascii=False, indent=2), encoding='utf-8')
        
    with zipfile.ZipFile(zip_path, 'r') as zf:
        if "tefsir.json" not in zf.namelist():
            raise Exception("ZIP dosyasının kök dizininde tefsir.json bulunamadı.")
            
        with zf.open("tefsir.json") as f:
            try:
                tefsir_info = json.load(f)
            except Exception as e:
                raise Exception("tefsir.json formatı hatalı: " + str(e))
                
        tefsir_name = tefsir_info.get("name")
        if not tefsir_name:
            raise Exception("tefsir.json içinde 'name' alanı bulunamadı.")
            
        # Author is optional but we can append it if present
        tefsir_display = tefsir_name
        
        tefsir_id = slugify(tefsir_name)
        if not tefsir_id:
            tefsir_id = "custom_tefsir"
            
        target_dir = tefsirler_dir / tefsir_id
        if not target_dir.exists():
            target_dir.mkdir(parents=True, exist_ok=True)
            
        # Extract files, skip tefsir.json
        for file_info in zf.infolist():
            if file_info.filename == "tefsir.json" or file_info.is_dir():
                continue
            
            # extract directly to maintain internal directory structure
            zf.extract(file_info, path=target_dir)

    # Update tefsirler.json
    try:
        tefsirler_data = json.loads(tefsirler_json_path.read_text(encoding='utf-8'))
    except Exception:
        tefsirler_data = {}
        
    tefsirler_data[tefsir_id] = tefsir_display
    tefsirler_json_path.write_text(json.dumps(tefsirler_data, ensure_ascii=False, indent=4), encoding='utf-8')
    return True

def extract(zip_path, tefsirler_dir):
    return extractTefsir(zip_path, tefsirler_dir)
