import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Simple test to identify the error
function TestApp() {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>Test App</h1>
            <p>If you see this, React is working!</p>
        </div>
    );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element");
}

const root = ReactDOM.createRoot(rootElement);
root.render(<TestApp />);
