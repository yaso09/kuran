import http.server
import socketserver
import threading
import os
import sys
import json

# find www path
if hasattr(sys, 'frozen'):
    DIRECTORY = os.path.join(sys._MEIPASS, "www")
else:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DIRECTORY = os.path.join(BASE_DIR, "www")

class FileManagerHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/upload_meal':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                content_type = self.headers.get('Content-Type', '')
                if 'application/json' in content_type:
                    req = json.loads(post_data.decode('utf-8'))
                    temp_path = req.get('path')
                    remove_temp = False
                else:
                    temp_path = os.path.join(DIRECTORY, "temp.meal")
                    with open(temp_path, 'wb') as f:
                        f.write(post_data)
                    remove_temp = True
                
                # Import extractMeal from the same directory (desktop)
                import extractMeal
                
                # Call extract_meal directly with the sureler path
                sureler_path = os.path.join(DIRECTORY, "sureler")
                extractMeal.extract(temp_path, sureler_path)
                
                if remove_temp and os.path.exists(temp_path):
                    os.remove(temp_path)

                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b'{"status": "success"}')
            except Exception as e:
                import traceback
                traceback.print_exc()
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                err_msg = json.dumps({"status": "error", "message": str(e)})
                self.wfile.write(err_msg.encode('utf-8'))
            return
            
        elif self.path == '/upload_kiraat':
            try:
                content_length = int(self.headers['Content-Length'])
                content_type = self.headers.get('Content-Type', '')
                
                if 'application/json' in content_type:
                    post_data = self.rfile.read(content_length)
                    req = json.loads(post_data.decode('utf-8'))
                    temp_path = req.get('path')
                    remove_temp = False
                else:
                    temp_path = os.path.join(DIRECTORY, "temp.kiraat")
                    with open(temp_path, 'wb') as f:
                        bytes_read = 0
                        while bytes_read < content_length:
                            chunk = self.rfile.read(min(65536, content_length - bytes_read))
                            if not chunk:
                                break
                            f.write(chunk)
                            bytes_read += len(chunk)
                    remove_temp = True
                
                import extractKiraat
                okumalar_path = os.path.join(DIRECTORY, "okumalar")
                extractKiraat.extract(temp_path, okumalar_path)
                
                if remove_temp and os.path.exists(temp_path):
                    os.remove(temp_path)

                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b'{"status": "success"}')
            except Exception as e:
                import traceback
                traceback.print_exc()
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                err_msg = json.dumps({"status": "error", "message": str(e)})
                self.wfile.write(err_msg.encode('utf-8'))
            return

        elif self.path == '/upload_tefsir':
            try:
                content_length = int(self.headers['Content-Length'])
                content_type = self.headers.get('Content-Type', '')
                
                if 'application/json' in content_type:
                    post_data = self.rfile.read(content_length)
                    req = json.loads(post_data.decode('utf-8'))
                    temp_path = req.get('path')
                    remove_temp = False
                else:
                    temp_path = os.path.join(DIRECTORY, "temp.tefsir")
                    with open(temp_path, 'wb') as f:
                        bytes_read = 0
                        while bytes_read < content_length:
                            chunk = self.rfile.read(min(65536, content_length - bytes_read))
                            if not chunk:
                                break
                            f.write(chunk)
                            bytes_read += len(chunk)
                    remove_temp = True
                
                import extractTefsir
                tefsirler_path = os.path.join(DIRECTORY, "tefsirler")
                extractTefsir.extract(temp_path, tefsirler_path)
                
                if remove_temp and os.path.exists(temp_path):
                    os.remove(temp_path)

                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b'{"status": "success"}')
            except Exception as e:
                import traceback
                traceback.print_exc()
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                err_msg = json.dumps({"status": "error", "message": str(e)})
                self.wfile.write(err_msg.encode('utf-8'))
            return
            
        elif self.path == '/delete_item':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                req = json.loads(post_data.decode('utf-8'))
                
                item_type = req.get("type")
                item_id = req.get("id")
                
                import shutil
                if item_type == "meal":
                    sureler_dir = os.path.join(DIRECTORY, "sureler")
                    import glob
                    for f_path in glob.glob(os.path.join(sureler_dir, "*.json")):
                        try:
                            with open(f_path, 'r', encoding='utf-8') as f:
                                data = json.load(f)
                            modified = False
                            for verse in data:
                                if "translations" in verse and "tr" in verse["translations"]:
                                    if item_id in verse["translations"]["tr"]:
                                        del verse["translations"]["tr"][item_id]
                                        modified = True
                            if modified:
                                with open(f_path, 'w', encoding='utf-8') as f:
                                    json.dump(data, f, ensure_ascii=False, indent=2)
                        except Exception as e:
                            pass
                            
                elif item_type == "kiraat":
                    okumalar_dir = os.path.join(DIRECTORY, "okumalar")
                    target_dir = os.path.join(okumalar_dir, item_id)
                    print(f"Deleting kiraat folder: {target_dir}")
                    if os.path.exists(target_dir):
                        try:
                            shutil.rmtree(target_dir)
                        except Exception as e:
                            print(f"Error removing folder {target_dir}: {e}")
                            raise Exception(f"Kıraat klasörü silinemedi (muhtemelen kullanımda): {str(e)}")
                            
                    json_path = os.path.join(okumalar_dir, "okumalar.json")
                    if os.path.exists(json_path):
                        with open(json_path, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                        if item_id in data:
                            del data[item_id]
                            with open(json_path, 'w', encoding='utf-8') as f:
                                json.dump(data, f, ensure_ascii=False, indent=2)
                                
                elif item_type == "tefsir":
                    tefsirler_dir = os.path.join(DIRECTORY, "tefsirler")
                    target_dir = os.path.join(tefsirler_dir, item_id)
                    print(f"Deleting tefsir folder: {target_dir}")
                    if os.path.exists(target_dir):
                        try:
                            shutil.rmtree(target_dir)
                        except Exception as e:
                            print(f"Error removing folder {target_dir}: {e}")
                            # Continue to remove from JSON anyway or raise? 
                            # Let's raise to inform the user.
                            raise Exception(f"Klasör silinemedi (muhtemelen kullanımda): {str(e)}")
                            
                    json_path = os.path.join(tefsirler_dir, "tefsirler.json")
                    if os.path.exists(json_path):
                        with open(json_path, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                        if item_id in data:
                            del data[item_id]
                            with open(json_path, 'w', encoding='utf-8') as f:
                                json.dump(data, f, ensure_ascii=False, indent=4)

                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b'{"status": "success"}')
            except Exception as e:
                import traceback
                traceback.print_exc()
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                err_msg = json.dumps({"status": "error", "message": str(e)})
                self.wfile.write(err_msg.encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")
        self.end_headers()

def start_server():
    port = 8081
    
    class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
        daemon_threads = True
        
    # Try to find a free port if 8081 is taken
    while True:
        try:
            httpd = ThreadedHTTPServer(("", port), FileManagerHandler)
            break
        except Exception:
            port += 1
            
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return port
