#!/usr/bin/env python3
"""
Simple HTTP server for testing the quiz locally.
Run this script and open http://localhost:8000 in your browser.
"""

import http.server
import socketserver
import os

PORT = 8000

# Change to the directory where this script is located
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler

# Add CORS headers for local development
class CORSRequestHandler(Handler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
    print(f"🚀 Server running at http://localhost:{PORT}")
    print("📚 Open your browser and go to the URL above")
    print("Press Ctrl+C to stop the server")
    httpd.serve_forever()