import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { updateFeeStatus } from '../features/students/studentSlice';
import { fetchPeriodAttendanceFromSupabase } from './AttendancePanel/periodAttendanceSlice';
import { supabase } from '../supabaseClient';

interface StudentPortalProps {
  onBack?: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ onBack }) => {
  const dispatch = useAppDispatch();
  const periodRecords = useAppSelector((state: any) => state.periodAttendance?.periodRecords || []);
  const attendanceLoading = useAppSelector((state: any) => state.periodAttendance?.loading);
  
  // Tabs: 'login' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Login States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Register States (Create Password)
  const [regIdentifier, setRegIdentifier] = useState('');
  const [regCnic, setRegCnic] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Forgot Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('');

  const [searchedStudent, setSearchedStudent] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('JazzCash Mobile Account');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthShort = monthNames[now.getMonth()];
  const currentActiveMonth = `${currentMonthShort} ${currentYear}`;
  const [selectedAttendanceMonth, setSelectedAttendanceMonth] = useState(`${currentYear}-${currentMonthNum}`);

  useEffect(() => {
    dispatch(fetchPeriodAttendanceFromSupabase() as any);
  }, [dispatch]);

  const defaultYearlyFee = [
    { month: 'Jan 2026', type: 'Monthly', dueDate: '11-Jan-2026', voucherId: '2026-01', status: 'Paid' },
    { month: 'Feb 2026', type: 'Monthly', dueDate: '11-Feb-2026', voucherId: '2026-02', status: 'Paid' },
    { month: 'Mar 2026', type: 'Monthly', dueDate: '11-Mar-2026', voucherId: '2026-03', status: 'Paid' },
    { month: 'Apr 2026', type: 'Monthly', dueDate: '11-Apr-2026', voucherId: '2026-04', status: 'Paid' },
    { month: 'May 2026', type: 'Monthly', dueDate: '11-May-2026', voucherId: '2026-05', status: 'Paid' },
    { month: 'Jun 2026', type: 'Monthly', dueDate: '11-Jun-2026', voucherId: '2026-06', status: 'Paid' },
    { month: 'Jul 2026', type: 'Monthly', dueDate: '11-Jul-2026', voucherId: '2026-07', status: 'Paid' },
    { month: 'Aug 2026', type: 'Monthly', dueDate: '11-Aug-2026', voucherId: '2026-08', status: 'Pending' },
    { month: 'Sep 2026', type: 'Monthly', dueDate: '11-Sep-2026', voucherId: '2026-09', status: 'Pending' },
    { month: 'Oct 2026', type: 'Monthly', dueDate: '11-Oct-2026', voucherId: '2026-10', status: 'Pending' },
    { month: 'Nov 2026', type: 'Monthly', dueDate: '11-Nov-2026', voucherId: '2026-11', status: 'Pending' },
    { month: 'Dec 2026', type: 'Monthly', dueDate: '11-Dec-2026', voucherId: '2026-12', status: 'Pending' },
  ];

 // 1. Sara data store karne ke liye state
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // 2. Portal khulrte hi background mein sara data pehle se fetch kar lein
  useEffect(() => {
    dispatch(fetchPeriodAttendanceFromSupabase() as any);
    fetchStudentsData();
  }, [dispatch]);

  const fetchStudentsData = async () => {
    setDataLoading(true);
    const { data, error } = await supabase.from('students').select('*');
    if (!error && data) {
      setAllStudents(data);
    }
    setDataLoading(false);
  };

  // --- 3. FAST LOGIN LOGIC (Local Array Search - No Waiting!) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      alert('Please enter Roll No/Name and Password.');
      return;
    }

    if (dataLoading) {
      alert('Data is still loading, please wait a second...');
      return;
    }

    const query = identifier.trim().toLowerCase();

    // Pehle se fetched data mein se foran find karein (Super Fast)
    const found = allStudents.find((s: any) => {
      const matchId = 
        s.name?.toLowerCase().includes(query) || 
        s.rollNo?.toString().toLowerCase() === query ||
        s.roll_no?.toString().toLowerCase() === query ||
        s.id?.toString() === query;
      
      const dbPass = (s.password || '').toString().trim();
      return matchId && dbPass === password.trim();
    });

    if (found) {
      setupStudentData(found);
    } else {
      alert('Invalid Roll No/Name or Password! Please check your credentials.');
    }
  };
  // --- 2. CREATE PASSWORD / REGISTER LOGIC ---
 // --- 2. CREATE PASSWORD / REGISTER LOGIC ---
  const handleRegisterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regIdentifier.trim() || !regCnic.trim() || !newPassword.trim()) {
      alert('Please fill in all fields to create your password.');
      return;
    }

    const query = regIdentifier.trim().toLowerCase();
    const { data: liveStudents, error: fetchError } = await supabase.from('students').select('*');

    if (fetchError) {
      alert('Database error: ' + fetchError.message);
      return;
    }

    // Student ko find karein (Roll No, Name ya ID ke zariye)
    const studentToUpdate = liveStudents?.find((s: any) => {
      const dbName = (s.name || '').toLowerCase();
      const dbRollNo = (s.rollNo || s.roll_no || '').toString().toLowerCase();
      const dbId = (s.id || '').toString().toLowerCase();
      
      return dbName.includes(query) || dbRollNo === query || dbId === query;
    });

    if (!studentToUpdate) {
      alert('Student not found in the database. Contact admin.');
      return;
    }

    // Update password and cnic in Supabase database without strict pre-check
    const { error } = await supabase
      .from('students')
      .update({ 
        password: newPassword.trim(),
        cnic: regCnic.trim() 
      })
      .eq('id', studentToUpdate.id);

    if (error) {
      alert('Failed to set password: ' + error.message);
    } else {
      alert('Password registered successfully! You can now log in.');
      setActiveTab('login');
      setNewPassword('');
      setRegCnic('');
      setRegIdentifier('');
    }
  };

  // --- 3. FORGOT PASSWORD REQUEST LOGIC ---
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      alert('Please enter your Roll No or Name.');
      return;
    }

    const query = forgotIdentifier.trim().toLowerCase();
    const { data: liveStudents, error: fetchError } = await supabase.from('students').select('*');

    if (fetchError) {
      alert('Database error: ' + fetchError.message);
      return;
    }

    const studentToReset = liveStudents?.find((s: any) => {
      const dbName = (s.name || '').toLowerCase();
      const dbRollNo = (s.rollNo || s.roll_no || '').toString().toLowerCase();
      const dbId = (s.id || '').toString().toLowerCase();
      
      return dbName.includes(query) || dbRollNo === query || dbId === query;
    });

    if (!studentToReset) {
      alert('Student record not found.');
      return;
    }

    const { error } = await supabase
      .from('students')
      .update({ reset_requested: true })
      .eq('id', studentToReset.id);

    if (error) {
      alert('Error sending request: ' + error.message);
    } else {
      alert('Password reset request sent to Admin successfully!');
      setActiveTab('login');
      setForgotIdentifier('');
    }
  };

  const setupStudentData = (found: any) => {
    const studentFeeAmount = Number(found.feeAmount || found.fee || 3000);
    const uniqueKey = found.rollNo || found.roll_no || found.id;
    const savedHistory = localStorage.getItem(`student_fee_${uniqueKey}`);
    
    let feeHistory = savedHistory ? JSON.parse(savedHistory) : defaultYearlyFee.map(item => ({
      ...item,
      amount: studentFeeAmount, 
      voucherId: `2026-${uniqueKey}-${item.voucherId.split('-')[1]}`
    }));

    setSearchedStudent({
      ...found,
      rollNo: found.rollNo || found.roll_no,
      studentClass: found.studentClass || found.class || found.className,
      feeHistory
    });
  };

  const handlePayFee = () => {
    if (searchedStudent && selectedVoucher) {
      const updatedHistory = searchedStudent.feeHistory.map((item: any) => 
        item.voucherId === selectedVoucher.voucherId ? { ...item, status: 'Paid' } : item
      );

      setSearchedStudent({ ...searchedStudent, feeHistory: updatedHistory });
      localStorage.setItem(`student_fee_${searchedStudent.id}`, JSON.stringify(updatedHistory));
      dispatch(updateFeeStatus({ id: searchedStudent.id, feeStatus: 'Paid' } as any));
      
      alert(`Fee successfully paid for ${selectedVoucher.month} via ${paymentMethod}!`);
      setShowPaymentModal(false);
      setSelectedVoucher(null);
    }
  };

  const currentMonthRecord = searchedStudent?.feeHistory?.filter((item: any) => item.month === currentActiveMonth) || [];

  const studentAttendanceRecords = searchedStudent 
    ? periodRecords.filter((r: any) => {
        const studentRoll = searchedStudent.rollNo || searchedStudent.roll_no;
        const matchesStudent = (r.rollNo && studentRoll && r.rollNo.toLowerCase() === studentRoll.toLowerCase()) ||
                               (r.studentName && searchedStudent.name && r.studentName.toLowerCase().includes(searchedStudent.name.toLowerCase()));
        const matchesMonth = r.date?.startsWith(selectedAttendanceMonth);
        return matchesStudent && matchesMonth;
      })
    : [];

  return (
    <div style={{ 
        background: 'linear-gradient(135deg, #052618 0%, #0dd5d2 100%)', 
        color: '#fff', 
        border: '1px solid #8b5cf6', 
        padding: '20px', 
        borderRadius: '10px', 
        fontWeight: '600',
        width: '100%',
        boxSizing: 'border-box',
        fontSize: '14px',
        boxShadow: '0 0 15px rgba(37, 18, 70, 0.3)',
        transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, color: '#fff', fontSize: 'clamp(18px, 4vw, 22px)' }}>
           Student Portal (Fee & Academic History)
        </h2>
        
        {onBack && (
          <button 
            onClick={onBack}
            style={{ background: '#475569', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
          >
            ← Back to Dashboard
          </button>
        )}
      </div>

      {!searchedStudent ? (
        <div style={{ maxWidth: '450px', margin: '30px auto', background: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937', textAlign: 'left', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          
          {/* Tabs Navigation */}
          <div style={{ display: 'flex', marginBottom: '20px', background: '#1f2937', borderRadius: '8px', padding: '4px' }}>
            <button 
              type="button"
              onClick={() => setActiveTab('login')} 
              style={{ flex: 1, background: activeTab === 'login' ? '#2563eb' : 'transparent', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              Login
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('register')} 
              style={{ flex: 1, background: activeTab === 'register' ? '#2563eb' : 'transparent', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              Create Password
            </button>
          </div>

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#f3f4f6', fontSize: '18px', textAlign: 'center' }}>Student Login</h3>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '4px' }}>Roll No or Name *</label>
                <input 
                  type="text"
                  placeholder="Enter Roll No or Name..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', background: '#1f2937', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '4px' }}>Password *</label>
                <input 
                  type="password"
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', background: '#1f2937', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => setActiveTab('forgot')} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>
                  Forgot Password?
                </button>
              </div>
              <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Login
              </button>
            </form>
          )}

          {/* TAB 2: CREATE PASSWORD */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#f3f4f6', fontSize: '18px', textAlign: 'center' }}>Create Password</h3>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '4px' }}>Roll No or Name *</label>
                <input 
                  type="text"
                  placeholder="Enter Roll No or Name..."
                  value={regIdentifier}
                  onChange={(e) => setRegIdentifier(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', background: '#1f2937', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '4px' }}>CNIC / B-Form Number *</label>
                <input 
                  type="text"
                  placeholder="Enter CNIC or B-Form..."
                  value={regCnic}
                  onChange={(e) => setRegCnic(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', background: '#1f2937', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '4px' }}>New Password *</label>
                <input 
                  type="password"
                  placeholder="Choose new password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', background: '#1f2937', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" style={{ background: '#059669', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Register & Set Password
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#f3f4f6', fontSize: '18px', textAlign: 'center' }}>Reset Password Request</h3>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '4px' }}>Roll No or Name *</label>
                <input 
                  type="text"
                  placeholder="Enter Roll No or Name..."
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #374151', background: '#1f2937', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" style={{ background: '#d97706', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Send Request to Admin
              </button>
              <button type="button" onClick={() => setActiveTab('login')} style={{ background: 'transparent', border: '1px solid #374151', color: '#9ca3af', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                Back to Login
              </button>
            </form>
          )}

        </div>
      ) : (
        <div>
          {/* Logout Button Header */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <button 
              onClick={() => { setSearchedStudent(null); setPassword(''); setIdentifier(''); }}
              style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
            >
              Logout Portal
            </button>
          </div>

          {/* Student Profile Card */}
          <div style={{ margin: '15px 0', padding: '15px', background: '#111827', borderRadius: '6px', borderLeft: '4px solid #2196F3', display: 'flex', alignItems: 'center', gap: '15px', boxSizing: 'border-box', flexWrap: 'wrap' }}>
            {searchedStudent.image ? (
              <img 
                src={searchedStudent.image} 
                alt={searchedStudent.name} 
                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2196F3', flexShrink: 0 }} 
              />
            ) : (
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#64748b', fontWeight: 'bold', flexShrink: 0 }}>
                No Pic
              </div>
            )}

            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ margin: '0 0 6px 0', color: '#fff', fontSize: '16px' }}>Welcome, {searchedStudent.name}!</h3>
              <p style={{ margin: '4px 0', color: '#cbd5e1', fontSize: '13px', wordBreak: 'break-word' }}>
                <strong>Roll No:</strong> {searchedStudent.rollNo || 'N/A'} | <strong>Father Name:</strong> {searchedStudent.fatherName || 'N/A'}
              </p>       
              <p style={{ margin: '4px 0', color: '#cbd5e1', fontSize: '13px', wordBreak: 'break-word' }}>
                <strong>Class:</strong> {searchedStudent.studentClass || 'N/A'} | <strong>Section:</strong> {searchedStudent.section || 'N/A'}
              </p>
            </div>
          </div>

          {/* Fee Voucher Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 10px', flexWrap: 'wrap', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', color: '#fff' }}>Current Running Month Fee Voucher ({currentActiveMonth}):</h4>
            <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
              Active Session 2026
            </span>
          </div>
          
          <div style={{ width: '100%', overflowX: 'auto', marginBottom: '30px' }}>
            <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', background: '#fff', color: '#000', border: '1px solid #e0e0e0', borderRadius: '6px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #e0e0e0', textAlign: 'left', fontSize: '13px' }}>
                  <th style={{ padding: '10px' }}>Month</th>
                  <th style={{ padding: '10px' }}>Amount</th>
                  <th style={{ padding: '10px' }}>Type</th>
                  <th style={{ padding: '10px' }}>Due Date</th>
                  <th style={{ padding: '10px' }}>Voucher ID</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentMonthRecord.map((item: any, index: number) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f0f0f0', fontSize: '13px' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.month}</td>
                    <td style={{ padding: '10px', color: '#d32f2f', fontWeight: 'bold' }}>Rs: {item.amount} /-</td>
                    <td style={{ padding: '10px' }}>{item.type}</td>
                    <td style={{ padding: '10px' }}>{item.dueDate}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: '#555' }}>{item.voucherId}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: item.status === 'Paid' ? 'green' : 'red' }}>
                      {item.status}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {item.status !== 'Paid' ? (
                        <button 
                          onClick={() => {
                            setSelectedVoucher(item);
                            setShowPaymentModal(true);
                          }}
                          style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '12px' }}>Paid ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Attendance & Topics Covered Section */}
          <div style={{ background: '#2e3747', padding: '20px', borderRadius: '10px', border: '1px solid #e1e4eb', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#fae9e9' }}> Attendance & Lecture Topics History</h4>
              <input 
                type="month" 
                value={selectedAttendanceMonth} 
                onChange={(e) => setSelectedAttendanceMonth(e.target.value)} 
                style={{ background: '#eaedf1', color: '#141942', border: '1px solid #374151', padding: '6px 10px', borderRadius: '6px', fontSize: '13px' }}
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', background: '#1f2937', borderRadius: '6px' }}>
                <thead>
                  <tr style={{ background: '#374151', borderBottom: '2px solid #4b5563', color: '#d1d5db' }}>
                    <th style={{ padding: '10px' }}>Date</th>
                    <th style={{ padding: '10px' }}>Period</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Teacher & Topic Covered</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLoading ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '15px', textAlign: 'center', color: '#9ca3af' }}>Loading attendance records...</td>
                    </tr>
                  ) : studentAttendanceRecords.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '15px', textAlign: 'center', color: '#9ca3af' }}>No attendance or lecture records found for this month.</td>
                    </tr>
                  ) : (
                    studentAttendanceRecords.map((record: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #374151' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#e5e7eb' }}>{record.date}</td>
                        <td style={{ padding: '10px', color: '#facc15' }}>{record.period}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ 
                            padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                            background: record.status === 'Present' ? '#183b26' : '#d8b3b3',
                            color: record.status === 'Present' ? '#e5ece8' : '#f87171'
                          }}>
                            {record.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px', color: '#e5e7eb' }}>
                          <div style={{ fontSize: '11px', color: '#a78bfa', marginBottom: '2px' }}>Teacher: {record.teacherName || 'N/A'}</div>
                          <div>{record.topicDetail || 'No topic details provided'}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedVoucher && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '10px', boxSizing: 'border-box' }}>
          <div style={{ background: '#fff', color: '#000', padding: '20px', borderRadius: '8px', width: '100%', maxWidth: '380px', textAlign: 'left', boxSizing: 'border-box' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '15px', fontSize: '18px' }}>Fee Payment Gateway</h3>
            <p style={{ fontSize: '13px' }}>Student: <strong>{searchedStudent?.name}</strong></p>
            <p style={{ fontSize: '13px' }}>Month: <strong>{selectedVoucher.month}</strong></p>
            <p style={{ fontSize: '13px' }}>Voucher ID: <code style={{ background: '#eee', padding: '2px 5px', borderRadius: '3px' }}>{selectedVoucher.voucherId}</code></p>
            <p style={{ fontSize: '13px' }}>Amount: <strong>Rs. {selectedVoucher.amount}</strong></p>
            
            <p style={{ margin: '12px 0 5px', fontSize: '13px' }}>Select Payment Method:</p>
            <select 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            >
              <option value="JazzCash Mobile Account">JazzCash Mobile Account</option>
              <option value="EasyPaisa Mobile Account">EasyPaisa Mobile Account</option>
              <option value="Direct Bank Transfer">Direct Bank Transfer</option>
            </select>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                onClick={() => setShowPaymentModal(false)}
                style={{ background: '#ccc', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button 
                onClick={handlePayFee}
                style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};