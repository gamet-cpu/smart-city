@echo off
cd /d "%~dp0sc-back"
python -m uvicorn main:app --port 8001 --reload
