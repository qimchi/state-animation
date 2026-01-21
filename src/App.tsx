import { useRef, useState } from 'react';
import { TxSuccessAnimation } from './components/TxSuccessAnimation';
import { TxProcessingAnimation } from './components/TxProcessingAnimation';
import { TxErrorAnimation } from './components/TxErrorAnimation';
import './App.css';

function App() {
  const [animationType, setAnimationType] = useState<'success' | 'processing' | 'error'>('success');
  const successAnimationRef = useRef<{ start: () => void } | null>(null);
  const processingAnimationRef = useRef<{ start: () => void } | null>(null);
  const errorAnimationRef = useRef<{ start: () => void } | null>(null);

  const handleSuccessRevealDone = () => {
    // Success animation completed
  };

  const handleProcessingRevealDone = () => {
    // Processing animation completed
  };

  const handleErrorRevealDone = () => {
    // Error animation completed
  };

  const handleSuccessClick = () => {
    setAnimationType('success');
    if (successAnimationRef.current) {
      successAnimationRef.current.start();
    }
  };

  const handleProcessingClick = () => {
    setAnimationType('processing');
    if (processingAnimationRef.current) {
      processingAnimationRef.current.start();
    }
  };

  const handleErrorClick = () => {
    setAnimationType('error');
    if (errorAnimationRef.current) {
      errorAnimationRef.current.start();
    }
  };

  return (
    <div className="app-wrapper">
      <div className="button-group">
        <button className="success-trigger-btn" onClick={handleSuccessClick}>
          Success
        </button>
        <button className="processing-trigger-btn" onClick={handleProcessingClick}>
          Processing
        </button>
        <button className="error-trigger-btn" onClick={handleErrorClick}>
          Error
        </button>
      </div>
      <div className="mobile-frame">
        <div className="mobile-screen">
          <div className="screen-content">
            {animationType === 'success' ? (
              <TxSuccessAnimation
                ref={successAnimationRef}
                onRevealDone={handleSuccessRevealDone}
                autoStart={false}
              />
            ) : animationType === 'processing' ? (
              <TxProcessingAnimation
                ref={processingAnimationRef}
                onRevealDone={handleProcessingRevealDone}
                autoStart={false}
              />
            ) : (
              <TxErrorAnimation
                ref={errorAnimationRef}
                onRevealDone={handleErrorRevealDone}
                autoStart={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
