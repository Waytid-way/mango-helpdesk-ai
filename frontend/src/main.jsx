import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { ErrorBoundary } from 'react-error-boundary'
import { GlobalErrorFallback } from './components/GlobalErrorFallback'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={GlobalErrorFallback} onReset={() => window.location.reload()}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
