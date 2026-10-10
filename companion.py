# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""
x-kindel-interface: Local LAN Companion Server
Serves the Kindle e-ink web deck over local unencrypted HTTP (port 8000).
Enables older Kindles with expired SSL certificates to read Twitter feeds,
and provides an extensible local proxy endpoint for authenticated sessions.
"""

import http.server
import json
import os
import sys
import urllib.request
import urllib.error

PORT = int(os.environ.get("PORT", 8000))
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")


class KindleHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Local proxy endpoint for older Kindles that fail HTTPS handshakes
        if self.path.startswith("/api/profile/"):
            self.handle_api_proxy()
        else:
            super().do_GET()

    def handle_api_proxy(self):
        # Extract handle and optional cursor
        path_parts = self.path[len("/api/profile/"):].split("?")
        handle = path_parts[0].strip("/")
        query = ("?" + path_parts[1]) if len(path_parts) > 1 else ""

        upstream_url = f"https://api.fxtwitter.com/2/profile/{handle}/statuses{query}"
        req = urllib.request.Request(
            upstream_url,
            headers={"User-Agent": "KindleCompanion/1.0 (+http://local.kindle)"}
        )

        try:
            with urllib.request.urlopen(req, timeout=12) as response:
                content = response.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(content)
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"Upstream HTTP {e.code}"}).encode())
        except Exception as e:
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())


def main():
    server_address = ("", PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, KindleHTTPRequestHandler)
    print(f"=====================================================")
    print(f" Kindle X Interface Companion Server Running")
    print(f" Local URL:   http://localhost:{PORT}")
    print(f" Serving UI:  {DIRECTORY}")
    print(f" Navigate your Kindle browser to: http://<LAN-IP>:{PORT}")
    print(f"=====================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nCompanion server stopped.")
        httpd.server_close()


if __name__ == "__main__":
    main()
