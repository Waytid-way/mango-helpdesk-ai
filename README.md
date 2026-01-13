# 🤖 Mango Helpdesk AI

<div align="center">

![Status](https://img.shields.io/badge/Status-Demo%20Ready-success)
![Architecture](https://img.shields.io/badge/Architecture-WUT%20%2B%20WAY-blue)
![Interview](https://img.shields.io/badge/Interview-Jan%2015%2C%202026-orange)

**AI-Powered Helpdesk System for Mango Consultant**  
*Revolutionizing support with Thai language RAG and safety-first business rules*

[Live Demo](#-live-demo) • [Architecture](#-architecture) • [Installation](#-installation) • [Features](#-key-features)

</div>

---

## 📋 Executive Summary

Mango Helpdesk AI เป็นระบบ AI Chatbot ที่ออกแบบมาเพื่อแก้ปัญหา **4 ชั่วโมงเวลาตอบกลับ** และ **60% คำถามซ้ำซาก** ที่เกิดขึ้นใน Support Team ของ Mango Consultant (ลูกค้า 600-800 บริษัท)

### Problem We Solve
- **Long Response Time:** 4 hours average → Target: <1 minute
- **Repetitive Queries:** 60% are FAQ (Password, VPN, Leave) → Automate
- **High Cost:** 200K THB/month operation cost → Reduce by 60%

### Our Solution
**WUT + WAY Architecture** - A safety-first RAG system with:
- **WUT Orchestrator:** Smart classifier + business rule engine
- **WAY RAG Engine:** Thai language vector search + GPT-3.5
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
│  │  LLM (GPT-3.5)          │ │ → Generate answer
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
# Edit .env and add your OPENAI_API_KEY

# Run server
python -m uvicorn app.main:app --reload --port 8000
```

Access:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## Key Features

### **Thai Language Support**
- Native Thai language understanding
- Context-aware responses
- Professional communication style

### **Intelligent Classification**
- Auto-detect department (IT, HR, Accounting)
- Intent recognition (Question, Action Request)
- Urgency level assessment

### **RAG-Powered Answers**
- Vector similarity search (Qdrant)
- Knowledge base with 100+ documents
- Confidence scoring for reliability

### **Safety Mechanisms**
- **Hard Block:** Financial approvals require human
- **Soft Escalation:** Low confidence queries
- **Audit Trail:** Full logging for compliance

### **Real-time Analytics**
- Live request counter
- Auto-resolve rate tracking
- Cost savings calculator
- Developer mode (JSON payload inspection)

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
2. Watch **System Logs** (left panel) for real-time processing
3. Toggle **Dev Mode** (top-right) to see JSON payloads
4. Check **Live Stats** for metrics

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
- **Vector DB:** Qdrant
- **LLM:** OpenAI GPT-3.5 Turbo
- **Auth:** (Planned) JWT

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

### Phase 1: POC (Current)
- [x] Frontend presentation layer
- [x] Simulated WUT/WAY logic
- [x] 3-scenario demo
- [x] Developer mode

### Phase 2: Backend Integration (Next)
- [ ] Real FastAPI endpoints
- [ ] Qdrant vector search
- [ ] OpenAI GPT-3.5 integration
- [ ] User authentication

### Phase 3: Production Ready
- [ ] Load testing
- [ ] Multi-language support (EN)
- [ ] Admin dashboard
- [ ] Analytics & reporting

---

## Interview Highlights

### Why This Project Stands Out

1. **🎯 Real Business Impact**
   - Solves 60% bottleneck with measurable ROI
   - Direct cost savings: 120K THB/month

2. **🛡️ Safety-First Architecture**
   - Risk mitigation for financial actions
   - Compliance-ready with audit trails

3. **🏗️ Scalable Design**
   - Clean separation (WUT/WAY)
   - Microservices-ready
   - Easy to add new departments

4. **🇹🇭 Thai Language Excellence**
   - Native understanding (not translation)
   - Cultural context awareness

---

## 👥 Team

**WUT & WAY Team**  
Prepared for Mango Consultant Interview - January 15, 2026

---

## 📄 License

This project is created for demonstration purposes as part of a job interview process.

---

## Acknowledgements

- Mango Consultant for the opportunity
- OpenAI for GPT-3.5 API
- Qdrant team for vector database
- React & FastAPI communities

---

<div align="center">

**Built for Mango Consultant**

*Revolutionizing support, one query at a time*

</div>
