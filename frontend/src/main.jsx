import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import CrmApp from './CrmApp.jsx';
import './index.css';

const path = window.location.pathname.replace(/\/+$/, '') || '/';
const isCrm = path === '/crm';
if (isCrm) document.body.classList.add('crm-body');

createRoot(document.getElementById('root')).render(isCrm ? <CrmApp /> : <App />);
