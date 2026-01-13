# ⚡ Quick Start - Testing & Logging

สำหรับการทดสอบและดู log แบบรวดเร็ว

## 🧪 รันเทส

### Backend (Python)
```bash
cd backend
pip install -r requirements.txt
pytest -v
```

### Frontend (JavaScript)
```bash
cd frontend
npm install
npm test
```

## 📝 ดู Log

### Backend
```bash
# ดู log แบบ real-time
tail -f backend/logs/app.log | jq .

# ดูเฉพาะ error
tail -f backend/logs/error.log | jq .
```

### Frontend
เปิด Browser Console (F12) แล้วพิมพ์:
```javascript
logger.getLogs()        // ดู log ทั้งหมด
logger.getLogs('ERROR') // ดูเฉพาะ error
logger.download()       // ดาวน์โหลด log
```

## 🔍 หาปัญหาเร็ว

### ดู API ที่ช้า (>1 วินาที)
```bash
cat backend/logs/app.log | jq 'select(.duration_ms > 1000)'
```

### นับ error ในชั่วโมงที่แล้ว
```bash
grep ERROR backend/logs/error.log | tail -20
```

### Test API
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"text": "ทดสอบ", "language": "th"}'
```

## 📊 Coverage Report

```bash
# Backend
cd backend && pytest --cov=app --cov-report=html
# เปิด htmlcov/index.html

# Frontend
cd frontend && npm run test:coverage
# เปิด coverage/index.html
```

## 🚀 รันทุกอย่างพร้อมกัน

```bash
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Watch logs
tail -f backend/logs/app.log | jq .

# Terminal 4: Run tests
cd backend && pytest --watch
```

## 💡 Tips

- Log level ตั้งได้ที่ `.env`: `LOG_LEVEL=DEBUG`
- Error จะถูกส่งไปที่ `error.log` อัตโนมัติ
- ทุก API call มี `request_id` สำหรับ track
- Frontend log จะส่งไปยัง backend (ถ้า error/warning)
