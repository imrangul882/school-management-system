import React from 'react';



export const Navbar: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav style={{ 
      background: '#1976d2', 
      color: 'white', 
      padding: '20px 20px',
      margin:'10px', 
      display: 'flex', 
      flexWrap: 'wrap',
      justifyContent: 'space-between', 
      alignItems: 'center', 
      borderRadius: '6px', 
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <h2 style={{ margin: 0, fontSize: '20px' }}>Finland School Management System</h2>
      <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: 'bold' }}>
        <span onClick={() => scrollToSection('dashboard')} style={{ cursor: 'pointer' }}>Dashboard</span>
        <span onClick={() => scrollToSection('students-section')} style={{ cursor: 'pointer' }}>Students</span>
        <span onClick={() => scrollToSection('teachers-section')} style={{ cursor: 'pointer' }}>Teachers</span>
        <span onClick={() => scrollToSection('finance-section')} style={{ cursor: 'pointer' }}>Finance</span>
      </div>
    </nav>
  );
};