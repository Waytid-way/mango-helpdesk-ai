import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  Search, 
  MessageSquare, 
  Zap, 
  FileText, 
  Code, 
  Terminal,
  ArrowRight,
  ChevronDown,
  Layers,
  Cpu,
  Send,
  Bot,
  User,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  DollarSign,
  BarChart3,
  Users,
  Eye,
  EyeOff,
  Activity,
  Lock
} from 'lucide-react';

// Custom Hook for Number Counter
const useCounter = (end, duration = 2000, start = 0, shouldStart = false) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * (end - start) + start));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };

    animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [end, duration, start, shouldStart]);

  return count;
};

const App = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const initialMessage = { 
    role: 'assistant', 
    content: 'สวัสดีครับ ผมคือ AI Helpdesk สำหรับ Mango Consultant พร้อมช่วยเหลือครับ (ระบบจำลอง)',
    type: 'greeting'
  };

  // Chat Demo States
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ragLogs, setRagLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState({ state: 'IDLE', confidence: 0, dept: '-' });
  
  // Live Stats & Dev Mode
  const [liveStats, setLiveStats] = useState({ total: 0, resolved: 0, escalated: 0, costSaved: 0 });
  const [devMode, setDevMode] = useState(false);
  
  const messagesEndRef = useRef(null);
  const logsEndRef = useRef(null);
  const heroRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Counters for Impact Section
  const impactVisible = activeStep === 4;
  const countAutoResolve = useCounter(60, 2000, 0, impactVisible);
  const countCost = useCounter(120, 2500, 0, impactVisible);
  const countRoi = useCounter(25, 2000, 0, impactVisible); // x10 for decimal handling

  // Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'problem', 'solution', 'demo', 'impact'];
      const viewportHeight = window.innerHeight;
      
      sections.forEach((id, index) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= -viewportHeight * 0.3 && rect.top <= viewportHeight * 0.6) {
            setActiveStep(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToBottom = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom(messagesEndRef);
  }, [messages]);

  useEffect(() => {
    scrollToBottom(logsEndRef);
  }, [ragLogs]);

  // --- LOGIC: Simulated WUT + WAY Architecture ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);
    setRagLogs([]); 
    setSystemStatus({ state: 'PROCESSING', confidence: 0, dept: 'Detecting...' });

    // Live Stats Update
    setLiveStats(prev => ({ ...prev, total: prev.total + 1 }));

    // --- STEP 1: WUT Classifier ---
    await addLog("WUT: Receiving query...", 200);
    
    let dept = "General";
    let intent = "question";
    let urgency = "low";
    let scenario = "unknown";

    if (userMsg.includes("รหัสผ่าน") || userMsg.includes("password") || userMsg.includes("อีเมล")) {
      dept = "IT";
      scenario = "password_reset";
    } else if (userMsg.includes("ลา") || userMsg.includes("vacation") || userMsg.includes("leave")) {
      dept = "HR";
          } else if (userMsg.includes("vpn") || userMsg.includes("เชื่อมต่อ") || userMsg.includes("remote work")) {
      dept = "IT";
      scenario = "vpn_issue";
    } else if (userMsg.includes("อีเมลเต็ม") || userMsg.includes("storage") || userMsg.includes("mailbox")) {
      dept = "IT";
      scenario = "email_storage";
    } else if (userMsg.includes("ติดตั้ง") || userMsg.includes("install") || userMsg.includes("software") || userMsg.includes("โปรแกรม")) {
      dept = "IT";
      intent = "action_request";
      scenario = "software_install";
          } else if (userMsg.includes("สลิปเงินเดือน") || userMsg.includes("payslip") || userMsg.includes("เงินเดือน")) {
      dept = "HR";
      scenario = "payslip_request";
    } else if (userMsg.includes("ขอหนังสือรับรอง") || userMsg.includes("certificate") || userMsg.includes("employment letter")) {
      dept = "HR";
      intent = "action_request";
      scenario = "work_certificate";
    } else if (userMsg.includes("ทดลองงาน") || userMsg.includes("probation") || userMsg.includes("ผ่านโปร")) {
      dept = "HR";
      scenario = "probation_question";
          } else if (userMsg.includes("เบิกค่าใช้จ่าย") || userMsg.includes("expense") || userMsg.includes("claim")) {
      dept = "Accounting";
      scenario = "expense_claim";
    } else if (userMsg.includes("สถานะชำระเงิน") || userMsg.includes("invoice") || userMsg.includes("payment") || userMsg.includes("จ่ายเงิน")) {
      dept = "Accounting";
      intent = "action_request";
      urgency = "high";
      scenario = "invoice_payment";
    } else if (userMsg.includes("จองห้องประชุม") || userMsg.includes("meeting room") || userMsg.includes("book room")) {
      dept = "General";
      scenario = "meeting_room";
    } else if (userMsg.includes("ที่จอดรถ") || userMsg.includes("parking") || userMsg.includes("บัตรจอด")) {
      dept = "General";
      intent = "action_request";
      scenario = "parking_pass";
      intent = "action_request";
      scenario = "leave_request";
    } else if (userMsg.includes("งบ") || userMsg.includes("อนุมัติ") || userMsg.includes("approve") || userMsg.includes("เงิน")) {
      dept = "Accounting";
      intent = "action_request";
      urgency = "high";
      scenario = "budget_approval";
    }

    setSystemStatus(prev => ({ ...prev, dept }));
    await addLog(`WUT Classifier: Dept=${dept} | Intent=${intent} | Urgency=${urgency}`, 600);

    // --- STEP 2: WAY RAG Engine ---
    await addLog("WAY: Vectorizing query...", 1000);
    await addLog(`WAY: Searching Qdrant (top_k=3)...`, 1400);

    let ragResponse = "";
    let confidence = 0.0;
    let docRef = "";
    let action = "ANSWER";
    let vectorScore = 0.0;

    if (scenario === "password_reset") {
      await addLog(`WAY: Found 'IT-001: Password Reset Procedure'`, 1800);
      ragResponse = "คุณสามารถรีเซ็ตรหัสผ่านอีเมลได้ที่ portal.mango.co.th โดยเลือกเมนู 'Forgot Password' และยืนยันตัวตนผ่าน OTP ที่ส่งไปเบอร์มือถือครับ";
      confidence = 0.92;
      vectorScore = 0.915;
      docRef = "IT-001";
    } else if (scenario === "leave_request") {
      await addLog(`WAY: Found 'HR-050: Leave Policy'`, 1800);
      ragResponse = "สำหรับการลาพักร้อน คุณต้องกรอกแบบฟอร์มในระบบ Mango HR และรอหัวหน้าอนุมัติครับ (ผมจะเปิด Ticket ให้ HR ดำเนินการต่อนะครับ)";
      confidence = 0.88;
      vectorScore = 0.876;
      docRef = "HR-050";
    } else if (scenario === "budget_approval") {
      await addLog(`WAY: Found 'ACC-101: Budget Approval'`, 1800);
      ragResponse = "การอนุมัติงบประมาณเกิน 500,000 บาท จำเป็นต้องได้รับการอนุมัติจาก CFO โดยตรงและต้องมีเอกสาร TOR แนบครับ";
      confidence = 0.85; 
      vectorScore = 0.842;
      docRef = "ACC-101";
        } else if (scenario === "vpn_issue") {
      await addLog(`WAY: Found 'IT-002: VPN Connection Guide'`, 1800);
      ragResponse = "หาก VPN เชื่อมไม่ได้ ลอง 1) Restart Router 2) ตรวจสอบ username/password 3) Clear VPN cache หรือติดต่อ IT Support: ext 1234 ครับ";
      confidence = 0.89;
      vectorScore = 0.885;
      docRef = "IT-002";
    } else if (scenario === "email_storage") {
      await addLog(`WAY: Found 'IT-003: Email Storage Management'`, 1800);
      ragResponse = "อีเมลเต็มแก้ไขได้โดย 1) ลบอีเมลเก่า 2) Archive ไป PST file 3) ขอเพิ่ม quota ได้ที่ IT Helpdesk ครับ (max 10GB/user)";
      confidence = 0.91;
      vectorScore = 0.908;
      docRef = "IT-003";
    } else if (scenario === "software_install") {
      await addLog(`WAY: Found 'IT-004: Software Installation Policy'`, 1800);
      ragResponse = "การติดตั้งโปรแกรมต้องขออนุมัติจาก IT Manager ก่อนครับ (ผมจะเปิด Ticket ให้ IT ดำเนินการต่อนะครับ)";
      confidence = 0.86;
      vectorScore = 0.858;
      docRef = "IT-004";
        } else if (scenario === "payslip_request") {
      await addLog(`WAY: Found 'HR-051: Payslip Access'`, 1800);
      ragResponse = "สลิปเงินเดือน download ได้ที่ Mango HR Portal > Payroll > Payslip History ครับ (ถ้าเข้าไม่ได้ ติดต่อ HR ext 2001)";
      confidence = 0.93;
      vectorScore = 0.925;
      docRef = "HR-051";
    } else if (scenario === "work_certificate") {
      await addLog(`WAY: Found 'HR-052: Certificate Request'`, 1800);
      ragResponse = "ขอหนังสือรับรองแล้วนะครับ (ผมจะเปิด Ticket ให้ HR ออกเอกสารให้ ใช้เวลา 3-5 วันทำการครับ)";
      confidence = 0.87;
      vectorScore = 0.871;
      docRef = "HR-052";
    } else if (scenario === "probation_question") {
      await addLog(`WAY: Found 'HR-053: Probation Policy'`, 1800);
      ragResponse = "บริษัทมีระยะทดลองงาน 120 วัน ประเมินผลโดย Manager ทุก 60/90/120 วัน ผ่านโปรจะได้สิทธิ์เต็มที่ครับ";
      confidence = 0.90;
      vectorScore = 0.898;
      docRef = "HR-053";
        } else if (scenario === "expense_claim") {
      await addLog(`WAY: Found 'ACC-102: Expense Claim Process'`, 1800);
      ragResponse = "เบิกค่าใช้จ่ายได้ที่ระบบ Expense Cloud > Submit Claim + แนบใบเสร็จ รอ Manager approve แล้วจ่ายใน 7 วันทำการครับ";
      confidence = 0.88;
      vectorScore = 0.879;
      docRef = "ACC-102";
    } else if (scenario === "invoice_payment") {
      await addLog(`WAY: Found 'ACC-103: Invoice Payment Inquiry'`, 1800);
      ragResponse = "สถานะการชำระเงิน Invoice ต้องตรวจสอบโดย Accounting โดยตรงครับ (ข้อมูลทางการเงินต้องได้รับการตรวจสอบจากมนุษย์)";
      confidence = 0.82;
      vectorScore = 0.816;
      docRef = "ACC-103";
    } else if (scenario === "meeting_room") {
      await addLog(`WAY: Found 'OPS-001: Meeting Room Booking'`, 1800);
      ragResponse = "จองห้องประชุมได้ที่ Mango Office System > Room Booking ดู availability แล้ว book เลยครับ (มีห้อง A-F รองรับ 6-20 คน)";
      confidence = 0.94;
      vectorScore = 0.938;
      docRef = "OPS-001";
    } else if (scenario === "parking_pass") {
      await addLog(`WAY: Found 'OPS-002: Parking Pass Request'`, 1800);
      ragResponse = "ขอบัตรจอดรถแล้วนะครับ (ผมจะเปิด Ticket ให้ Admin ออกบัตรให้ รับได้ใน 1-2 วันทำการครับ)";
      confidence = 0.85;
      vectorScore = 0.849;
      docRef = "OPS-002";

    setSystemStatus(prev => ({ ...prev, confidence }));
    await addLog(`WAY: Generated Answer (Conf: ${confidence})`, 2200);

          } else {
      ragResponse = "ขออภัยครับ ข้อมูลนี้ไม่อยู่ใน Knowledge Base ของเรา (Demo Scope: IT, HR, Accounting)";
      confidence = 0.45;
      vectorScore = 0.412;
    }
    // --- STEP 3: WUT Decision Engine & Business Rules ---
    await addLog("WUT: Evaluating Decision Rules...", 2500);

    let finalResponse = ragResponse;
    let finalType = "answer";

    if (confidence < 0.70) {
        action = "ESCALATE";
        finalResponse = "ผมไม่แน่ใจในข้อมูลส่วนนี้ เพื่อความถูกต้อง ผมขอส่งเรื่องให้เจ้าหน้าที่ Support ติดต่อกลับนะครับ";
        finalType = "escalate";
        setLiveStats(prev => ({ ...prev, escalated: prev.escalated + 1 }));
        await addLog(`RULE: Low Confidence (<0.7) -> ESCALATE`, 2700);
    } 
    else if (dept === "Accounting" && (userMsg.includes("อนุมัติ") || userMsg.includes("approve"))) {
        action = "CRITICAL_ESCALATE";
        finalResponse = "⚠️ คำเตือน: ระบบ AI ไม่สามารถดำเนินการเรื่องการเงินได้ เคสนี้ถูกส่งต่อให้แผนกบัญชีเป็น 'High Priority' เรียบร้อยแล้วครับ";
        finalType = "alert";
        // Force confidence down visually for safety demonstration
        setSystemStatus(prev => ({ ...prev, confidence: 0.30 })); 
        setLiveStats(prev => ({ ...prev, escalated: prev.escalated + 1 }));
        await addLog(`SAFETY OVERRIDE: Accounting Action -> FORCE ESCALATE`, 2700);
    }
    else if (intent === "action_request" && dept === "HR") {
        action = "CREATE_TICKET";
        finalResponse = `รับเรื่องขอลาพักร้อนเรียบร้อยครับ\nTicket created: HR-${Math.floor(Math.random()*1000)}\nเจ้าหน้าที่ HR จะตรวจสอบสิทธิ์วันลาและแจ้งผลกลับภายใน 24 ชม. ครับ`;
        finalType = "ticket";
        setLiveStats(prev => ({ ...prev, resolved: prev.resolved + 1, costSaved: prev.costSaved + 50 })); 
        await addLog(`RULE: HR Action -> CREATE TICKET`, 2700);
    } 
    else {
        action = "AUTO_RESOLVE";
        setLiveStats(prev => ({ ...prev, resolved: prev.resolved + 1, costSaved: prev.costSaved + 50 }));
        await addLog(`RULE: High Confidence -> AUTO RESOLVE`, 2700);
    }

    setIsTyping(false);
    
    // Construct Dev Mode Payload
    const debugPayload = {
       "request_id": `req_${Date.now()}`,
       "timestamp": new Date().toISOString(),
       "input": {
          "text": userMsg,
          "language": "th"
       },
       "classifier": {
          "department": dept,
          "urgency": urgency
       },
       "rag_engine": {
          "retrieved_doc": docRef,
          "vector_similarity": vectorScore,
          "tokens_used": 150
       },
       "decision_engine": {
          "rule_triggered": action,
          "safety_lock": action === "CRITICAL_ESCALATE"
       }
    };

    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: finalResponse, 
      type: finalType,
      debug: debugPayload,
      meta: { confidence: action === "CRITICAL_ESCALATE" ? 0.30 : confidence, doc: docRef, action }
    }]);
    setSystemStatus({ state: 'IDLE', confidence: 0, dept: '-' });
  };

  const addLog = (text, delay) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setRagLogs(prev => [...prev, { time: new Date().toLocaleTimeString('th-TH'), text }]);
        resolve();
      }, delay); 
    });
  };

  const handleReset = () => {
    setMessages([initialMessage]); // Restore greeting
    setRagLogs([]); 
    setLiveStats({ total: 0, resolved: 0, escalated: 0, costSaved: 0 });
    setSystemStatus({ state: 'IDLE', confidence: 0, dept: '-' });
    setDevMode(false);
  };

  const handleChipClick = (q) => {
    setInput(q);
    inputRef.current?.focus(); 
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden relative">
      
      {/* Styles */}
      <style>{`
        @keyframes pulse-orange {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pop-in {
          animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        
        /* Stagger delays */
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }

        .glass-panel {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #1e293b 1px, transparent 1px),
                           linear-gradient(to bottom, #1e293b 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      {/* Navbar */}
      <nav className="fixed w-full z-50 glass-panel border-b-0 border-b-white/5 backdrop-blur-xl bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-white">Mango<span className="text-orange-400">Helpdesk</span></span>
          </div>
          
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
            {['Problem', 'Solution', 'Demo', 'Impact'].map((item, i) => (
               <button 
                 key={item} 
                 onClick={() => scrollToSection(item.toLowerCase())} 
                 className={`hover:text-orange-400 transition-colors ${activeStep === i + 1 ? 'text-white' : ''}`}
               >
                 {item}
               </button>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-500 border border-slate-700 px-3 py-1 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online v1.0.0
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" ref={heroRef} className="relative z-10 pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center min-h-[90vh] bg-grid-pattern overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f172a]/50 to-[#0f172a] pointer-events-none"></div>
        
        {/* Floating Icons Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Database className="absolute top-[20%] left-[10%] w-16 h-16 text-purple-500 animate-float delay-100" />
          <Zap className="absolute top-[15%] right-[15%] w-12 h-12 text-orange-500 animate-float delay-300" />
          <ShieldAlert className="absolute bottom-[30%] left-[20%] w-10 h-10 text-green-500 animate-float delay-500" />
          <Code className="absolute bottom-[20%] right-[10%] w-14 h-14 text-blue-500 animate-float delay-200" />
        </div>

        <div className="hero-item inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
          Presented by WUT & WAY Team
        </div>
        
        <h1 className="hero-item text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1] text-white max-w-4xl mx-auto animate-fade-in-up delay-100">
          Revolutionizing Support with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Intelligent RAG</span>
        </h1>
        
        <p className="hero-item max-w-2xl text-lg md:text-xl text-slate-400 mb-10 leading-relaxed mx-auto animate-fade-in-up delay-200">
          ระบบ Helpdesk AI ที่เข้าใจบริบทภาษาไทย ลดภาระงานซ้ำซ้อน และปลอดภัยด้วย Business Rules สำหรับ Mango Consultant
        </p>

        <div className="hero-item flex flex-col sm:flex-row gap-4 relative z-20 animate-fade-in-up delay-300">
          <button onClick={() => scrollToSection('demo')} className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 justify-center group hover:scale-105 active:scale-95">
            <Terminal className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 
            Try Live Demo
          </button>
          <button onClick={() => scrollToSection('solution')} className="px-8 py-4 glass-panel border-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 justify-center hover:scale-105 active:scale-95">
             View Architecture
          </button>
        </div>
        
        <div className="absolute bottom-10 animate-bounce text-slate-600">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Problem Statement */}
      <section id="problem" className="relative z-10 py-24 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Challenge at Mango Consultant</h2>
             <p className="text-slate-400">ลูกค้า 600-800 บริษัทสร้างปริมาณ Ticket มหาศาล</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 transition-all group hover:-translate-y-2 duration-300">
               <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                 <Clock className="w-7 h-7 text-red-500" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">4 Hours</h3>
               <p className="text-slate-400">Average Response Time<br/>ทำให้ลูกค้าไม่พอใจ</p>
             </div>
             <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 transition-all group hover:-translate-y-2 duration-300">
               <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                 <AlertTriangle className="w-7 h-7 text-orange-500" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">60% Repetitive</h3>
               <p className="text-slate-400">คำถามเดิมๆ ซ้ำซาก<br/>(Password, VPN, Leave)</p>
             </div>
             <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 transition-all group hover:-translate-y-2 duration-300">
               <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                 <DollarSign className="w-7 h-7 text-blue-500" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">200K THB/mo</h3>
               <p className="text-slate-400">Support Operation Cost<br/>ต้นทุนสูงแต่ประสิทธิภาพต่ำ</p>
             </div>
          </div>
        </div>
      </section>

      {/* Solution Architecture */}
      <section id="solution" className="relative z-10 py-24 px-6 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2">
                <span className="text-orange-400 font-bold tracking-widest text-sm uppercase mb-2 block">Our Solution</span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">WUT + WAY Architecture</h2>
                <div className="space-y-6">
                  <div className="flex gap-4 group cursor-default">
                    <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0 border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                      <Cpu className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">WUT (Orchestrator)</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        สมองส่วนหน้า (Frontend logic) ทำหน้าที่แยกแยะแผนก (Classifier) และตัดสินใจ (Decision Engine) ว่าจะตอบเองหรือส่งต่อให้คน
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 group cursor-default">
                     <div className="w-12 h-12 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0 border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                      <Database className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">WAY (RAG Engine)</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        สมองส่วนหลัง ค้นหาข้อมูลจาก Knowledge Base (Qdrant Vector DB) และสร้างคำตอบที่แม่นยำด้วย GPT-3.5
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 group cursor-default">
                     <div className="w-12 h-12 rounded-full bg-green-900/50 flex items-center justify-center shrink-0 border border-green-500/30 group-hover:scale-110 transition-transform duration-300">
                      <ShieldAlert className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">Safety First</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        กฎเหล็ก: ห้าม AI อนุมัติเรื่องเงินและ HR Action โดยเด็ดขาด ต้องผ่านคนเสมอ (Human-in-the-loop)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagram */}
              <div className="md:w-1/2 bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-3xl rounded-full group-hover:bg-orange-500/20 transition-colors duration-700"></div>
                <div className="relative z-10 flex flex-col items-center gap-4 text-sm font-mono">
                  
                  {/* User */}
                  <div className="p-3 bg-slate-700 rounded-lg border border-slate-600 w-48 text-center text-white shadow-lg">User (Frontend)</div>
                  <ArrowRight className="rotate-90 text-slate-500" />
                  
                  {/* WUT */}
                  <div className="p-4 bg-blue-900/30 rounded-xl border border-blue-500/50 w-full text-center shadow-lg hover:border-blue-400 transition-colors">
                    <div className="text-blue-400 font-bold mb-2">WUT Orchestrator</div>
                    <div className="flex gap-2 justify-center">
                      <span className="bg-blue-900/50 px-2 py-1 rounded text-xs">Classifier</span>
                      <span className="bg-blue-900/50 px-2 py-1 rounded text-xs">Decision Engine</span>
                    </div>
                  </div>

                  <ArrowRight className="rotate-90 text-slate-500" />

                  {/* WAY */}
                  <div className="p-4 bg-purple-900/30 rounded-xl border border-purple-500/50 w-full text-center shadow-lg hover:border-purple-400 transition-colors">
                    <div className="text-purple-400 font-bold mb-2">WAY RAG Engine</div>
                    <div className="flex gap-2 justify-center">
                      <span className="bg-purple-900/50 px-2 py-1 rounded text-xs">Vector Search</span>
                      <span className="bg-purple-900/50 px-2 py-1 rounded text-xs">OpenAI</span>
                    </div>
                  </div>

                </div>
              </div>
           </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section id="demo" className="relative z-10 py-24 px-6 bg-[#0a0f1c] border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-6">
             <div>
               <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                 <Terminal className="text-orange-500" /> Interactive Demo
               </h2>
               <p className="text-slate-400 mt-2">Live Situation Simulation: ลองกดปุ่ม Scenario ด้านล่างเพื่อดูการทำงาน</p>
             </div>

             {/* Live Analytics Dashboard */}
             <div className="live-stat-box flex gap-4 bg-slate-900 p-2 rounded-xl border border-slate-800 shadow-xl transition-transform duration-100 ease-in-out transform hover:scale-105">
               <div className="px-4 py-2 border-r border-slate-800">
                 <div className="text-[10px] text-slate-500 uppercase tracking-wider">Requests</div>
                 <div className="text-xl font-bold text-white">{liveStats.total}</div>
               </div>
               <div className="px-4 py-2 border-r border-slate-800">
                 <div className="text-[10px] text-slate-500 uppercase tracking-wider">Resolved</div>
                 <div className="text-xl font-bold text-green-400">{liveStats.resolved}</div>
               </div>
               <div className="px-4 py-2 border-r border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Safety Stop</div>
                  <div className="text-xl font-bold text-red-400">{liveStats.escalated}</div>
               </div>
               <div className="px-4 py-2">
                 <div className="text-[10px] text-slate-500 uppercase tracking-wider">Cost Saved</div>
                 <div className="text-xl font-bold text-orange-400">฿{liveStats.costSaved}</div>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
            {/* Left: Backend Logs */}
            <div className="lg:col-span-1 bg-[#050911] rounded-2xl border border-slate-800 p-4 flex flex-col font-mono text-xs overflow-hidden shadow-inner">
               <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                 <span className="text-slate-400 font-bold flex items-center gap-2"><Activity className="w-3 h-3" /> SYSTEM_LOGS</span>
                 <div className="flex gap-2">
                    <span className={`w-2 h-2 rounded-full ${systemStatus.state === 'PROCESSING' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                 </div>
               </div>
               
               {/* State Dashboard */}
               <div className="grid grid-cols-2 gap-2 mb-4">
                 <div className="bg-slate-900 p-2 rounded border border-slate-800">
                   <div className="text-slate-500 text-[10px]">DEPARTMENT</div>
                   <div className="text-blue-400 font-bold">{systemStatus.dept}</div>
                 </div>
                 <div className="bg-slate-900 p-2 rounded border border-slate-800">
                   <div className="text-slate-500 text-[10px]">CONFIDENCE</div>
                   <div className={`font-bold ${systemStatus.confidence > 0.7 ? 'text-green-400' : 'text-red-400'}`}>
                     {(systemStatus.confidence * 100).toFixed(0)}%
                   </div>
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar text-slate-300">
                 {ragLogs.length === 0 && <div className="text-slate-600 italic text-center mt-10">Waiting for requests...</div>}
                 {ragLogs.map((log, i) => (
                   <div key={i} className="flex gap-2 border-l-2 border-slate-700 pl-2 py-1 animate-fade-in-up delay-100">
                     <span className="text-slate-600 shrink-0 select-none">[{log.time}]</span>
                     <span className={`${log.text.includes('RULE') ? 'text-yellow-400 font-bold' : log.text.includes('SAFETY') ? 'text-red-500 font-bold' : ''}`}>
                       {log.text}
                     </span>
                   </div>
                 ))}
                 <div ref={logsEndRef} />
               </div>
            </div>

            {/* Right: Chat UI */}
            <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-700 flex flex-col overflow-hidden relative shadow-2xl">
              
              {/* Dev Mode Toggle */}
              <div className="absolute top-4 right-4 z-30">
                 <button 
                   onClick={() => setDevMode(!devMode)}
                   className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                     devMode 
                     ? 'bg-purple-500/20 border-purple-500 text-purple-300' 
                     : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'
                   }`}
                 >
                   {devMode ? <Eye className="w-3 h-3"/> : <EyeOff className="w-3 h-3"/>}
                   {devMode ? 'Dev Mode: ON' : 'Dev Mode: OFF'}
                 </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-900/50">
                <div ref={chatContainerRef} className="space-y-6">
                  {messages.map((msg, i) => (
                    <div key={i} className={`message-bubble flex gap-4 animate-pop-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${msg.type === 'alert' ? 'animate-shake' : ''}`}>
                      
                      {msg.role === 'assistant' && (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                          msg.type === 'alert' ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-br from-blue-600 to-purple-600'
                        }`}>
                          {msg.type === 'alert' ? <Lock className="w-5 h-5 text-white" /> : <Bot className="w-6 h-6 text-white" />}
                        </div>
                      )}

                      <div className="max-w-[85%]">
                        {/* Message Content or JSON View */}
                        <div 
                          className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm overflow-hidden ${
                            msg.role === 'user' 
                            ? 'bg-white text-slate-900 rounded-tr-none' 
                            : msg.type === 'alert'
                              ? 'bg-red-900/20 border border-red-500/50 text-red-200 rounded-tl-none'
                              : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                          }`}
                        >
                           {/* Logic for Dev Mode display */}
                           {devMode && msg.role === 'assistant' && msg.debug ? (
                              <div className="font-mono text-xs text-green-400 overflow-x-auto">
                                <pre>{JSON.stringify(msg.debug, null, 2)}</pre>
                              </div>
                           ) : (
                              <div className="whitespace-pre-line">
                                {msg.type === 'alert' && <div className="font-bold mb-1 flex items-center gap-2 uppercase tracking-wide text-xs"><ShieldAlert className="w-4 h-4"/> Security Intervention</div>}
                                {msg.content}
                              </div>
                           )}
                        </div>
                        
                        {/* Meta Tags */}
                        {msg.role === 'assistant' && msg.meta && !devMode && (
                          <div className="flex gap-2 mt-2 ml-1 flex-wrap">
                            {msg.meta.confidence > 0 && (
                              <span className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${
                                msg.meta.confidence >= 0.7 
                                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                              }`}>
                                {msg.meta.confidence >= 0.7 ? <CheckCircle2 className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                                Conf: {(msg.meta.confidence * 100).toFixed(0)}%
                              </span>
                            )}
                            {msg.meta.doc && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Source: {msg.meta.doc}
                              </span>
                            )}
                             <span className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 font-bold ${
                               msg.meta.action === 'AUTO_RESOLVE' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' :
                               msg.meta.action === 'CREATE_TICKET' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
                               msg.meta.action === 'CRITICAL_ESCALATE' ? 'text-red-400 border-red-500/30 bg-red-500/10' : 
                               'text-slate-500 border-slate-700'
                             }`}>
                               {msg.meta.action}
                             </span>
                          </div>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
                          <User className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {isTyping && (
                   <div className="flex gap-4 mt-6">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 animate-pulse">
                        <Bot className="w-6 h-6 text-slate-600" />
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm p-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>WUT is thinking...</span>
                      </div>
                   </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-slate-800 border-t border-slate-700 z-20">
                
                {/* Suggested Chips */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {[
                    { label: "1. Auto-Resolve (IT)", q: "รหัสผ่านอีเมลหาย" },
                    { label: "2. Ticket (HR)", q: "ขอลาพักร้อน 5 วัน" },
                    { label: "3. Safety Stop (Acc)", q: "อนุมัติงบ 1 ล้านบาท" },
                                        { label: "4. VPN Issue", q: "VPN เชื่อมไม่ได้" },
              { label: "5. Payslip", q: "ขอสลิปเงินเดือน" },
              { label: "6. Expense", q: "เบิกค่าใช้จ่าย" },
  
                  ].map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleChipClick(item.q)}
                      className="whitespace-nowrap px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-full border border-slate-600 transition-colors flex items-center gap-1 hover:scale-105 active:scale-95"
                    >
                      <Zap className="w-3 h-3 text-orange-400" /> {item.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSend} className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="พิมพ์คำถาม... (เช่น รหัสผ่านหาย, ขอลาพักร้อน)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-6 pr-14 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    disabled={isTyping}
                  />
                  <button 
                    type="submit" 
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 top-2 p-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:scale-105 active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
                <div className="flex justify-between mt-2 px-2">
                  <span className="text-[10px] text-slate-600">Simulated Environment for Interview Demo</span>
                  <button 
                    onClick={handleReset} 
                    disabled={isTyping} // Prevent race condition
                    className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCcw className="w-3 h-3" /> Reset Chat & Stats
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Results */}
      <section id="impact" className="relative z-10 py-24 px-6 bg-slate-900 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 animate-fade-in-up">Projected Business Impact</h2>
          
          <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl overflow-hidden relative animate-fade-in-up delay-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              
              <div className="impact-card">
                <div className="text-slate-400 text-sm uppercase tracking-wider mb-2">Auto-Resolution</div>
                <div className="text-5xl font-black text-green-400 mb-2 flex justify-center">{countAutoResolve}%</div>
                <div className="text-sm text-slate-500">Of total tickets</div>
              </div>

              <div className="impact-card">
                <div className="text-slate-400 text-sm uppercase tracking-wider mb-2">Response Time</div>
                <div className="text-5xl font-black text-blue-400 mb-2">&lt;1 min</div>
                <div className="text-sm text-slate-500">From 4 hours</div>
              </div>

              <div className="impact-card">
                <div className="text-slate-400 text-sm uppercase tracking-wider mb-2">Cost Saving</div>
                <div className="text-5xl font-black text-orange-400 mb-2 flex justify-center">{countCost}K</div>
                <div className="text-sm text-slate-500">THB / Month</div>
              </div>

              <div className="impact-card">
                <div className="text-slate-400 text-sm uppercase tracking-wider mb-2">Payback Period</div>
                <div className="text-5xl font-black text-purple-400 mb-2 flex justify-center">{(countRoi / 10).toFixed(1)}</div>
                <div className="text-sm text-slate-500">Months ROI</div>
              </div>

            </div>
            
            {/* Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-orange-500"></div>
          </div>

          <div className="mt-16 flex justify-center animate-fade-in-up delay-300">
            <div className="text-left max-w-2xl bg-slate-800/50 p-6 rounded-xl border border-slate-700">
               <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                 <CheckCircle2 className="text-green-500" />
                 Why This Project Stands Out?
               </h3>
               <ul className="space-y-3 text-slate-300">
                 <li className="flex gap-2">
                   <span className="text-orange-500">•</span>
                   <span><b>Real Business Impact:</b> แก้ปัญหาคอขวด 60% ขององค์กรได้จริง</span>
                 </li>
                 <li className="flex gap-2">
                   <span className="text-orange-500">•</span>
                   <span><b>Safety-First:</b> มีระบบป้องกันความเสี่ยงเรื่องเงินและ HR Action</span>
                 </li>
                 <li className="flex gap-2">
                   <span className="text-orange-500">•</span>
                   <span><b>Scalable:</b> ออกแบบ Architecture แยกส่วน (WUT/WAY) รองรับการขยายตัว</span>
                 </li>
               </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-slate-600 text-sm bg-[#050911] border-t border-slate-800">
        <p>Prepared for Mango Consultant Interview • Jan 15, 2026</p>
        <p className="mt-1 opacity-50">WUT & WAY Team</p>
      </footer>
    </div>
  );
};

export default App;
