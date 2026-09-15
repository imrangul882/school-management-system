import React from 'react';
import { useAppSelector } from '../app/hooks';
import { StudentList } from '../features/students/StudentList';
import { ExpenseList } from '../features/finance/ExpenseList';
import { AttendancePanel } from '../features/attendance/AttendancePanel';
import { Revenuefinance } from './Revenuefinance';
import { AdminPasswordRequests } from './AdminPasswordRequests'; // <--- Password requests panel

interface DashboardProps {
  onOpenPeriodAttendance: () => void;
  onOpenTeacherSalaryPanel: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onOpenPeriodAttendance, 
  onOpenTeacherSalaryPanel 
}) => {
  const students = useAppSelector((state: any) => state.students.students || []);
  const teachers = useAppSelector((state: any) => state.teachers?.teachers || []);
  const staffList = useAppSelector((state: any) => state.staff?.staffList || []);
  const expenses = useAppSelector((state: any) => state.finance?.expenses || []);

  const totalFeeCollected = students.filter((s: any) => s.feeStatus === "Paid").reduce((acc: number, curr: any) => acc + Number(curr.feeAmount || curr.fee || 0), 0);

  const totalTeacherSalaries = teachers.reduce((acc: number, curr: any) => acc + Number(curr.salary || 0), 0);
  const totalStaffSalaries = staffList.reduce((acc: number, curr: any) => acc + Number(curr.salary || 0), 0);
  const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + Number(curr.amount || curr.cost || 0), 0);

  const totalSalariesAndExp = totalTeacherSalaries + totalStaffSalaries + totalExpenses;
  const netBalance = totalFeeCollected - totalSalariesAndExp;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#090d16', color: '#f8fafc', padding: '24px', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}>
    
    {/* Top Action Buttons Bar */}
    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', width: '100%' }}>
      <button 
        onClick={onOpenPeriodAttendance}
        style={{ 
          background: 'linear-gradient(135deg, #7c3aed 0%, #23123f 100%)', 
          color: '#fff', 
          border: '1px solid #8b5cf6', 
          padding: '12px 20px', 
          borderRadius: '10px', 
          cursor: 'pointer', 
          fontWeight: '600',
          flex: '1 1 200px',
          fontSize: '14px',
          textAlign: 'center',
          boxShadow: '0 0 15px rgba(37, 18, 70, 0.3)'
        }}
      >
        Period Attendance
      </button>
      
      <button 
        onClick={onOpenTeacherSalaryPanel}
        style={{ 
          background: 'linear-gradient(135deg, #0284c7 0%, #102733 100%)', 
          color: '#fff', 
          border: '1px solid #38bdf8', 
          padding: '12px 20px', 
          borderRadius: '10px', 
          cursor: 'pointer', 
          fontWeight: '600',
          flex: '1 1 200px',
          fontSize: '14px',
          textAlign: 'center',
          boxShadow: '0 0 15px rgba(2, 132, 199, 0.3)'
        }}
      >
        Teacher Attendance
      </button>
    </div>

    <div style={{ marginBottom: '24px', background: '#111827', padding: '24px', borderRadius: '14px', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
      <h1 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: '700', color: '#f9fafb', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>
        Finland School Management System (Pakistan)
      </h1>
      <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0, fontWeight: '500' }}>
        TypeScript + Redux Toolkit Enterprise Dashboard
      </p>
    </div>

    {/* Stats Overview Grid */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
      gap: '16px', 
      marginBottom: '24px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ background: '#111827', padding: '20px', borderRadius: '14px', border: '1px solid #1f2937', borderLeft: '4px solid #3b82f6' }}>
        <h3 style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Total Students</h3>
        <p style={{ fontSize: '26px', fontWeight: '700', color: '#60a5fa', margin: 0 }}>{students.length}</p>
      </div>

      <div style={{ background: '#111827', padding: '20px', borderRadius: '14px', border: '1px solid #1f2937', borderLeft: '4px solid #22c55e' }}>
        <h3 style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Fee Collected</h3>
        <p style={{ fontSize: '26px', fontWeight: '700', color: '#4ade80', margin: 0 }}>Rs. {totalFeeCollected}</p>
      </div>

      <div style={{ background: '#111827', padding: '20px', borderRadius: '14px', border: '1px solid #1f2937', borderLeft: '4px solid #ef4444' }}>
        <h3 style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Salaries & Exp</h3>
        <p style={{ fontSize: '26px', fontWeight: '700', color: '#f87171', margin: 0 }}>Rs. {totalSalariesAndExp}</p>
      </div>
      
      <div style={{ background: '#111827', padding: '20px', borderRadius: '14px', border: '1px solid #1f2937', borderLeft: '4px solid #eab308' }}>
        <h3 style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Net Balance</h3>
        <p style={{ fontSize: '26px', fontWeight: '700', color: '#facc15', margin: 0 }}>Rs. {netBalance}</p>
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* 🔔 Teacher Password Reset Requests Panel */}
      <div style={{ width: '100%', boxSizing: 'border-box' }}>
        <AdminPasswordRequests />
      </div>

      <div style={{ width: '100%', background: '#111827', borderRadius: '14px', border: '1px solid #1f2937', padding: '20px', boxSizing: 'border-box' }}>
        <Revenuefinance />
      </div>

      <div style={{ width: '100%', background: '#4a5c83', borderRadius: '14px', border: '1px solid #1f2937', padding: '20px', boxSizing: 'border-box' }}>
        <StudentList />
      </div>

      <div style={{ width: '100%', background: '#111827', borderRadius: '14px', border: '1px solid #1f2937', padding: '20px', boxSizing: 'border-box' }}>
        <AttendancePanel />
      </div>

      <div style={{ width: '100%', background: '#111827', borderRadius: '14px', border: '1px solid #1f2937', padding: '20px', boxSizing: 'border-box' }}>
        <ExpenseList />
      </div>
    </div> 

  </div>
  );
};