import os
import json
from groq import Groq
from loguru import logger

class GroqClassifier:
    """
    AI-Powered Classifier using Groq (Llama-3.1-8b)
    Determines: Department, Intent, Urgency
    """
    
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.1-8b-instant"  # Low latency model
        
    def classify(self, text: str) -> dict:
        """
        Classify text into structured JSON.
        Returns:
            dict: {
                "department": "Generla" | "IT" | "HR" | "Accounting",
                "intent": "question" | "action_request" | "problem_report",
                "urgency": "low" | "medium" | "high"
            }
        """
        try:
            prompt = f"""
            Analyze this employee request and classify it into JSON format.
            
            Valid Categories:
            - Department: IT, HR, Accounting, General
            - Intent: question, action_request, problem_report
            - Urgency: low, medium, high
            
            Rules:
            - "leave", "salary", "vacation" -> HR
            - "password", "login", "wifi", "broken" -> IT
            - "invoice", "payment", "reimburse" -> Accounting
            - "create", "submit", "request" -> action_request
            - "urgent", "asap", "emergency" -> high urgency
            
            Input: "{text}"
            
            Return ONLY JSON. No markdown.
            Example: {{"department": "IT", "intent": "problem_report", "urgency": "high"}}
            """
            
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            
            result_json = completion.choices[0].message.content
            return json.loads(result_json)
            
        except Exception as e:
            logger.error(f"Classification failed: {e}")
            # Fallback to Safe Defaults
            return {
                "department": "General",
                "intent": "question",
                "urgency": "low"
            }
