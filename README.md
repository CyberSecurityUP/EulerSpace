# EulerSpace

**Digital Laboratory for Mathematics, Physics & Computer Science**

Interactive educational platform with multi-language support (EN/PT/ES), physics simulations, cryptography and quantum computing labs, real-time LaTeX rendering, and an AI assistant.

---

## Features

### Learning
- **Academy** - Complete math and physics curriculum with theory, exercises, and hints (20 lessons, 433 theory blocks, 100 practice problems)
- **Foundations** - Interactive fundamentals with multiplication tables, calculator, hints, and answer validation
- **Formulas** - Comprehensive math and physics formula reference

### Science Labs
- **Physics Lab** - 6 simulations: projectile motion, SHM, pendulum, waves, electric field, orbital mechanics
- **Crypto Lab** - Classical ciphers (Caesar, Vigenere), symmetric (AES), asymmetric (RSA, Diffie-Hellman), hashing, security analysis
- **Quantum Lab** - Qubits & Bloch sphere, quantum gates, circuits (Bell, GHZ, teleportation), algorithms (Grover, Shor, BB84)

### Tools
- **Calculator** - Symbolic math engine powered by SymPy (derivatives, integrals, ODEs, matrices)
- **LaTeX Editor** - Real-time preview editor using KaTeX
- **Graphs** - Interactive visualization with Plotly.js
- **AI Assistant** - Step-by-step explanations and exercise generation

### Extras
- **Research** - Mathematical research tools
- **Challenges** - Olympiad-style problems

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI Framework |
| Vite | 7.3 | Build tool & dev server |
| React Router | 7.13 | SPA routing |
| KaTeX | 0.16 | LaTeX rendering |
| Plotly.js | 3.3 | Interactive charts |
| Axios | 1.13 | HTTP client |
| CodeMirror | 5.65 | Code editor |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.115 | REST API |
| SymPy | 1.13 | Symbolic math engine |
| NumPy | 1.26 | Numerical computing |
| SciPy | 1.13 | Scientific simulations |
| Uvicorn | - | ASGI server |

### i18n
Full support for 3 languages: **English**, **Portuguese**, **Spanish**

---

## Project Structure

```
EulerSpace/
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── pages/              # 13 pages (Dashboard, Academy, CryptoLab, QuantumLab, etc.)
│   │   ├── components/         # Sidebar, LatexRenderer
│   │   ├── data/               # Curriculum, exercises, content translations
│   │   ├── i18n/               # Internationalization system (context + translations)
│   │   ├── services/           # API client (axios)
│   │   ├── styles/             # Global CSS
│   │   ├── App.jsx             # Main router
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json             # Vercel deployment config
│
├── backend/                     # FastAPI + Python
│   ├── api/
│   │   └── routes.py           # 17 REST endpoints
│   ├── engine/
│   │   └── symbolic.py         # SymPy engine (solve, diff, integrate, etc.)
│   ├── physics/
│   │   └── simulator.py        # Simulator (projectile, SHM, pendulum, waves, etc.)
│   ├── ai/
│   │   └── assistant.py        # AI assistant
│   ├── main.py                 # FastAPI app
│   └── requirements.txt
│
└── README.md
```

---

## Local Installation

### Prerequisites
- Node.js >= 18
- Python >= 3.10
- npm or yarn

### Frontend

```bash
cd frontend
npm install
npm run dev
# Available at http://localhost:5173
```

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate    # Linux/Mac
# venv\Scripts\activate     # Windows
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
# API available at http://localhost:8000
```

### Environment Variables (Frontend)

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## Deploy to Vercel

### Step 1: Fork or clone the repository

```bash
git clone git@github.com:CyberSecurityUP/EulerSpace.git
```

### Step 2: Create a Vercel account

Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.

### Step 3: Import the project

1. On the Vercel dashboard, click **"Add New..."** > **"Project"**
2. Select the **EulerSpace** repository from the list
3. Configure the build settings:

| Field | Value |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

4. Under **Environment Variables**, add:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your backend URL (e.g., `https://your-backend.onrender.com/api`) |

5. Click **"Deploy"**

### Step 4: Configure a custom domain (optional)

Go to **"Settings"** > **"Domains"** to add your custom domain.

### Step 5: Deploy the Backend

The backend (FastAPI) requires separate hosting. Recommended options:

#### Render (Recommended - Free tier available)
1. Go to [render.com](https://render.com)
2. Create a **Web Service** connected to the repo
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Copy the generated URL and update `VITE_API_URL` on Vercel

#### Railway
1. Go to [railway.app](https://railway.app)
2. Create a project from GitHub
3. Set the root directory to `backend`
4. Railway auto-detects Python

#### Docker (Self-hosted)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/ .
RUN pip install -r requirements.txt
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 6: Automatic redeployment

Every `git push` to the connected branch triggers an automatic deploy on Vercel.

---

## Branches

| Branch | Purpose |
|---|---|
| `main` | Stable production release |
| `develop` | Active development integration |
| `feature/frontend` | Frontend-specific changes |
| `feature/backend` | Backend-specific changes |

### Workflow

```
feature/frontend ──┐
                   ├──> develop ──> main
feature/backend ───┘
```

1. Work on `feature/*` branches
2. Merge into `develop` when ready
3. Merge `develop` into `main` for releases

---

## API Endpoints

### Math (`/api/math/`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/solve` | Solve equations |
| POST | `/differentiate` | Compute derivatives |
| POST | `/integrate` | Definite and indefinite integrals |
| POST | `/simplify` | Simplify expressions |
| POST | `/limit` | Compute limits |
| POST | `/series` | Series expansion |
| POST | `/ode` | Ordinary differential equations |
| POST | `/matrix` | Matrix operations |
| POST | `/plot` | Generate plot data |

### Physics (`/api/physics/`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/projectile` | Projectile motion |
| POST | `/shm` | Simple harmonic motion |
| POST | `/pendulum` | Simple pendulum |
| POST | `/wave` | 1D wave equation |
| POST | `/electric-field` | 2D electric field |
| POST | `/orbital` | Orbital mechanics |

### AI (`/api/ai/`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/explain` | Step-by-step explanation |
| POST | `/exercises` | Generate exercises |
| POST | `/validate-proof` | Validate proofs |

---

## License

MIT License - Free to use, modify, and distribute.

---

**Created by [CyberSecurityUP](https://github.com/CyberSecurityUP)**
