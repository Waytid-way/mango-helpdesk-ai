# Mango Helpdesk AI

<div align="center">

![Paranoid Test Suite](https://github.com/Waytid-way/mango-helpdesk-ai/workflows/💀%20Paranoid%20Test%20Suite%20(0.01%25%20Error%20Rate)/badge.svg)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Python](https://img.shields.io/badge/python-3.10%20%7C%203.11%20%7C%203.12-blue)
![Node](https://img.shields.io/badge/node-18%20%7C%2020%20%7C%2021-green)
![Security](https://img.shields.io/badge/Security-Hardened-brightgreen)

**Helpdesk System for Mango Consultant**  
*Revolutionizing support with Thai language RAG and safety-first business rules*

> 🎯 **Target Error Rate:** 0.01% | 💀 **Paranoid Mode:** Activated | 🛡️ **XSS Protected**

[Live Demo](#live-demo) • [Architecture](#architecture) • [Installation](#installation) • [Features](#key-features)

</div>

---

## Executive Summary

Mango Helpdesk AI เป็นระบบ Chatbot ที่ออกแบบมาเพื่อแก้ปัญหา **4 ชั่วโมงเวลาตอบกลับ** และ **60% คำถามซ้ำซาก** ที่เกิดขึ้นใน Support Team ของ Mango Consultant (ลูกค้า 600-800 บริษัท)

### Problem We Solve
- **Long Response Time:** 4 hours average → Target: <1 minute
- **Repetitive Queries:** 60% are FAQ (Password, VPN, Leave) → Automate
- **High Cost:** 200K THB/month operation cost → Reduce by 60%

### Our Solution
**WUT + WAY Architecture** - A safety-first RAG system with:
- **WUT Orchestrator:** Smart classifier + business rule engine
- **WAY RAG Engine:** Thai language vector search + Groq LLM (Llama 3.3 70B)
- **Human-in-the-loop:** Critical actions (Finance/HR) require approval

---

## Architecture

```
┌─────────────┐
│   User      │
│  (Frontend) │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────┐
│   WUT Orchestrator           │
│  ┌─────────────────────────┐ │
│  │  Classifier             │ │ → Department, Intent, Urgency
│  └─────────────────────────┘ │
│  ┌─────────────────────────┐ │
│  │  Decision Engine        │ │ → Business Rules & Safety
│  └─────────────────────────┘ │
└──────────────┬───────────────┘
               │
               ↓
┌──────────────────────────────┐
│   WAY RAG Engine             │
│  ┌─────────────────────────┐ │
│  │  Vector Search (Qdrant) │ │ → Find relevant docs
│  └─────────────────────────┘ │
│  ┌─────────────────────────┐ │
│  │  LLM (Groq)             │ │ → Generate answer
│  └─────────────────────────┘ │
└──────────────────────────────┘
```

### Safety-First Design
| Action Type | Confidence | Decision |
|------------|-----------|----------|
| General Query | >70% | AUTO_RESOLVE |
| General Query | <70% | ESCALATE to human |
| HR Action | Any | CREATE_TICKET (require approval) |
| **Accounting Action** | **Any** | **CRITICAL_ESCALATE** (hard block) |

---

## Installation

### Prerequisites
- Node.js 18+ (for Frontend)
- Python 3.10+ (for Backend)
- Git

### Quick Start (Frontend Only - Demo Mode)

```bash
# Clone repository
git clone https://github.com/Waytid-way/mango-helpdesk-ai.git
cd mango-helpdesk-ai

# Install frontend dependencies
cd frontend
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the demo!

### Full Stack Setup (Frontend + Backend)

#### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```

#### 2. Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Run server
python -m uvicorn app.main:app --reload --port 8000
```

Access:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## Key Features

### Thai Language Support
- Native Thai language understanding
- Context-aware responses
- Professional communication style

### Intelligent Classification
- Auto-detect department (IT, HR, Accounting)
- Intent recognition (Question, Action Request)
- Urgency level assessment

### RAG-Powered Answers
- Vector similarity search (Qdrant)
- Knowledge base with 100+ documents
- Confidence scoring for reliability

### Safety Mechanisms
- **Hard Block:** Financial approvals require human
- **Soft Escalation:** Low confidence queries
- **Audit Trail:** Full logging for compliance

### Developer Tools
- **Developer mode** - JSON payload inspection ✅
- Real-time analytics (planned)
- Request metrics dashboard (planned)

### Conversational Context (NEW)
- **Chat History Sidebar:** Persistent storage using localStorage
- **Context-Aware RAG:** AI remembers previous conversation turns
- **Session Management:** Create, switch, and delete chat sessions
- **Token Safety:** Limits context to last 6 messages

---

## Live Demo

The demo includes **3 pre-configured scenarios**:

1. **Auto-Resolve (IT):** "วิธีทำเปลี่ยนหมาย"
   - Confidence: 92%
   - Action: AUTO_RESOLVE
   - Response: <1 second

2. **Ticket Creation (HR):** "ขอลาพักร้อน 5 วัน"
   - Confidence: 88%
   - Action: CREATE_TICKET
   - Escalates to HR with tracking number

3. **Safety Stop (Accounting):** "อนุมัติคืน 1 ล้านบาท"
   - Confidence: Forced to 30%
   - Action: CRITICAL_ESCALATE
   - Hard block with security warning

### How to Use Demo
1. Click scenario chips or type custom query
2. Watch **SYSTEM_LOGS** (left panel) for real-time processing
3. Toggle **Dev Mode** (top-right) to see JSON payloads
4. Monitor logs for AI processing steps

---

## Projected Business Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Response Time** | 4 hours | <1 minute | **240x faster** |
| **Auto-Resolution** | 0% | **60%** | +60% |
| **Monthly Cost** | 200K THB | 80K THB | **120K saved** |
| **Payback Period** | - | **2.5 months** | Fast ROI |

---

## Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Animations:** Framer Motion

### Backend
- **Framework:** FastAPI
- **Vector DB:** Qdrant Cloud
- **LLM:** Groq (Llama 3.3 70B) - Free & Fast
- **Embedding:** FastEmbed (BAAI/bge-small-en)
- **Hosting:** Render.com

### Infrastructure
- **Deployment:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (Planned)
- **Monitoring:** (Planned) Prometheus + Grafana

---

## Project Structure

```
mango-helpdesk-ai/
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── App.jsx        # Main presentation component
│   │   ├── components/    # Reusable components (future)
│   │   └── assets/        # Images, icons
│   ├── package.json
│   └── vite.config.js
│
├── backend/               # FastAPI
│   ├── app/
│   │   ├── main.py        # API entry point
│   │   ├── wut_orchestrator/  # Classifier + Decision Engine
│   │   ├── way_rag/           # RAG Engine
│   │   └── data/              # Knowledge base JSON
│   ├── requirements.txt
│   └── .env.example
│
├── docs/                  # Documentation
│   └── architecture_diagram.png
│
├── .gitignore
├── README.md
└── docker-compose.yml     # (Optional) One-command deployment
```

---

## Development Roadmap

### Phase 1: POC (Completed)
- [x] Frontend presentation layer
- [x] Simulated WUT/WAY logic
- [x] 3-scenario demo
- [x] Developer mode

### Phase 2: Backend Integration (Completed)
- [x] Real FastAPI endpoints
- [x] Qdrant vector search
- [x] Groq LLM integration
- [x] Chat history & context persistence
- [x] Session management sidebar

### Phase 3: Production Ready (Next)
- [ ] User authentication
- [ ] Load testing
- [ ] Multi-language support (EN)
- [ ] Admin dashboard
- [ ] Analytics & reporting

---

## Interview Highlights

### Why This Project Stands Out

1. **Real Business Impact**
   - Solves 60% bottleneck with measurable ROI
   - Direct cost savings: 120K THB/month

2. **Safety-First Architecture**
   - Risk mitigation for financial actions
   - Compliance-ready with audit trails

3. **Scalable Design**
   - Clean separation (WUT/WAY)
   - Microservices-ready
   - Easy to add new departments

4. **Thai Language Excellence**
   - Native understanding (not translation)
   - Cultural context awareness

---

## Team

**WUT & WAY Team**  
Prepared for Mango Consultant Interview - January 15, 2026

---

---

## 🔧 Known Issues & Quick Fixes

### Backend
- **ERROR:** `ConnectionError: Cannot connect to Qdrant`
  - **Fix:** `docker run -p 6333:6333 qdrant/qdrant:latest`

- **ERROR:** `GROQ_API_KEY not found`
  - **Fix:** Create `backend/.env` with `GROQ_API_KEY=gsk_your_key`

- **ERROR:** `Vector size mismatch`
  - **Fix:** Delete collection `curl -X DELETE http://localhost:6333/collections/mango_kb` and re-run ingestion

### Frontend
- **ERROR:** `Test timeout of 5000ms exceeded`
  - **Fix:** Increase `testTimeout` in `vite.config.js` to 20000

- **ERROR:** `fetch is not defined`
  - **Fix:** Add fetch polyfill in `src/test/setup.js`

### For complete troubleshooting guide, see:
📘 [Troubleshooting Guide](temp_folder/📘%20Troubleshooting%20Guide%20Book%20-%20Paranoid%20Test%20Suite.md)

---

## License

This project is created for demonstration purposes as part of a job interview process.

---

## Acknowledgements

- Mango Consultant for the opportunity
- Groq for Llama 3.3 70B LLM API
- Qdrant team for vector database
- React & FastAPI communities

---

<div align="center">

**Built for Mango Consultant**

*Revolutionizing support, one query at a time*

</div>
