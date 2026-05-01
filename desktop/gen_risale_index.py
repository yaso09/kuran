import os
import json
import re

# Map actual safe folder names to their original Turkish display names
TITLES = {
    "01_Sozler": "01 Sözler",
    "02_Mektubat": "02 Mektubat",
    "03_Lemalar": "03 Lem'alar",
    "04_Sular": "04 Şuâlar",
    "05_Tarihce-i_Hayat": "05 Tarihçe-i Hayat",
    "06_Mesnev-i_Nuriye": "06 Mesnevî-i Nuriye",
    "07_Isaratul-icaz": "07 İşaratü'l-i'caz",
    "08_Sikke-i_Tasdik-i_Gaybi": "08 Sikke-i Tasdik-i Gaybî",
    "09_Barla_Lhikasi": "09 Barla Lâhikası",
    "10_Kastamonu_Lhikasi": "10 Kastamonu Lâhikası",
    "11_Emirdag_Lhikasi_1": "11 Emirdağ Lâhikası 1",
    "12_Emirdag_Lhikasi_2": "12 Emirdağ Lâhikası 2",
    "13_As-yi_Musa": "13 Asâ-yı Musa",
    "14_Kucuk_Kitaplar": "14 Küçük Kitaplar"
}

def extract_title(html_path, fallback):
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            # Read first 3000 chars to be safe (some files might have large headers)
            content = f.read(3000)
            # Find first <h1> or <h2>
            match = re.search(r'<(h1|h2)[^>]*>(.*?)</\1>', content, re.IGNORECASE | re.DOTALL)
            if match:
                title = match.group(2).strip()
                # Remove all HTML tags inside the title
                title = re.sub(r'<.*?>', '', title)
                # Unescape some common HTML entities if present
                title = title.replace('&nbsp;', ' ').replace('&amp;', '&')
                if title and len(title) > 2:
                    return title
    except Exception as e:
        print(f"Error reading {html_path}: {e}")
    return fallback

def generate_risale_index(base_path):
    risale_path = os.path.join(base_path, 'risaleinur')
    if not os.path.exists(risale_path):
        print(f"Path not found: {risale_path}")
        return None
    
    books = []
    folders = sorted([f for f in os.listdir(risale_path) if os.path.isdir(os.path.join(risale_path, f))])
    
    for folder in folders:
        book_path = os.path.join(risale_path, folder)
        chapters = sorted([f for f in os.listdir(book_path) if f.endswith('.html')])
        
        chapter_list = []
        for ch in chapters:
            abs_ch_path = os.path.join(book_path, ch)
            
            # Better fallback logic
            clean_name = ch.replace('.html', '')
            # If it starts with '01.01_', take the rest
            if '_' in clean_name:
                parts = clean_name.split('_', 1)
                fallback_title = parts[1].replace('_', ' ') if len(parts) > 1 else parts[0].replace('_', ' ')
            else:
                fallback_title = clean_name.replace('_', ' ')
            
            # Try to extract the real Turkish title
            real_title = extract_title(abs_ch_path, fallback_title)
            
            chapter_list.append({
                "name": real_title,
                "filename": ch
            })
            
        books.append({
            "book": TITLES.get(folder, folder.replace('_', ' ')),
            "path": folder,
            "chapters": chapter_list
        })
        
    with open(os.path.join(risale_path, 'index.json'), 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)
    print(f"Index successfully updated with {len(books)} books.")
    return books

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    generate_risale_index(os.path.join(script_dir, '..', 'www'))
