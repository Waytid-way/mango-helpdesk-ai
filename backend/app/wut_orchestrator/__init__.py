"""
WUT Orchestrator Module
Handles classification and decision logic
"""
from .classifier import GroqClassifier

class WUTClassifier:
    """Classifies incoming queries by department, intent, and urgency"""
    
    
    def __init__(self):
        self.ai_classifier = GroqClassifier()
        self.decision_engine = DecisionEngine()
    
    async def classify(self, text: str):
        """AI-based classification with Business Rules"""
        # 1. AI Classification
        ai_result = self.ai_classifier.classify(text)
        
        # 2. Apply Business Rules (Decision Engine)
        # Note: Groq doesn't provide fine-grained confidence yet, defaulting to 1.0 for now
        action = self.decision_engine.decide(
            confidence=1.0, 
            department=ai_result.get("department", "General"),
            intent=ai_result.get("intent", "question")
        )
        
        return {
            **ai_result,
            "action": action,
            "confidence": 1.0 # Placeholder until logprobs are supported
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
