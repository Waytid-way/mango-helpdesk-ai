import re

# Read the file
with open('frontend/src/App.jsx', 'r') as f:
    content = f.read()

# Define the new Real API Logic
new_logic = '''  // --- LOGIC: Real WUT + WAY Architecture (Connected to Render Backend) ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);
    setRagLogs([]); // Clear logs

    try {
        // Log for UI
        setRagLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: "📡 Connecting to Hybrid Brain..." }]);
        
        // 1. Send to Backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMsg })
        });

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const data = await response.json();
        
        // 2. Display Answer
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: data.response, 
            type: 'answer',
            meta: { confidence: 1.0, doc: 'Real-RAG', action: 'ANSWER' }
        }]);

        setRagLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: "✅ Answer Received" }]);

    } catch (error) {
        console.error("Chat Error:", error);
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `Error: ${error.message}. (Check Backend Connection)`, 
            type: 'error' 
        }]);
    } finally {
        setIsTyping(false);
    }
  };'''

# Find and replace the Mock Logic with Real API Logic
# Pattern: Match from comment to the closing }; of handleSend function
pattern = r'  // --- LOGIC: Simulated WUT \+ WAY Architecture ---.*?\n  const handleSend = async \(e\) => \{.*?^  \};'

# Replace with new logic
replaced_content = re.sub(pattern, new_logic, content, flags=re.DOTALL | re.MULTILINE)

# Write back
with open('frontend/src/App.jsx', 'w') as f:
    f.write(replaced_content)

print("✅ App.jsx updated with Real API Logic!")
