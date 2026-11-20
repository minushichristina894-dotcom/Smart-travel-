"""
Legacy launcher — runs Flask weather service from backend/app.py
Prefer: cd backend && python app.py
"""
import os
import runpy
import sys

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.chdir(BACKEND_DIR)
runpy.run_path(os.path.join(BACKEND_DIR, 'app.py'), run_name='__main__')
