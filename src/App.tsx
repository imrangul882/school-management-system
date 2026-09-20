import './App.css';
import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { StudentPortal } from './components/StudentPortal';
import PeriodAttendancePanel from './components/AttendancePanel/PeriodAttendancePanel';
import { TeacherSalaryPanel } from './features/attendance/TeacherSalaryPanel'; 
import { Navbar } from './components/Navbar';
import { CalculatorModal } from './components/CalculatorModal';
import { TeacherPortal } from './components/TeacherPortal';
import StaffManagementPanel from './features/finance/StaffManagementPanel';

type ViewType = 'main' | 'portal' | 'period-attendance' | 'teacher-salary' | 'teacherPortal' | 'staff-management';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'teacher-portal') return 'teacherPortal';
    if (view === 'student-portal') return 'portal';
    if (view === 'staff-management') return 'staff-management';
    return 'main';
  });

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

  const handleViewChange = (viewType: ViewType, urlParam?: string, includeAdminFlag?: boolean) => {
    setCurrentView(viewType);
    
    if (urlParam) {
      const adminFlag = includeAdminFlag ? '&from=admin' : '';
      const newUrl = `${window.location.pathname}?view=${urlParam}${adminFlag}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } else {
      window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
    }
  };

  const isDedicatedPortal = currentView === 'portal' || currentView === 'teacherPortal';
  const searchParams = new URLSearchParams(window.location.search);
  const isFromAdmin = searchParams.get('from') === 'admin';

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '10px', 
      boxSizing: 'border-box', 
      overflowX: 'hidden',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      paddingTop: '70px' // Fixed Navbar ki wajah se content ko neechay karne ke liye
    }}>
      {/* Navbar with Calculator Prop */}
      <Navbar onOpenCalculator={() => setShowCalculator(true)} />

      {/* Toggle Buttons Bar */}
      {!isDedicatedPortal && (
        <div style={{ display: 'flex', gap: '12px', margin: '20px 0', flexWrap: 'wrap', width: '100%' }}>
          
          {/* Student Portal Toggle Button */}
          <button 
            onClick={() => {
              if ((currentView as string) === 'portal') {
                handleViewChange('main');
              } else {
                handleViewChange('portal', 'student-portal', true);
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
            {(currentView as string) === 'portal' ? 'Back to Admin Dashboard' : 'Switch to Student Portal'}
          </button>

          {/* Teacher Portal Toggle Button */}
          <button 
            onClick={() => {
              if ((currentView as string) === 'teacherPortal') {
                handleViewChange('main');
              } else {
                handleViewChange('teacherPortal', 'teacher-portal', true);
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
            {(currentView as string) === 'teacherPortal' ? 'Back to Admin Dashboard' : 'Switch to Teacher Portal'}
          </button>

          {/* Staff Management Toggle Button */}
          <button 
            onClick={() => {
              if ((currentView as string) === 'staff-management') {
                handleViewChange('main');
              } else {
                handleViewChange('staff-management', 'staff-management', false);
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
            {(currentView as string) === 'staff-management' ? 'Back to Admin Dashboard' : ' Staff Management'}
          </button>

        </div>
      )}

      {/* Views Rendering Logic */}
      {currentView === 'portal' ? (
        <div style={{ padding: '10px 0', width: '100%', boxSizing: 'border-box' }}>
          <StudentPortal 
            onBack={isFromAdmin ? () => handleViewChange('main') : undefined} 
          />
        </div>
      ) : currentView === 'teacherPortal' ? (
        <div style={{ padding: '10px 0', width: '100%', boxSizing: 'border-box' }}>
          <TeacherPortal 
            onBack={isFromAdmin ? () => handleViewChange('main') : undefined} 
          />
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
            userSelect: 'none',
          }}
        >
          <CalculatorModal isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
        </div>
      )}
    </div>
  );
}