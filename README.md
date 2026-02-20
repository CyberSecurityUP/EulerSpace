# EulerSpace

**Laboratorio Digital de Matematica, Fisica & Ciencia da Computacao**

Plataforma educacional interativa com suporte a multiplos idiomas (EN/PT/ES), simulacoes de fisica, laboratorios de criptografia e computacao quantica, renderizacao LaTeX em tempo real e assistente IA.

---

## Funcionalidades

### Aprendizado
- **Academia** - Curriculo completo de matematica e fisica com teoria, exercicios e dicas (20 licoes, 433 blocos de teoria, 100 exercicios)
- **Aprenda do Zero** - Fundamentos interativos com tabuada, calculadora, dicas e validacao de respostas
- **Formulas** - Referencia completa de formulas matematicas e fisicas

### Laboratorios de Ciencia
- **Lab de Fisica** - 6 simulacoes: projetil, MHS, pendulo, ondas, campo eletrico, orbital
- **Lab de Criptografia** - Cifras classicas (Caesar, Vigenere), simetrica (AES), assimetrica (RSA, Diffie-Hellman), hashing, analise de seguranca
- **Lab Quantico** - Qubits e esfera de Bloch, portas quanticas, circuitos (Bell, GHZ, teletransporte), algoritmos (Grover, Shor, BB84)

### Ferramentas
- **Calculadora** - Motor simbolico com SymPy (derivadas, integrais, EDOs, matrizes)
- **Editor LaTeX** - Editor com preview em tempo real usando KaTeX
- **Graficos** - Visualizacao interativa com Plotly.js
- **Assistente IA** - Explicacoes passo a passo, geracao de exercicios

### Extras
- **Pesquisa** - Ferramentas para pesquisa matematica
- **Desafios** - Problemas no estilo olimpiada

---

## Stack Tecnologico

### Frontend
| Tecnologia | Versao | Uso |
|---|---|---|
| React | 19.2 | UI Framework |
| Vite | 7.3 | Build tool & dev server |
| React Router | 7.13 | Navegacao SPA |
| KaTeX | 0.16 | Renderizacao LaTeX |
| Plotly.js | 3.3 | Graficos interativos |
| Axios | 1.13 | Cliente HTTP |
| CodeMirror | 5.65 | Editor de codigo |

### Backend
| Tecnologia | Versao | Uso |
|---|---|---|
| FastAPI | 0.115 | API REST |
| SymPy | 1.13 | Motor matematico simbolico |
| NumPy | 1.26 | Computacao numerica |
| SciPy | 1.13 | Simulacoes cientificas |
| Uvicorn | - | Servidor ASGI |

### i18n
Suporte completo a 3 idiomas: **English**, **Portugues**, **Espanol**

---

## Estrutura do Projeto

```
EulerSpace/
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── pages/              # 13 paginas (Dashboard, Academy, CryptoLab, QuantumLab, etc.)
│   │   ├── components/         # Sidebar, LatexRenderer
│   │   ├── data/               # Curriculo, exercicios, traducoes de conteudo
│   │   ├── i18n/               # Sistema de internacionalizacao (context + translations)
│   │   ├── services/           # API client (axios)
│   │   ├── styles/             # CSS global
│   │   ├── App.jsx             # Router principal
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json             # Config de deploy Vercel
│
├── backend/                     # FastAPI + Python
│   ├── api/
│   │   └── routes.py           # 17 endpoints REST
│   ├── engine/
│   │   └── symbolic.py         # Motor SymPy (solve, diff, integrate, etc.)
│   ├── physics/
│   │   └── simulator.py        # Simulador (projetil, MHS, pendulo, ondas, etc.)
│   ├── ai/
│   │   └── assistant.py        # Assistente IA
│   ├── main.py                 # App FastAPI
│   └── requirements.txt
│
├── prompt.md                    # Visao e roadmap do projeto
└── README.md
```

---

## Instalacao Local

### Pre-requisitos
- Node.js >= 18
- Python >= 3.10
- npm ou yarn

### Frontend

```bash
cd frontend
npm install
npm run dev
# Acesse http://localhost:5173
```

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate    # Linux/Mac
# venv\Scripts\activate     # Windows
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
# API disponivel em http://localhost:8000
```

### Variaveis de Ambiente (Frontend)

Crie um arquivo `.env` em `frontend/`:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## Deploy na Vercel

### Passo 1: Fork ou clone o repositorio

```bash
git clone git@github.com:CyberSecurityUP/EulerSpace.git
```

### Passo 2: Crie uma conta na Vercel

Acesse [vercel.com](https://vercel.com) e faca login com sua conta GitHub.

### Passo 3: Importe o projeto

1. No dashboard da Vercel, clique em **"Add New..."** > **"Project"**
2. Selecione o repositorio **EulerSpace** da lista
3. Configure as opcoes de build:

| Campo | Valor |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

4. Em **Environment Variables**, adicione:

| Variavel | Valor |
|---|---|
| `VITE_API_URL` | URL do seu backend (ex: `https://seu-backend.onrender.com/api`) |

5. Clique em **"Deploy"**

### Passo 4: Configure o dominio (opcional)

Na aba **"Settings"** > **"Domains"**, adicione seu dominio personalizado.

### Passo 5: Deploy do Backend

O backend (FastAPI) precisa de hospedagem separada. Opcoes recomendadas:

#### Render (Recomendado - Gratis)
1. Acesse [render.com](https://render.com)
2. Crie um **Web Service** conectado ao repo
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Copie a URL gerada e atualize `VITE_API_URL` na Vercel

#### Railway
1. Acesse [railway.app](https://railway.app)
2. Crie projeto a partir do GitHub
3. Configure o diretorio raiz como `backend`
4. Railway detecta automaticamente o Python

#### Docker (Self-hosted)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/ .
RUN pip install -r requirements.txt
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Passo 6: Redeploy automatico

Cada `git push` para a branch conectada faz deploy automatico na Vercel.

---

## Branches

| Branch | Proposito |
|---|---|
| `main` | Versao estavel de producao |
| `develop` | Integracao de desenvolvimento ativo |
| `feature/frontend` | Mudancas especificas do frontend |
| `feature/backend` | Mudancas especificas do backend |

### Fluxo de trabalho

```
feature/frontend ──┐
                   ├──> develop ──> main
feature/backend ───┘
```

1. Trabalhe nas branches `feature/*`
2. Merge para `develop` quando pronto
3. Merge `develop` para `main` para releases

---

## API Endpoints

### Matematica (`/api/math/`)
| Metodo | Endpoint | Descricao |
|---|---|---|
| POST | `/solve` | Resolver equacoes |
| POST | `/differentiate` | Derivadas |
| POST | `/integrate` | Integrais (definidas e indefinidas) |
| POST | `/simplify` | Simplificar expressoes |
| POST | `/limit` | Calcular limites |
| POST | `/series` | Expansao em serie |
| POST | `/ode` | Equacoes diferenciais |
| POST | `/matrix` | Operacoes com matrizes |
| POST | `/plot` | Gerar dados para graficos |

### Fisica (`/api/physics/`)
| Metodo | Endpoint | Descricao |
|---|---|---|
| POST | `/projectile` | Movimento de projetil |
| POST | `/shm` | Movimento harmonico simples |
| POST | `/pendulum` | Pendulo simples |
| POST | `/wave` | Equacao de onda 1D |
| POST | `/electric-field` | Campo eletrico 2D |
| POST | `/orbital` | Mecanica orbital |

### IA (`/api/ai/`)
| Metodo | Endpoint | Descricao |
|---|---|---|
| POST | `/explain` | Explicacao passo a passo |
| POST | `/exercises` | Gerar exercicios |
| POST | `/validate-proof` | Validar demonstracoes |

---

## Licenca

MIT License - Livre para uso, modificacao e distribuicao.

---

**Criado por [CyberSecurityUP](https://github.com/CyberSecurityUP)**
