@echo off
echo ============================================================
echo  Builder AI - Sovereign AI Workbench
echo  Starting AI Service (FastAPI + Ollama)
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/2] Checking Ollama...
ollama list 2>nul
if errorlevel 1 (
    echo.
    echo  WARNING: Ollama does not appear to be running.
    echo  Please start Ollama first, then re-run this script.
    echo  Commands to run in a separate terminal:
    echo    ollama serve
    echo    ollama pull llama3.2:3b
    echo.
)

echo.
echo [2/2] Starting FastAPI AI Service on port 8000...
echo  API docs: http://localhost:8000/docs
echo  Status:   http://localhost:8000/api/ai/status
echo.

REM Use venv if available, otherwise system python
if exist "venv\Scripts\python.exe" (
    venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
) else (
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
)
