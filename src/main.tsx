import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const originalFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === 'string' && input.startsWith('/data/')) {
    input = `${import.meta.env.BASE_URL}${input.slice(1)}`;
  }
  return originalFetch(input, init);
};

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
