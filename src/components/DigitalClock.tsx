import React, { useState, useEffect } from 'react';

export default function DigitalClock() {
  const [showSettings, setShowSettings] = useState(false);
  const [isManual, setIsManual] = useState(false);
  
  // Manual time & date states
  const [manualHours, setManualHours] = useState(12);
  const [manualMinutes, setManualMinutes] = useState(0);
  const [manualSeconds, setManualSeconds] = useState(0);
  const [amPm, setAmPm] = useState('PM');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

  // System time state (jab manual off ho)
  const [systemTime, setSystemTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      if (isManual) {
        setManualSeconds((prevSec) => {
          let nextSec = prevSec + 1;
          if (nextSec < 60) return nextSec;
          
          nextSec = 0;
          setManualMinutes((prevMin) => {
            let nextMin = prevMin + 1;
            if (nextMin < 60) return nextMin;
            
            nextMin = 0;
            setManualHours((prevHour) => {
              let nextHour = prevHour + 1;
              if (nextHour > 12) {
                nextHour = 1;
                setAmPm((prevAmPm) => {
                  const nextAmPm = prevAmPm === 'AM' ? 'PM' : 'AM';
                  // Agar PM se wapas AM ho raha hai, toh date ko ek din aage barha dein
                  if (nextAmPm === 'AM') {
                    setManualDate((prevDate) => {
                      const d = new Date(prevDate);
                      d.setDate(d.getDate() + 1);
                      return d.toISOString().split('T')[0];
                    });
                  }
                  return nextAmPm;
                });
              }
              return nextHour;
            });
            return 0;
          });
          return 0;
        });
      } else {
        setSystemTime(new Date());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isManual]);

  // Format time for display
  const formatTime = () => {
    if (isManual) {
      const h = String(manualHours).padStart(2, '0');
      const m = String(manualMinutes).padStart(2, '0');
      const s = String(manualSeconds).padStart(2, '0');
      return `${h}:${m}:${s} ${amPm}`;
    }
    
    let hours = systemTime.getHours();
    const minutes = String(systemTime.getMinutes()).padStart(2, '0');
    const seconds = String(systemTime.getSeconds()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');

    return `${formattedHours}:${minutes}:${seconds} ${period}`;
  };

  const formatDate = () => {
    if (isManual) {
      const [year, month, day] = manualDate.split('-');
      return `${day}-${month}-${year}`;
    }
    return systemTime.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsManual(true);
    setShowSettings(false);
  };

  const resetToSystemTime = () => {
    setIsManual(false);
    setSystemTime(new Date());
    setShowSettings(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Clock Display Container */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(24, 20, 20, 0.84)',
        border: '1px solid rgba(223, 209, 13, 0.94)',
        padding: '4px 12px',
        borderRadius: '20px',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '600',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      }}>
        <span>🕒</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>{formatTime()}</span>
          <span style={{ fontSize: '9px', color: '#cbd5e1' }}>{formatDate()}</span>
        </div>

        {/* Dropdown Arrow Button */}
        <span 
          onClick={() => setShowSettings(!showSettings)}
          style={{
            cursor: 'pointer',
            fontSize: '10px',
            padding: '2px 5px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            transition: 'transform 0.2s',
            transform: showSettings ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
          title="Manual Time Settings"
        >
          ▼
        </span>
      </div>

      {/* Manual Settings Dropdown Modal */}
      {showSettings && (
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e1b4b',
          border: '1px solid #4338ca',
          padding: '15px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 99999,
          width: '210px',
          color: '#fff',
          fontSize: '12px'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #3730a3', paddingBottom: '5px' }}>
            Set Manual Time & Date
          </p>

          <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'space-between', alignItems: 'center' }}>
              <input 
                type="number" 
                min={1} 
                max={12} 
                value={manualHours} 
                onChange={(e) => setManualHours(Number(e.target.value))} 
                style={{ width: '38px', textAlign: 'center', padding: '4px', borderRadius: '4px', border: '1px solid #6366f1', background: '#0f172a', color: '#fff' }} 
              />
              <span>:</span>
              <input 
                type="number" 
                min={0} 
                max={59} 
                value={manualMinutes} 
                onChange={(e) => setManualMinutes(Number(e.target.value))} 
                style={{ width: '38px', textAlign: 'center', padding: '4px', borderRadius: '4px', border: '1px solid #6366f1', background: '#0f172a', color: '#fff' }} 
              />
              <span>:</span>
              <input 
                type="number" 
                min={0} 
                max={59} 
                value={manualSeconds} 
                onChange={(e) => setManualSeconds(Number(e.target.value))} 
                style={{ width: '38px', textAlign: 'center', padding: '4px', borderRadius: '4px', border: '1px solid #6366f1', background: '#0f172a', color: '#fff' }} 
              />
              <select 
                value={amPm} 
                onChange={(e) => setAmPm(e.target.value)}
                style={{ background: '#0f172a', color: '#fff', border: '1px solid #6366f1', borderRadius: '4px', padding: '2px' }}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '10px', display: 'block', marginBottom: '2px' }}>Select Date:</label>
              <input 
                type="date" 
                value={manualDate} 
                onChange={(e) => setManualDate(e.target.value)} 
                style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #6366f1', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              <button 
                type="submit" 
                style={{ flex: 1, background: '#4f46e5', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Set Time & Date
              </button>
              <button 
                type="button" 
                onClick={resetToSystemTime}
                style={{ flex: 1, background: '#334155', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}