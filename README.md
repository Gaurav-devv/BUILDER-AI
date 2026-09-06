# Builder AI — Sovereign AI Workbench

This is a prototype for the **SIH 2026** problem statement: "Sovereign On-Premise Agentic AI Workbench using Open-Weight Multimodal LLMs for Confidential Industrial Work."

It is designed to run **100% locally** on your own infrastructure, ensuring sensitive engineering and industrial data never leaves your network. It uses a **MERN stack** (MongoDB, Express, React, Node.js) alongside a **FastAPI** Python AI service that connects to **Ollama** for local inference.

---

## Prerequisites

Before starting, you must install the following on your machine:

1. **Node.js** (v18 or higher)
2. **Python** (v3.9 or higher)
3. **Ollama** — [Download for Windows/Mac/Linux](https://ollama.com/download)

---

## Quick Start Guide

### Step 1: Start Ollama and Download the Model

First, ensure Ollama is installed and running on your system.
Open a new terminal and run:

```bash
ollama pull qwen:8b
```

_(This downloads the required open-weight AI model. It is ~2GB and may take a few minutes)._

---

### Step 2: Set up the Express Backend (Auth & Database)

Open a new terminal in the root of the project:

```bash
cd server
npm install
```

**Environment Variables:**
Create a `.env` file in the `server` folder with the following contents:

```env
JWT_SECRET="your_super_secret_jwt_key_here"
ORIGINS="http://localhost:5173,http://localhost:5174,http://localhost:3000,http://localhost:8000"
MONGODB_URI="your_mongodb_connection_string"
AI_SERVICE_URL="http://localhost:8000"
```

_(Note: Replace `your_mongodb_connection_string` with your actual MongoDB Atlas connection URL)._

Start the backend:

```bash
npm run dev
```

---

### Step 3: Set up the React Frontend

Open a new terminal in the root of the project:

```bash
cd client
npm install
```

**Environment Variables:**
Create a `.env` file in the `client` folder with the following contents:

```env
VITE_BASE_URL="http://localhost:3000"
VITE_AI_SERVICE_URL="http://localhost:8000"
```

Start the frontend:

```bash
npm run dev
```

_(This will start the UI at `http://localhost:5173`)_

---

### Step 4: Set up the FastAPI AI Service

This service is the bridge between the UI and your local Ollama model.
Open a new terminal in the root of the project:

```bash
cd ai-service
```

**Windows Users:**
Simply double-click the `start.bat` file, or run it in the terminal:

```cmd
start.bat
```

_(The script will automatically create a virtual environment, install the dependencies, and start the FastAPI server on port 8000)._

**Mac/Linux Users:**

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## You are ready!

Go to **[http://localhost:5173](http://localhost:5173)** in your browser.

1. Create a new account or log in.
2. Click **New Project**.
3. You will enter the Sovereign AI Workbench. The system status panel on the right should show green indicators confirming that the Local AI is online and connected!
