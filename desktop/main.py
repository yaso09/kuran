import http.server
import socketserver
import threading
import time
import sys
import subprocess
import os
import argparse
import json
import re
import urllib.request
import multiprocessing
import ctypes

PORT = 8080

if hasattr(sys, 'frozen'):
    # Pyinstaller exe'sinden çalışıyor
    DIRECTORY = os.path.join(sys._MEIPASS, "www")
else:
    # desktop içinden bir üst dizindeki www klasörüne bak
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if '--dev' in sys.argv:
        import shutil
        CACHE_DIR = os.path.join(BASE_DIR, ".cache")
        if not os.path.exists(CACHE_DIR):
            os.makedirs(CACHE_DIR)
        else: 
            shutil.rmtree(CACHE_DIR)
            os.makedirs(CACHE_DIR)
        
        cached_www = os.path.join(CACHE_DIR, "www")
        if not os.path.exists(cached_www):
            shutil.copytree(os.path.join(BASE_DIR, "www"), cached_www)
            
        DIRECTORY = cached_www
    else:
        DIRECTORY = os.path.join(BASE_DIR, "www")

# Windows konsolunda Arapça vb. karakterlerin düzgün basılması için utf-8 ayarı
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

def strip_html(html_str):
    """HTML etiketlerini temizleyip CLI için olabildiğince düz metin haline getirir."""
    text = re.sub(r'<[^<]+>', ' ', html_str)
    text = re.sub(r'\n\s*\n', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    return text.strip()

def load_json(filepath):
    full_path = os.path.join(DIRECTORY, filepath)
    if not os.path.exists(full_path):
        return None
    with open(full_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def oto_guncelle():
    if not hasattr(sys, 'frozen'):
        print("Güncelleme komutu sadece derlenmiş paket hali (.exe) içinde desteklenir.")
        return
    
    print("Mevcut kuran.exe için yeni sürüm kontrol ediliyor: https://kuran.yasireymen.com/latest/kuran.exe")
    exe_path = sys.executable
    old_exe_path = exe_path + ".old"
    
    # Varsa eski kalıntıları temizle
    if os.path.exists(old_exe_path):
        try:
            os.remove(old_exe_path)
        except:
            pass

    # Windows'ta çalışan dosya silinemeyeceği için sadece ismini değiştiriyoruz.
    try:
        os.rename(exe_path, old_exe_path)
    except Exception as e:
        print("Güncelleme başarısız: Dosya adını değiştirme izni yok.", e)
        print("Lütfen cmd/terminal ekranını Yönetici (Administrator) olarak açıp tekrar deneyin.")
        return

    print("İndirme başlatıldı... Bu işlem internet hızınıza bağlı olarak biraz zaman alabilir.")
    try:
        urllib.request.urlretrieve("https://kuran.yasireymen.com/latest/kuran.exe", exe_path)
        print("\nGüncelleme işlemi başarıyla tamamlandı! Lütfen uygulamayı yeniden başlatın.")
        sys.exit(0)
    except Exception as e:
        print("\nİndirme işlemi sırasında bir hata gerçekleşti:", e)
        # Hata olduysa isim değişikliğini geri al
        if os.path.exists(old_exe_path):
            try:
                os.rename(old_exe_path, exe_path)
            except:
                pass

class Api:
    def check_frozen(self):
        return hasattr(sys, 'frozen')
        
    def trigger_update(self):
        try:
            exe_path = sys.executable
            old_exe_path = exe_path + ".old"
            
            if os.path.exists(old_exe_path):
                try: os.remove(old_exe_path)
                except: pass
            
            os.rename(exe_path, old_exe_path)
            
            urllib.request.urlretrieve("https://kuran.yasireymen.com/latest/kuran.exe", exe_path)
            return {"status": "success", "message": "Güncelleme başarıyla tamamlandı. Kapanıyor..."}
        except Exception as e:
            if os.path.exists(old_exe_path):
                try: os.rename(old_exe_path, exe_path)
                except: pass
            return {"status": "error", "message": str(e)}

    def exit_app(self):
        os._exit(0) # Anında kapatır

    def select_file(self, file_type):
        import webview
        file_types = ()
        if file_type == 'kiraat':
            file_types = ('Kıraat Dosyaları (*.kiraat)', 'Tüm Dosyalar (*.*)')
        elif file_type == 'meal':
            file_types = ('Meal Dosyaları (*.meal)', 'Tüm Dosyalar (*.*)')
        if file_type == 'tefsir':
            file_types = ('Tefsir Dosyaları (*.tefsir)', 'Tüm Dosyalar (*.*)')
            
        result = webview.windows[0].create_file_dialog(webview.FileDialog.OPEN, allow_multiple=False, file_types=file_types)
        if result and len(result) > 0:
            return result[0]
        return None

def generate_risale_index():
    """risaleinur klasörünü tarayıp index.json oluşturur."""
    risale_path = os.path.join(DIRECTORY, 'risaleinur')
    if not os.path.exists(risale_path):
        return
    
    books = []
    try:
        folders = sorted([f for f in os.listdir(risale_path) if os.path.isdir(os.path.join(risale_path, f))])
        for folder in folders:
            book_path = os.path.join(risale_path, folder)
            chapters = sorted([f for f in os.listdir(book_path) if f.endswith('.html')])
            
            chapter_list = []
            for ch in chapters:
                # 01.01 Birinci Söz -> Birinci Söz
                ch_name = ch.replace('.html', '').split(' ', 1)[-1] if ' ' in ch else ch.replace('.html', '')
                chapter_list.append({"name": ch_name, "filename": ch})
                
            books.append({"book": folder, "path": folder, "chapters": chapter_list})
            
        with open(os.path.join(risale_path, 'index.json'), 'w', encoding='utf-8') as f:
            json.dump(books, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("Risale index hatası:", e)

def generate_quran_index():
    """Kur'an ayetlerini ve kelimeleri indeksler."""
    sureler_path = os.path.join(DIRECTORY, 'sureler')
    index_path = os.path.join(DIRECTORY, 'quran_index.json')
    word_index_path = os.path.join(DIRECTORY, 'quran_words.json')
    verse_list_path = os.path.join(DIRECTORY, 'quran_verses.json')
    
    if not os.path.exists(sureler_path):
        return
    
    full_index = {}
    word_index = {}
    verse_list = []
    
    try:
        quran_signs = re.compile(r'[\u06D6-\u06ED]')
        
        for i in range(1, 115):
            filepath = os.path.join(sureler_path, f"{i}.json")
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for v in data:
                        words = v.get('words', [])
                        arabic_full = ' '.join(w.get('text', '') for w in words)
                        norm_text = quran_signs.sub('', arabic_full)
                        norm_text = re.sub(r'\s+', ' ', norm_text).strip()
                        
                        if norm_text:
                            full_index[norm_text] = {"s": i, "a": int(v['ayet'])}
                            verse_list.append({
                                "s": i, 
                                "a": int(v['ayet']), 
                                "t": norm_text,
                                "l": len(words)
                            })
                            
                            # Kelime kelime indeksle
                            for w in words:
                                w_text = w.get('text', '')
                                w_norm = quran_signs.sub('', w_text).strip()
                                w_meaning = w.get('meaning', '')
                                if w_norm and w_meaning:
                                    # En sık geçeni veya ilkini sakla (genellikle benzerdir)
                                    if w_norm not in word_index:
                                        word_index[w_norm] = w_meaning
        
        with open(index_path, 'w', encoding='utf-8') as f:
            json.dump(full_index, f, ensure_ascii=False)
        with open(word_index_path, 'w', encoding='utf-8') as f:
            json.dump(word_index, f, ensure_ascii=False)
        with open(verse_list_path, 'w', encoding='utf-8') as f:
            json.dump(verse_list, f, ensure_ascii=False)
            
    except Exception as e:
        print("Quran index hatası:", e)

def hide_console():
    """Windows'ta GUI modunda arkadaki siyah konsolu gizler."""
    if sys.platform == 'win32' and hasattr(sys, 'frozen'):
        whnd = ctypes.windll.kernel32.GetConsoleWindow()
        if whnd != 0:
            ctypes.windll.user32.ShowWindow(whnd, 0)

def start_gui():
    # GUI açılıyorsa konsolu gizle (eğer console=True derlenmişse)
    hide_console()
    
    # Risale-i Nur eklendiyse indeksle
    generate_risale_index()
    # Kur'an arama indeksini oluştur/güncelle
    generate_quran_index()
    
    try:
        import webview
    except ImportError:
        if not hasattr(sys, 'frozen'):
            print("Masaüstü görünümü için gerekli 'pywebview' kütüphanesi eksik. Yükleniyor, lütfen bekleyin...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pywebview"])
            import webview

    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass
            
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=DIRECTORY, **kwargs)

    def serve():
        class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
            daemon_threads = True

        with ThreadedHTTPServer(("", PORT), Handler) as httpd:
            try:
                httpd.serve_forever()
            except:
                pass
            finally:
                httpd.server_close()

    print(f"Sistem başlatılıyor...")

    server_thread = threading.Thread(target=serve, daemon=True)
    server_thread.start()

    time.sleep(1)

    if 'webview' in sys.modules:
        icon_path = os.path.join(DIRECTORY, 'muslim-icon_quran.ico')
        if not os.path.exists(icon_path):
            icon_path = None

        try:
            import fileManager
            fileManager.DIRECTORY = DIRECTORY
            fm_port = fileManager.start_server()
            query_params = f"?port={fm_port}&device=desktop"
        except Exception as e:
            print("fileManager başlatılamadı:", e)
            query_params = "?device=desktop"

        api = Api()
        webview.create_window(
            "Kur'an-ı Kerim", 
            f'http://localhost:{PORT}/{query_params}', 
            width=1280, 
            height=850,
            text_select=True,
            zoomable=True,
            js_api=api
        )
        
        webview.start(icon=icon_path, debug=not hasattr(sys, 'frozen'))
    else:
        import webbrowser
        webbrowser.open(f'http://localhost:{PORT}')
        try:
            while True:
                time.sleep(0.5)
        except KeyboardInterrupt:
            pass
    
    print("\nPencere kapatıldı, sistem sonlandırılıyor...")

def start_cli(args):
    if args.guncelle:
        oto_guncelle()
        return

    if args.liste:
        tef_data = load_json("tefsirler/tefsirler.json")
        print("\n--- MEVCUT TEFSİRLER (-t / --tefsir) ---")
        if tef_data:
            for k, v in tef_data.items():
                print(f"  {k} -> {v}")
        else:
            print("  Tefsir indeks dosyası bulunamadı.")

        s1 = load_json("sureler/1.json")
        print("\n--- MEVCUT MEALLER (-m / --meal) ---")
        if s1 and len(s1) > 0:
            tr_mealler = s1[0].get("translations", {}).get("tr", {})
            for k, v in tr_mealler.items():
                print(f"  {k} -> {v.get('name', 'Bilinmeyen Meal')}")
        else:
            print("  Meal listesi alınamadı.")
        return

    if args.sure:
        data = load_json(f"sureler/{args.sure}.json")
        if not data:
            if not getattr(args, 'json', False):
                print("Sure bulunamadı.")
            return

        ayet_list = []
        if args.ayet:
            if '-' in args.ayet:
                try:
                    start_str, end_str = args.ayet.split('-')
                    ayet_list = list(range(int(start_str), int(end_str) + 1))
                except ValueError:
                    if not getattr(args, 'json', False): print("Hatalı ayet aralığı. Örn: 1-5")
                    return
            else:
                try:
                    ayet_list = [int(args.ayet)]
                except ValueError:
                    if not getattr(args, 'json', False): print("Hatalı ayet formatı. Örn: 2 veya 2-5")
                    return
        else:
            ayet_list = [int(v.get('ayet')) for v in data]

        result_data = []
        for req_idx in ayet_list:
            v_data = next((v for v in data if str(v.get('ayet')) == str(req_idx)), None)
            if not v_data: continue

            surah_idx = args.sure
            verse_idx = req_idx

            v_dict = {
                "sure": surah_idx,
                "ayet": verse_idx,
                "arapca": ' '.join(w.get('text', '') for w in v_data.get('words', [])),
                "transkript": v_data.get('transliteration', '')
            }

            if args.kelime:
                v_dict["kelimeler"] = [{"kelime": w.get('text', ''), "anlam": w.get('meaning', '')} for w in v_data.get('words', [])]
            
            meal_dict = v_data.get('translations', {}).get('tr', {})
            meal = meal_dict.get(args.meal)
            if meal:
                v_dict["meal_adi"] = meal.get('name')
                v_dict["meal"] = meal.get('text')
            
            if args.tefsir:
                tafsir_path = os.path.join(DIRECTORY, f"tefsirler/{args.tefsir}/{surah_idx}/{verse_idx}.htm")
                if os.path.exists(tafsir_path):
                    with open(tafsir_path, 'r', encoding='utf-8', errors='ignore') as f:
                        v_dict["tefsir"] = strip_html(f.read())

            if args.dinle:
                surah_pad = str(surah_idx).zfill(3)
                verse_pad = str(verse_idx).zfill(3)
                audio_path = os.path.join(DIRECTORY, "okumalar", args.hafiz, surah_pad, f"{verse_pad}.mp3")
                v_dict["ses_dosyasi"] = audio_path if os.path.exists(audio_path) else None

            result_data.append(v_dict)

        if getattr(args, 'json', False):
            print(json.dumps(result_data, ensure_ascii=False, indent=2))
        else:
            if not result_data:
                print("Ayet bulunamadı.")
                return

            for item in result_data:
                print(f"\n--- {item['sure']}. Sure, {item['ayet']}. Ayet ---")
                print(f"Arapça:      {item['arapca']}")
                print(f"Transkript:  {item['transkript']}")
                
                if args.kelime and 'kelimeler' in item:
                    print("\n[ Kelime Anlamları ]")
                    for k in item['kelimeler']:
                        print(f"  {k['kelime']} -> {k['anlam']}")

                if 'meal' in item:
                    print(f"\n[ Meal - {item.get('meal_adi')} ]")
                    print(f"  {item['meal']}")
                elif args.meal:
                    print(f"\nMeal ({args.meal}) bulunamadı. Lütfen --liste seçeneğiyle kontrol edin.")

                if args.tefsir:
                    if 'tefsir' in item:
                        print(f"\n[ Tefsir - {args.tefsir} ]")
                        print(item['tefsir'])
                    else:
                        print(f"\nBu ayet için {args.tefsir} tefsiri bulunamadı.")

            if args.dinle:
                for item in result_data:
                    if item.get('ses_dosyasi'):
                        audio_path = item['ses_dosyasi']
                        print(f"\nSes dosyası çalınıyor: {audio_path}")
                        if os.name == 'nt':
                            os.startfile(audio_path)
                        elif sys.platform == 'darwin':
                            subprocess.call(['open', audio_path])
                        else:
                            subprocess.call(['xdg-open', audio_path])
        return

    elif '--help' in sys.argv or '-h' in sys.argv:
        pass
    else:
        print("Bilinmeyen veya eksik argüman! Hızlı kullanım parametreleri:")
        print(" python baslat.py -s 1 -a 2 -k -t beydavi")

if __name__ == "__main__":
    # PyInstaller için multiprocessing desteği
    multiprocessing.freeze_support()

    parser = argparse.ArgumentParser(description="Kur'an-ı Kerim Arayüzü / CLI")
    parser.add_argument('-s', '--sure', type=int, help="Sure numarası (1-114)")
    parser.add_argument('-a', '--ayet', type=str, help="Ayet numarası veya aralığı (Örn: 1 veya 3-5)")
    parser.add_argument('-m', '--meal', type=str, help="Meal kaynağı (örn: diyanet, ozturk)", default='diyanet')
    parser.add_argument('-t', '--tefsir', type=str, help="Tefsir kaynağı klasörü (örn: beydavi)")
    parser.add_argument('-k', '--kelime', action='store_true', help="Arapça kelimelerin anlamları")
    parser.add_argument('-d', '--dinle', action='store_true', help="Ayetin ses dosyasını oynat")
    parser.add_argument('-f', '--hafiz', type=str, help="Hafız", default='gamadi')
    parser.add_argument('-j', '--json', action='store_true', help="Çıktıyı salt JSON dizisi olarak döndür")
    parser.add_argument('-l', '--liste', action='store_true', help="Mevcut meal ve tefsir listesini görüntüle")
    parser.add_argument('-g', '--guncelle', action='store_true', help="Arayüzü internetten güncelle")
    parser.add_argument('--dev', action='store_true', help="Geliştirme modunda önbellek dizini kullan")

    # Eğer hiçbir argüman yoksa veya sadece script adı (veya --dev) varsa GUI başlar
    # argümanları parse etmeden önce sadeleştirme
    is_gui = False
    if len(sys.argv) == 1 or (len(sys.argv) == 2 and sys.argv[1] == '--dev'):
        is_gui = True

    if is_gui:
        start_gui()
    else:
        args = parser.parse_args()
        start_cli(args)
