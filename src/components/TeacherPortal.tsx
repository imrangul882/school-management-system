import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { fetchPeriodAttendanceFromSupabase } from '../features/attendance/periodAttendanceSlice';

interface TeacherPortalProps {
  onBack?: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ onBack }) => {
  const dispatch = useAppDispatch();
  const teachers = useAppSelector((state: any) => state.teachers?.teachers || []);
  
  // Supabase se period attendance records lena
  const periodRecords = useAppSelector((state: any) => state.periodAttendance?.periodRecords || []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTeacher, setActiveTeacher] = useState<any | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  // Component load hotay hi Supabase se period attendance fetch karna
  useEffect(() => {
    dispatch(fetchPeriodAttendanceFromSupabase() as any);
  }, [dispatch]);

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    const found = teachers.find((t: any) => 
      t.name?.toLowerCase().includes(query) || 
      t.id?.toString() === query ||
      t.code?.toString() === query
    );
    if (found) {
      setActiveTeacher(found);
    } else {
      alert('Teacher not found! Please enter a valid name or ID.');
      setActiveTeacher(null);
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #052618 0%, #0dd5d2 100%)', 
        color: '#fff', 
        border: '1px solid #8b5cf6', 
        padding: '12px 20px', 
        borderRadius: '10px', 
        // cursor: 'pointer', 
        fontWeight: '600',
        width: '100%', minHeight: '100vh',
        fontSize: '14px',
        textAlign: 'center',
        boxShadow: '0 0 15px rgba(37, 18, 70, 0.3)',
        transition: 'all 0.2s ease'}}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#2b3b5c', padding: '16px 24px', borderRadius: '12px', border: '1px solid #1f2937' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#f9fafb' }}> Teacher Portal (Salary & Daily Lecture Log)</h2>
       {onBack && (
          <button 
            onClick={onBack}
            style={{ background: '#475569', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
          >
            ← Back to Dashboard
          </button>
        )}
      </div>

      {!activeTeacher ? (
        <div style={{ maxWidth: '600px', margin: '80px auto', background: '#111827', padding: '32px', borderRadius: '16px', border: '1px solid #1f2937', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          <h3 style={{ marginBottom: '10px', color: '#f3f4f6', fontSize: '22px' }}>Teacher Portal Login</h3>
          <p style={{ color: '#e7ebf3', fontSize: '14px', marginBottom: '20px' }}>Enter your Name or Teacher ID/Code to view your monthly record</p>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Enter Teacher Name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #374151', background: '#1f2937', color: '#fff', fontSize: '14px' }}
            />
            <button 
              onClick={handleSearch}
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              Search
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ background: '#111827', padding: '24px', borderRadius: '14px', border: '1px solid #1f2937', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: '0 0 6px 0', color: '#60a5fa' }}>Welcome, {activeTeacher.name}</h2>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>Subject: <strong>{activeTeacher.subject || 'N/A'}</strong> | ID: #{activeTeacher.id}</p>
            </div>
            <button 
              onClick={() => setActiveTeacher(null)}
              style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
            >
              Logout / Search Another
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937', borderLeft: '4px solid #22c55e' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>Monthly Salary</h4>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#4ade80' }}>Rs. {activeTeacher.salary || 0}</p>
            </div>
            <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>Attendance & History</h4>
                <input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)} 
                  style={{ background: '#1f2937', color: '#fff', border: '1px solid #374151', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}
                />
              </div>
              <p style={{ margin: '6px 0 0 0', color: '#60a5fa', fontWeight: '500', fontSize: '14px' }}>Viewing Month: {selectedMonth}</p>
            </div>
          </div>

          <div style={{ background: '#111827', padding: '20px', borderRadius: '14px', border: '1px solid #1f2937', textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#f3f4f6' }}>Date-Wise Period Lectures & Topics Log</h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#1f2937', borderBottom: '2px solid #374151', color: '#9ca3af' }}>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Class & Section</th>
                    <th style={{ padding: '12px' }}>Period</th>
                    <th style={{ padding: '12px' }}>Book / Topic & Lines Covered Details</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Unique lectures nikalne ka tareeqa taake har period ki entry aik dafa show ho
                    const uniqueLectures = Array.from(
                      new Map(
                       periodRecords.filter((r: any) => {
   const matchesMonth = r.date?.startsWith(selectedMonth);
   const recordTeacher = r.teacherName?.trim().toLowerCase() || '';
   const activeName = activeTeacher.name?.trim().toLowerCase() || '';
   const matchesName = recordTeacher === activeName;

   return matchesMonth && matchesName;
})                      .map((r: any) => [`${r.date}-${r.className}-${r.section}-${r.period}`, r])
                      ).values()
                    ) as any[];

                    if (uniqueLectures.length === 0) {
                      return (
                        <tr>
                          <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
                            No lecture topics recorded for this month yet.
                          </td>
                        </tr>
                      );
                    }

                    return uniqueLectures.map((record: any, index: number) => (
                      <tr key={index} style={{ borderBottom: '1px solid #1f2937' }}>
                        <td style={{ padding: '12px', color: '#e5e7eb', fontWeight: 'bold' }}>{record.date}</td>
                        <td style={{ padding: '12px', color: '#60a5fa' }}>{record.className} - Section {record.section}</td>
                        <td style={{ padding: '12px', color: '#facc15', fontWeight: 'bold' }}>{record.period}</td>
                        <td style={{ padding: '12px', color: '#e5e7eb' }}>
                          <span style={{ background: '#1e3a8a', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', marginRight: '8px' }}>Topic</span>
                          {record.topicDetail || 'No detailed topic recorded'}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};