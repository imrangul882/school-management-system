import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { fetchPeriodAttendanceFromSupabase } from './AttendancePanel/periodAttendanceSlice';
import { supabase } from '../supabaseClient'; // Apne project ke mutabiq supabase client ka path check kar lein

interface TeacherPortalProps {
  onBack?: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ onBack }) => {
  const dispatch = useAppDispatch();
  const teachers = useAppSelector((state: any) => state.teachers?.teachers || []);
  const periodRecords = useAppSelector((state: any) => state.periodAttendance?.periodRecords || []);

  // Tabs: 'login' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Form States
  const [identifier, setIdentifier] = useState(''); // Name, ID, or Code
  const [password, setPassword] = useState('');
  
  // Register States
  const [regIdentifier, setRegIdentifier] = useState('');
  const [regCnic, setRegCnic] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Forgot Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('');

  const [activeTeacher, setActiveTeacher] = useState<any | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  useEffect(() => {
    dispatch(fetchPeriodAttendanceFromSupabase() as any);
  }, [dispatch]);

  // --- 1. LOGIN LOGIC (Updated to check live database) ---
  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      alert('Please enter Teacher ID/Name and Password.');
      return;
    }

    const query = identifier.trim().toLowerCase();

    // Seedha Supabase se fresh data fetch karein taake stale state ka masla na ho
    const { data: liveTeachers, error } = await supabase
      .from('teachers')
      .select('*');

    if (error) {
      alert('Database error: ' + error.message);
      return;
    }

    const found = liveTeachers?.find((t: any) => {
      const matchId = 
        t.name?.toLowerCase().includes(query) || 
        t.id?.toString() === query ||
        t.code?.toString() === query;
      
      const dbPass = (t.password || t.pin || '').toString().trim();
      return matchId && dbPass === password.trim();
    });

    if (found) {
      setActiveTeacher(found);
    } else {
      alert('Invalid ID/Name or Password! Please check your credentials.');
    }
  };

  // --- 2. CREATE PASSWORD / REGISTER LOGIC ---
  const handleRegisterPassword = async () => {
    if (!regIdentifier.trim() || !regCnic.trim() || !newPassword.trim()) {
      alert('Please fill in all fields to create your password.');
      return;
    }

    const query = regIdentifier.trim().toLowerCase();
    const teacherToUpdate = teachers.find((t: any) => 
      t.name?.toLowerCase().includes(query) || 
      t.id?.toString() === query ||
      t.code?.toString() === query
    );

    if (!teacherToUpdate) {
      alert('Teacher not found in the database. Contact admin.');
      return;
    }

    // Check if CNIC matches records (if cnic column exists in DB)
    const dbCnic = (teacherToUpdate.cnic || '').toString().trim();
    if (dbCnic && dbCnic !== regCnic.trim()) {
      alert('Entered CNIC does not match our records!');
      return;
    }

    // Update password in Supabase database
    const { error } = await supabase
      .from('teachers')
      .update({ password: newPassword.trim(),

        cnic: regCnic.trim()
       })
      .eq('id', teacherToUpdate.id);

    if (error) {
      alert('Failed to set password: ' + error.message);
    } else {
     alert('Password and CNIC registered successfully! You can now log in.');
      setActiveTab('login');
      setNewPassword('');
      setRegCnic('');
      setRegIdentifier('');
    }
  };

  // --- 3. FORGOT PASSWORD REQUEST LOGIC ---
  const handleForgotRequest = async () => {
    if (!forgotIdentifier.trim()) {
      alert('Please enter your Teacher ID or Name.');
      return;
    }

    const query = forgotIdentifier.trim().toLowerCase();
    const teacherToReset = teachers.find((t: any) => 
      t.name?.toLowerCase().includes(query) || 
      t.id?.toString() === query ||
      t.code?.toString() === query
    );

    if (!teacherToReset) {
      alert('Teacher record not found.');
      return;
    }

    // Database mein request flag update kar dena taake admin ko pata chal jaye
    const { error } = await supabase
      .from('teachers')
      .update({ reset_requested: true })
      .eq('id', teacherToReset.id);

    if (error) {
      alert('Error sending request: ' + error.message);
    } else {
      alert('Password reset request sent to Admin successfully! Admin will review and reset your password.');
      setActiveTab('login');
      setForgotIdentifier('');
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #052618 0%, #0dd5d2 100%)', 
        color: '#fff', border: '1px solid #8b5cf6', padding: '12px 20px', 
        borderRadius: '10px', fontWeight: '600', width: '100%', minHeight: '100vh',
        fontSize: '14px', textAlign: 'center', boxShadow: '0 0 15px rgba(37, 18, 70, 0.3)'}}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#2b3b5c', padding: '16px 24px', borderRadius: '12px', border: '1px solid #1f2937' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#f9fafb' }}>Teacher Portal (Salary & Daily Lecture Log)</h2>
        {onBack && (
          <button onClick={onBack} style={{ background: '#475569', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            ← Back to Dashboard
          </button>
        )}
      </div>

      {!activeTeacher ? (
        <div style={{ maxWidth: '450px', margin: '40px auto', background: '#111827', padding: '32px', borderRadius: '16px', border: '1px solid #1f2937', textAlign: 'left', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          
          {/* TABS HEADER */}
          <div style={{ display: 'flex', marginBottom: '24px', background: '#1f2937', borderRadius: '8px', padding: '4px' }}>
            <button 
              onClick={() => setActiveTab('login')} 
              style={{ flex: 1, background: activeTab === 'login' ? '#2563eb' : 'transparent', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s' }}>
              Login
            </button>
            <button 
              onClick={() => setActiveTab('register')} 
              style={{ flex: 1, background: activeTab === 'register' ? '#2563eb' : 'transparent', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s' }}>
              Create Password
            </button>
          </div>

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <div>
              <h3 style={{ marginBottom: '6px', color: '#f3f4f6', fontSize: '20px', textAlign: 'center' }}>Teacher Login</h3>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '20px', textAlign: 'center' }}>Enter your credentials to access your portal records.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '4px' }}>Teacher ID or Name *</label>
                  <input type="text" placeholder="Enter ID or Name..." value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #374151', background: '#1f2937', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '4px' }}>Password *</label>
                  <input type="password" placeholder="Enter password..." value={password} onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #374151', background: '#1f2937', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button onClick={() => setActiveTab('forgot')} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>
                    Forgot Password?
                  </button>
                </div>

                <button onClick={handleLogin} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                  LOGIN
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE PASSWORD / REGISTER */}
          {activeTab === 'register' && (
            <div>
              <h3 style={{ marginBottom: '6px', color: '#f3f4f6', fontSize: '20px', textAlign: 'center' }}>Create Portal Password</h3>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '20px', textAlign: 'center' }}>Set your password for the first time using your institutional records.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '4px' }}>Teacher ID or Name *</label>
                  <input type="text" placeholder="Enter your ID or Name..." value={regIdentifier} onChange={(e) => setRegIdentifier(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #374151', background: '#1f2937', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '4px' }}>CNIC Number *</label>
                  <input type="text" placeholder="Enter your CNIC..." value={regCnic} onChange={(e) => setRegCnic(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #374151', background: '#1f2937', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '4px' }}>New Password *</label>
                  <input type="password" placeholder="Choose a new password..." value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #374151', background: '#1f2937', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <button onClick={handleRegisterPassword} style={{ background: '#059669', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '6px' }}>
                  REGISTER & SET PASSWORD
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <div>
              <h3 style={{ marginBottom: '6px', color: '#f3f4f6', fontSize: '20px', textAlign: 'center' }}>Reset Password Request</h3>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '20px', textAlign: 'center' }}>Send a password reset request to the administration.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '4px' }}>Teacher ID or Name *</label>
                  <input type="text" placeholder="Enter your ID or Name..." value={forgotIdentifier} onChange={(e) => setForgotIdentifier(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #374151', background: '#1f2937', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <button onClick={handleForgotRequest} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                  SEND REQUEST TO ADMIN
                </button>

                <button onClick={() => setActiveTab('login')} style={{ background: 'transparent', border: '1px solid #374151', color: '#9ca3af', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                  Back to Login
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* PORTAL DASHBOARD AFTER SUCCESSFUL LOGIN */
        <div>
          <div style={{ background: '#111827', padding: '24px', borderRadius: '14px', border: '1px solid #1f2937', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: '0 0 6px 0', color: '#60a5fa' }}>Welcome, {activeTeacher.name}</h2>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>Subject: <strong>{activeTeacher.subject || 'N/A'}</strong> | ID: #{activeTeacher.id}</p>
            </div>
            <button onClick={() => { setActiveTeacher(null); setPassword(''); setIdentifier(''); }}
              style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
              Logout
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
                <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} 
                  style={{ background: '#1f2937', color: '#fff', border: '1px solid #374151', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }} />
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
                    const uniqueLectures = Array.from(
                      new Map(
                        periodRecords.filter((r: any) => {
                          const matchesMonth = r.date?.startsWith(selectedMonth);
                          const recordTeacher = r.teacherName?.trim().toLowerCase() || '';
                          const activeName = activeTeacher.name?.trim().toLowerCase() || '';
                          return matchesMonth && (recordTeacher === activeName);
                        })
                        .map((r: any) => [`${r.date}-${r.className}-${r.section}-${r.period}`, r])
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