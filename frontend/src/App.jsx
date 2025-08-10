import React from 'react'; // <-- BARIS PENTING YANG SEBELUMNYA HILANG
import { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('https://special-couscous-5jj4wwrvg4j24q7r-8000.app.github.dev/')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => setMessage(data.message))
      .catch(err => setMessage('Error: ' + err.message));
  }, []);

  return (
    <div>
      <h1>FTTH AutoDesigner</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

export default App;