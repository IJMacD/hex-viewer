import React from 'react';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from './ErrorBoundary';
import './index.css';
import App from './App';

// @ts-ignore
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);