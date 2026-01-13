"""
WUT Orchestrator Module
Handles classification and decision logic
"""

class WUTClassifier:
    """Classifies incoming queries by department, intent, and urgency"""
    
    def classify(self, text: str):
        """Keyword-based classification for departments, intent, and urgency"""
        text_lower = text.lower()
        
        # Department classification
        department = "General"
        if any(word in text_lower for word in ["password", "login", "network", "computer", "laptop", "software", "printer"]):
            department = "IT"
        elif any(word in text_lower for word in ["leave", "ลา", "sick", "vacation", "พักร้อน", "holiday", "hr", "payroll", "salary", "เงินเดือน"]):
            department = "HR"
        elif any(word in text_lower for word in ["invoice", "payment", "accounting", "บัญชี", "receipt", "tax"]):
            department = "Accounting"
        
        # Intent classification
        intent = "question"
        if any(word in text_lower for word in ["request", "need", "want", "ขอ", "create", "ticket"]):
            intent = "action_request"
        elif any(word in text_lower for word in ["?", "how", "what", "when", "where", "why", "อย่างไร", "ทำไม"]):
            intent = "question"
        elif any(word in text_lower for word in ["problem", "issue", "error", "not working", "broken", "ปัญหา", "เสีย"]):
            intent = "problem_report"
        
        # Urgency classification
        urgency = "low"
        if any(word in text_lower for word in ["urgent", "emergency", "critical", "asap", "immediately", "ด่วน"]):
            urgency = "high"
        elif any(word in text_lower for word in ["soon", "quickly", "priority"]):
            urgency = "medium"
        
        return {
            "department": department,
            "intent": intent,
            "urgency": urgency
        }
class DecisionEngine:
    """Business rules engine for determining actions"""
    
    def decide(self, confidence: float, department: str, intent: str):
        # Safety rules
        if department == "Accounting" and intent == "action_request":
            return "CRITICAL_ESCALATE"
        
        if confidence < 0.70:
            return "ESCALATE"
        
        if intent == "action_request" and department == "HR":
            return "CREATE_TICKET"
        
        return "AUTO_RESOLVE"
