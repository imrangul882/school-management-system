import React from 'react';
import { useAppSelector } from '../app/hooks'; // Yahan se 'useAppDispatch' hata diya hai kyunke abhi zaroorat nahi

export const Revenuefinance: React.FC = () => {
  const students = useAppSelector((state: any) => state.students?.students || []);
  const teachers = useAppSelector((state: any) => state.teachers?.teachers || []);
const staffList = useAppSelector((state: any) => state.staff?.staffList || []);
  const totalPaidRevenue = students
    .filter((s: any) => s.feeStatus === 'Paid')
    .reduce((sum: number, s: any) => sum + (Number(s.feeAmount) || 0), 0);

  const totalPendingFee = students
    .filter((s: any) => s.feeStatus === 'Pending')
    .reduce((sum: number, s: any) => sum + (Number(s.feeAmount) || 0), 0);

  const totalTeacherSalaries = teachers
    .reduce((sum: number, t: any) => sum + (Number(t.salary) || 0), 0);

  const totalStaffSalaries = staffList
    .reduce((sum: number, st: any) => sum + (Number(st.salary) || 0), 0);

  const totalMonthlySalaries = totalTeacherSalaries + totalStaffSalaries;

  return (
    <div style={{ marginTop: '30px', padding: '24px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '18px', fontWeight: '600' }}>
        School Financial & Revenue Analytics
      </h3>

      {/* Teachers aur Staff ki alag-alag salaries ke cards */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', flex: 1, minWidth: '180px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Total Teachers Salary</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#38bdf8' }}>Rs. {totalTeacherSalaries}</span>
        </div>
        <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', flex: 1, minWidth: '180px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Total Staff Salary</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#34d399' }}>Rs. {totalStaffSalaries}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Collected Fee Card */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '10px', flex: 1, minWidth: '200px', border: '2px solid #22c55e', boxShadow: '0 0 10px rgba(34, 197, 94, 0.2)' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Collected Fee Revenue</h4>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#4ade80' }}>Rs. {totalPaidRevenue}</p>
        </div>

        {/* Pending Fee Card */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '10px', flex: 1, minWidth: '200px', border: '2px solid #ef4444', boxShadow: '0 0 10px rgba(239, 68, 68, 0.2)' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Fee Dues</h4>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#f87171' }}>Rs. {totalPendingFee}</p>
        </div>

        {/* Total Monthly Salaries Card (Teachers + Staff combined) */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '10px', flex: 1, minWidth: '200px', border: '2px solid #f59e0b', boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Monthly Salaries</h4>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#fbbf24' }}>Rs. {totalMonthlySalaries}</p>
        </div>

      </div>
    </div>
  );
};