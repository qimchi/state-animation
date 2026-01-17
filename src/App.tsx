import React, { useState, useRef } from 'react';
import { TxSuccessAnimation } from './components/TxSuccessAnimation';
import './App.css';

function App() {
  const [showSuccess, setShowSuccess] = useState(false);
  const animationRef = useRef<{ start: () => void } | null>(null);

  const handleRevealDone = () => {
    setShowSuccess(true);
  };

  const handleSuccessClick = () => {
    if (animationRef.current) {
      animationRef.current.start();
    }
  };

  return (
    <div className="app-wrapper">
      <button className="success-trigger-btn" onClick={handleSuccessClick}>
        Success
      </button>
      <div className="mobile-frame">
        <div className="mobile-screen">
          <div className="screen-content">
            <TxSuccessAnimation 
              ref={animationRef}
              onRevealDone={handleRevealDone} 
              autoStart={false} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
