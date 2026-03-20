/* src/main.jsx */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/auth/AuthContext.jsx';
import { ErrorProvider } from './context/error/ErrorContext.jsx';
import ErrorToast from './components/errorToast/ErrorToast.jsx';

console.log("API_URL =", import.meta.env.VITE_API_URL);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorProvider>
      <AuthProvider>
        <App />
        <ErrorToast />
      </AuthProvider>
    </ErrorProvider>
  </StrictMode>
);
