import React, { useState } from 'react';

interface CalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
    const [calcInput, setCalcInput] = useState('');
    if (!isOpen) return null;

 return (
    <div style={{ 
      background: '#1f2937', 
      padding: '20px', 
      borderRadius: '12px', 
      width: '300px', 
      boxShadow: '0 10px 25px rgba(0,0,0,0.5)', 
      border: '1px solid #374151' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', cursor: 'move' }}>
        <h4 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>Quick Cash Tally</h4>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
      </div>
      <input 
        type="text" 
        value={calcInput} 
        readOnly 
        placeholder="0"
        style={{ width: '100%', padding: '12px', fontSize: '20px', textAlign: 'right', marginBottom: '15px', boxSizing: 'border-box', background: '#111827', color: '#10b981', border: '1px solid #374151', borderRadius: '6px', fontFamily: 'monospace' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {['7', '8', '9', '+', '4', '5', '6', '-', '1', '2', '3', '*', '0','/', '.', 'C', 'DEL', '='].map((btn) => (          
          <button 
            key={btn}
            type="button"
            onClick={() => {
              if (btn === 'C') {
                setCalcInput('');
              } else if (btn === 'DEL') {
                setCalcInput(prev => prev.slice(0, -1));
              } else if (btn === '=') {
                try {
                  const res = eval(calcInput);
                  const formattedResult = Number.isFinite(res) ? Number(res).toFixed(2) : 'Error';
                  setCalcInput(formattedResult);
                } catch {
                  setCalcInput('Error');
                }
              } else {
                setCalcInput(prev => prev + btn);
              }
            }}

            style={{
              gridColumn: btn === '=' ? 'span 4' : 'span 1',
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: btn === '=' ? '#0284c7' : ['C', 'DEL'].includes(btn) ? '#ef4444' : ['+', '-', '*', '/'].includes(btn) ? '#4b5563' : '#374151',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
              {btn}
          </button>
        ))}
      </div>
    </div>
  );
};