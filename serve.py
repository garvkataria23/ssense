import http.server
import os
import socketserver
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public_html')
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def translate_path(self, path):
        res = super().translate_path(path)
        if os.path.isdir(res):
            return res
        if not os.path.splitext(path)[1] and not os.path.exists(res):
            candidate = res + '.html'
            if os.path.exists(candidate):
                return candidate
        return res

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, fmt, *args):
        super().log_message(fmt, *args)


with socketserver.ThreadingTCPServer(('', PORT), Handler) as httpd:
    print(f'Serving public_html on http://localhost:{PORT} (extensionless URLs like /about work)')
    httpd.serve_forever()