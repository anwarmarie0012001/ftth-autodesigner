import React, { useState, useEffect } from 'react';
import './App.css';

const backendUrl = 'https://special-couscous-5jj4wwrvg4j24q7r-8000.app.github.dev/';

function App() {
  const [backendMessage, setBackendMessage] = useState('Loading...');
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch(backendUrl)
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        setBackendMessage(data.message || JSON.stringify(data));
      })
      .catch(err => setBackendMessage(`Error: ${err.message}`));
  }, []);

  return (
    <div className="app-container">
      <header>
        <h1>FTTH AutoDesigner</h1>
        <p className="subtitle">Fast-track your FTTH network design with automation</p>
      </header>

      <section className="status-section">
        <h2>Backend Connection</h2>
        <div className="backend-message">{backendMessage}</div>
      </section>

      <section className="counter-section">
        <h2>Quick Test</h2>
        <button onClick={() => setCount(count + 1)}>
          Count is {count}
        </button>
      </section>
    </div>
  );
}

export default App;
