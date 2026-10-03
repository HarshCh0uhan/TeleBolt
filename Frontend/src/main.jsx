import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { AdminStatsProvider } from './context/AdminStatsContext.jsx';
import { CompareProvider } from './context/CompareContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AdminStatsProvider>
          <CompareProvider>
            <App />
          </CompareProvider>
        </AdminStatsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
