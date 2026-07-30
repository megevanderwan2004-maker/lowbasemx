"""Serveur statique de prévisualisation pour deploy/.

http.server en ligne de commande appelle os.getcwd() au moment de
construire ses arguments : si le répertoire courant hérité est
inaccessible, le module échoue avant même de démarrer. On fixe donc le
répertoire nous-mêmes, par chemin absolu.
"""
import http.server
import os
import socketserver
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.pardir, "deploy")
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4175

os.chdir(os.path.abspath(ROOT))


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Le contenu change à chaque itération : on ne veut pas de cache.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print("serving %s on http://127.0.0.1:%d" % (os.getcwd(), PORT), flush=True)
    httpd.serve_forever()
