import React from 'react';
import MapView from './components/MapView.jsx'; // Menggunakan path relatif yang lebih aman
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>FTTH Autodesigner</h1>
      <MapView />
    </div>
  );
}

export default App;