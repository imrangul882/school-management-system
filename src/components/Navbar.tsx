import React from 'react';
import DigitalClock from './DigitalClock';

interface NavbarProps {
  onOpenCalculator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCalculator }) => {
  // const scrollToSection = (id: string) => {
  //   const element = document.getElementById(id);
  //   if (element) {
  //     element.scrollIntoView({ behavior: 'smooth' });
  //   }
  // };

  return (
    <nav style={{ 
      background: 'linear-gradient(135deg, #263d3f 0%, #15ad54 100%)', 
      color: 'white', 
      padding: '15px 20px',
      margin: '0', 
      width: '100%',
      display: 'flex', 
      flexWrap: 'wrap',
      justifyContent: 'space-between', 
      alignItems: 'center', 
      borderRadius: '0 0 6px 6px', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'fixed',
      top: 0,
      left: 0,
      boxSizing: 'border-box',
      zIndex: 1000
    }}>
      {/* Left Side: Calculator Button aur Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <button 
          onClick={onOpenCalculator}
          style={{ 
            background: 'linear-gradient(135deg, #dd3d72 0%, #500711 100%)', 
            color: '#fff', 
            border: '1px solid #8b5cf6', 
            padding: '8px 14px', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: '600', 
            fontSize: '13px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}      
        >
          Calculator
        </button>
        <h2 style={{ margin: 0, fontSize: '18px' }}>Finland School Management System</h2>
      </div>
      
      {/* Center: Digital Clock */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        <DigitalClock />
      </div>

      {/* Right Side Links */}
      {/* <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: 'bold' }}>
        <span onClick={() => scrollToSection('dashboard')} style={{ cursor: 'pointer' }}>Dashboard</span>
        <span onClick={() => scrollToSection('students-section')} style={{ cursor: 'pointer' }}>Students</span>
        <span onClick={() => scrollToSection('teachers-section')} style={{ cursor: 'pointer' }}>Teachers</span>
        <span onClick={() => scrollToSection('finance-section')} style={{ cursor: 'pointer' }}>Finance</span>
      </div> */}
    </nav>
  );
};