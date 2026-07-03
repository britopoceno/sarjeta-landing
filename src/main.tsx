import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import Jornada from './Jornada.tsx';
import './index.css';

const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/jornadamusical' ? <Jornada /> : <App />}
  </StrictMode>,
);
