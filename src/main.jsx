import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { OperationsProvider } from './context/OperationsContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OperationsProvider>
      <App />
    </OperationsProvider>
  </React.StrictMode>,
)
