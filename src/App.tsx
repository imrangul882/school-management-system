import './app.css';
import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { StudentPortal } from './components/StudentPortal';
import { PeriodAttendancePanel } from './features/attendance/PeriodAttendancePanel';
import { TeacherSalaryPanel } from './features/attendance/TeacherSalaryPanel'; 
import { Navbar } from './components/Navbar';
import { CalculatorModal } from './components/CalculatorModal';
import { TeacherPortal } from './components/TeacherPortal';
import StaffManagementPanel from './features/finance/StaffManagementPanel';

export default function App() {
  const [currentView, setCurrentView] = useState<'main' | 'portal' | 'period-attendance' | 'teacher-salary' | 'teacherPortal' | 'staff-management'>('main');
  const [showCalculator, setShowCalculator] = useState(false);

  // --- Calculator Dragging States & Logic ---
  const [calcPosition, setCalcPosition] = useState({ x: 50, y: 100 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setCalcPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - calcPosition.x,
      y: e.clientY - calcPosition.y,
    });
  };
  // ----------------------------------------

  // 1. App load hotay hi URL check karna ke koi specific link open kiya gaya hai ya nahi
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');

    if (view === 'teacher-portal') {
      setCurrentView('teacherPortal');
    } else if (view === 'student-portal') {
      setCurrentView('portal');
    } else if (view === 'staff-management') {
      setCurrentView('staff-management');
    }
  }, []);

  // 2. View change hone par URL ko update karne ka function
  const handleViewChange = (viewType: 'main' | 'portal' | 'period-attendance' | 'teacher-salary' | 'teacherPortal' | 'staff-management', urlParam?: string) => {
    setCurrentView(viewType);
    
    // URL mein query parameter set ya remove karna bina page refresh kiye
    if (urlParam) {
      const newUrl = `${window.location.pathname}?view=${urlParam}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } else {
      window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '10px', 
      boxSizing: 'border-box', 
      overflowX: 'hidden',
      fontFamily: 'Arial, sans-serif',
      position: 'relative'
    }}>
      <Navbar />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', margin: '15px 0', flexWrap: 'wrap' }}></div>

      {/* Toggle Buttons Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', width: '100%' }}>
        
        {/* Student Portal Toggle Button */}
        <button 
          onClick={() => {
            if (currentView === 'portal') {
              handleViewChange('main');
            } else {
              handleViewChange('portal', 'student-portal');
            }
          }}
          style={{ 
            background: 'linear-gradient(135deg, #7c3aed 0%, #23123f 100%)', 
            color: '#fff', border: '1px solid #8b5cf6', padding: '12px 20px', 
            borderRadius: '10px', cursor: 'pointer', fontWeight: '600',
            flex: '1 1 200px', fontSize: '14px', textAlign: 'center',
            boxShadow: '0 0 15px rgba(37, 18, 70, 0.3)', transition: 'all 0.2s ease'
          }}      
        >
          {currentView === 'portal' ? 'Back to Admin Dashboard' : 'Switch to Student Portal'}
        </button>

        {/* Teacher Portal Toggle Button */}
        <button 
          onClick={() => {
            if (currentView === 'teacherPortal') {
              handleViewChange('main');
            } else {
              handleViewChange('teacherPortal', 'teacher-portal');
            }
          }}
          style={{ 
            background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)', 
            color: '#fff', border: '1px solid #38bdf8', padding: '12px 20px', 
            borderRadius: '10px', cursor: 'pointer', fontWeight: '600',
            flex: '1 1 200px', fontSize: '14px', textAlign: 'center',
            boxShadow: '0 0 15px rgba(2, 132, 199, 0.3)', transition: 'all 0.2s ease'
          }}      
        >
          {currentView === 'teacherPortal' ? 'Back to Admin Dashboard' : 'Switch to Teacher Portal'}
        </button>

        {/* Staff Management Toggle Button */}
        <button 
          onClick={() => {
            if (currentView === 'staff-management') {
              handleViewChange('main');
            } else {
              handleViewChange('staff-management', 'staff-management');
            }
          }}
          style={{ 
            background: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)', 
            color: '#fff', border: '1px solid #34d399', padding: '12px 20px', 
            borderRadius: '10px', cursor: 'pointer', fontWeight: '600',
            flex: '1 1 200px', fontSize: '14px', textAlign: 'center',
            boxShadow: '0 0 15px rgba(5, 150, 105, 0.3)', transition: 'all 0.2s ease'
          }}      
        >
          {currentView === 'staff-management' ? 'Back to Admin Dashboard' : ' Staff Management'}
        </button>

        {/* Calculator Toggle Button */}
        <button 
          onClick={() => setShowCalculator(true)}
          style={{ 
            background: 'linear-gradient(135deg, #dd3d72 0%, #500711 100%)', 
            color: '#fff', border: '1px solid #8b5cf6', padding: '10px 18px', 
            borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
            textAlign: 'center', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)', transition: 'all 0.2s ease',
            position: 'fixed', top: '20px', left: '20px', zIndex: 9999
          }}      
        >
            Calculator
        </button>
      </div>

      {/* Views Rendering Logic */}
      {currentView === 'portal' ? (
        <div style={{ padding: '10px 0', width: '100%', boxSizing: 'border-box' }}>
          <StudentPortal />
        </div>
      ) : currentView === 'teacherPortal' ? (
        <div style={{ padding: '10px 0', width: '100%', boxSizing: 'border-box' }}>
          <TeacherPortal onBack={() => handleViewChange('main')} />
        </div>
      ) : currentView === 'staff-management' ? (
        <div style={{ padding: '10px 0', width: '100%', boxSizing: 'border-box' }}>
          <StaffManagementPanel />
        </div>
      ) : currentView === 'period-attendance' ? (
        <div style={{ padding: '10px 0', width: '100%', boxSizing: 'border-box' }}>
          <PeriodAttendancePanel onBack={() => handleViewChange('main')} />
        </div>
      ) : currentView === 'teacher-salary' ? (
        <div style={{ padding: '10px 0', width: '100%', boxSizing: 'border-box' }}>
          <TeacherSalaryPanel onBack={() => handleViewChange('main')} />
        </div>
      ) : (
        <Dashboard 
          onOpenPeriodAttendance={() => handleViewChange('period-attendance')} 
          onOpenTeacherSalaryPanel={() => handleViewChange('teacher-salary')}
          onOpenStaffManagement={() => handleViewChange('staff-management')}
        />
      )}

      {/* Draggable Calculator Modal Wrapper */}
      {showCalculator && (
        <div 
          onMouseDown={handleMouseDown}
          style={{
            position: 'fixed',
            top: `${calcPosition.y}px`,
            left: `${calcPosition.x}px`,
            zIndex: 10000,
            cursor: 'move',
            userSelect: 'none', // Text select hone se rokne ke liye
          }}
        >
          <CalculatorModal isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
        </div>
      )}
    </div>
  );
}