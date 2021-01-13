#!/usr/bin/env python3

from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
import os

class GetScript(BaseHTTPRequestHandler):

	def do_GET(self):
		if (self.path == "/favicon.ico"):
			self.send_response(404)
			return
			
		self.send_response(200)
		self.send_header('Content-type', 'text/javascript')
		self.end_headers()
		name = self.path[1:][:-3]
		os.system("bash build.bash " + name)
		js = Path(name + ".js").read_text()
		self.wfile.write(js.encode('utf-8'))

httpd = HTTPServer( ('', 3000), GetScript)
print('Starting Baller Transpile Server on Port 3000...')
try:
	httpd.serve_forever()
except KeyboardInterrupt:
	pass
httpd.server_close()
