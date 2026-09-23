import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import HistoricalExplorer from './historical/HistoricalExplorer';
import './styles.css';

const originalFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === 'string' && input.startsWith('/data/')) {
    input = `${import.meta.env.BASE_URL}${input.slice(1)}`;
  }
  return originalFetch(input, init);
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
const render = () => root.render(<React.StrictMode>{window.location.hash === '#history' ? <HistoricalExplorer /> : <App />}</React.StrictMode>);
render();
window.addEventListener('hashchange', render);
