# Test Scripts for Mango Helpdesk AI

This document provides quick commands to run tests and check logs.

## Backend Tests

### Run all tests
```bash
cd backend
pytest
```

### Run tests with coverage
```bash
cd backend
pytest --cov=app --cov-report=html
```

### Run specific test file
```bash
cd backend
pytest tests/test_api.py -v
```

### Run specific test
```bash
cd backend
pytest tests/test_api.py::TestQueryEndpoint::test_query_success_thai -v
```

### Run tests in watch mode
```bash
cd backend
pytest-watch
```

## Frontend Tests

### Run all tests
```bash
cd frontend
npm test
```

### Run tests with UI
```bash
cd frontend
npm run test:ui
```

### Run tests with coverage
```bash
cd frontend
npm run test:coverage
```

### Run specific test file
```bash
cd frontend
npm test -- logger.test.js
```

## Log Management

### Backend Logs

Logs are stored in `backend/logs/`:
- `app.log` - All logs in JSON format
- `error.log` - Error logs only

View live logs:
```bash
tail -f backend/logs/app.log | jq .
```

View only errors:
```bash
tail -f backend/logs/error.log | jq .
```

Search logs by request ID:
```bash
cat backend/logs/app.log | jq 'select(.request_id=="req_abc123")'
```

View logs from last 5 minutes:
```bash
cat backend/logs/app.log | jq 'select(.timestamp > "'$(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S)'")'
```

### Frontend Logs

View logs in browser console (F12):
```javascript
// In browser console:
logger.getLogs()           // Get all logs
logger.getLogs('ERROR')    // Get error logs only
logger.export()            // Export as JSON
logger.download()          // Download logs file
```

## Quick Debug Commands

### Check API health
```bash
curl http://localhost:8000/health
```

### Test API endpoint
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"text": "ขอรีเซ็ตรหัสผ่าน", "language": "th"}'
```

### Monitor API calls
```bash
watch -n 1 'tail -5 backend/logs/app.log | jq .'
```

### Count errors in last hour
```bash
cat backend/logs/error.log | jq -r .timestamp | \
  awk -v since="$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S)" '$1 > since' | wc -l
```

## Performance Monitoring

### Check slow requests (>1000ms)
```bash
cat backend/logs/app.log | jq 'select(.duration_ms > 1000)'
```

### Average response time
```bash
cat backend/logs/app.log | jq -r 'select(.duration_ms != null) | .duration_ms' | \
  awk '{sum+=$1; count++} END {print "Average:", sum/count, "ms"}'
```

## CI/CD Integration

### Run all tests before commit
```bash
# Backend
cd backend && pytest --cov=app --cov-report=term-missing

# Frontend
cd frontend && npm test -- --run
```

### Generate coverage reports
```bash
# Backend
cd backend
pytest --cov=app --cov-report=html --cov-report=json

# Frontend  
cd frontend
npm run test:coverage
```

Reports will be in:
- Backend: `backend/htmlcov/index.html`
- Frontend: `frontend/coverage/index.html`
