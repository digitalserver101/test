import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { readLoginProps } from './bootstrap/readLoginProps.js';
import './login-shell.css';

const el = document.getElementById('login-react-root');
if (el) {
  const { message, justRegistered } = readLoginProps();
  createRoot(el).render(
    <StrictMode>
      <App message={message} justRegistered={justRegistered} />
    </StrictMode>
  );
}
