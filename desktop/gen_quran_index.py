import os
import json
import re

def normalize_arabic(text):
    # Kur'an durak işaretlerini ve küçük harfleri temizle
    # 06D6-06ED arası: Salla, Qala, Meem, La, Jeem, etc.
    quran_signs = re.compile(r'[\u06D6-\u06ED]')
    text = quran_signs.sub('', text)
    # Fazla boşlukları temizle
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def generate_quran_index(base_path):
    sureler_path = os.path.join(base_path, 'sureler')
    index = {}
    
    for i in range(1, 115):
        filepath = os.path.join(sureler_path, f"{i}.json")
        if not os.path.exists(filepath):
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for v in data:
                # Ayetin tam Arapça metnini kelimelerden oluştur
                arabic_full = ' '.join(w.get('text', '') for w in v.get('words', []))
                
                # Normalize et
                norm_text = normalize_arabic(arabic_full)
                if norm_text:
                    # Index key: Arapça metin, Value: [Sure, Ayet]
                    index[norm_text] = {"s": i, "a": int(v['ayet'])}
                
                # Bazen ayetin sadece bir kısmı alıntılanır. 
                # Çok yaygın olan kısa kısımları da ekleyebiliriz ama index şişebilir.
                # Şimdilik tam metinle başlayalım.

    with open(os.path.join(base_path, 'quran_index.json'), 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False)
    print(f"Index oluşturuldu: {len(index)} ayet eklendi.")

if __name__ == "__main__":
    generate_quran_index('../www')
