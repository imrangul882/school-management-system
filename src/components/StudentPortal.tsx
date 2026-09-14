import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { updateFeeStatus } from '../features/students/studentSlice';
import { fetchPeriodAttendanceFromSupabase } from '../features/attendance/periodAttendanceSlice';

export const StudentPortal: React.FC = () => {
  const dispatch = useAppDispatch();
  const students = useAppSelector((state: any) => state.students?.students || []);
  const periodRecords = useAppSelector((state: any) => state.periodAttendance?.periodRecords || []);
  const attendanceLoading = useAppSelector((state: any) => state.periodAttendance?.loading);
  
 const [searchId, setSearchId] = useState<string>('');
  const [searchedStudent, setSearchedStudent] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('JazzCash Mobile Account');

  // --- Yahan se automatic date ka code lagana hai ---
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
  
  // Mahino ke naam ke liye array
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthShort = monthNames[now.getMonth()];

  const currentActiveMonth = `${currentMonthShort} ${currentYear}`; // e.g. "Sep 2026"
  const [selectedAttendanceMonth, setSelectedAttendanceMonth] = useState(`${currentYear}-${currentMonthNum}`); // e.g. "2026-09"
  // --------------------------------------------------

  // Component load hotay hi Supabase se period attendance records fetch kar lena
  useEffect(() => {
    dispatch(fetchPeriodAttendanceFromSupabase() as any);
  }, [dispatch]);
  // Component load hotay hi Supabase se period attendance records fetch kar lena
 

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
  // const currentVoucher = defaultYearlyFee.find(v => v.month === currentActiveMonth) || defaultYearlyFee[7];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchId.trim().toLowerCase();
    if (!query) {
      alert('Please enter Roll No or Name.');
      return;
    }

    const found = students.find((s: any) => 
      (s.rollNo && s.rollNo.toLowerCase() === query) || 
      s.name.toLowerCase().includes(query)
    );
    
    if (found) {
      const studentFeeAmount = Number(found.feeAmount || found.fee || 3000);
      const uniqueKey = found.rollNo ? found.rollNo : found.id;
      const savedHistory = localStorage.getItem(`student_fee_${uniqueKey}`);
      
      let feeHistory = savedHistory ? JSON.parse(savedHistory) : defaultYearlyFee.map(item => ({
        ...item,
        amount: studentFeeAmount, 
        voucherId: `2026-${uniqueKey}-${item.voucherId.split('-')[1]}`
      }));

      setSearchedStudent({
        ...found,
        feeHistory
      });
    } else {
      setSearchedStudent(null);
      alert('Student not found! Please check Roll No or Name.');
    }
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

  // Student ki attendance aur lecture records filter karna
  const studentAttendanceRecords = searchedStudent 
    ? periodRecords.filter((r: any) => {
        const matchesStudent = (r.rollNo && searchedStudent.rollNo && r.rollNo.toLowerCase() === searchedStudent.rollNo.toLowerCase()) ||
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
      <h2 style={{ textAlign: 'center', color: '#fff', fontSize: 'clamp(18px, 4vw, 22px)', marginBottom: '20px' }}>
        🎓 Student Portal (Fee & Academic History)
      </h2>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', margin: '15px 0', flexWrap: 'wrap' }}>
        <input 
          type="text"
          placeholder="Enter Roll No or Name..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{ flex: 1, minWidth: '180px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', background: '#fff', color: '#000' }}
        />
        <button 
          type="submit"
          style={{ background: '#2196F3', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Search
        </button>
      </form>

      {searchedStudent ? (
        <div>
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
                <strong>Roll No:</strong> {searchedStudent.rollNo || 'N/A'} | <strong>Father Name:</strong> {searchedStudent.fatherName}
              </p>        
              <p style={{ margin: '4px 0', color: '#cbd5e1', fontSize: '13px', wordBreak: 'break-word' }}>
                <strong>Class:</strong> {searchedStudent.studentClass} | <strong>Section:</strong> {searchedStudent.section}
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
      ) : (
        <p style={{ color: '#e2e8f0', textAlign: 'center', margin: '30px 0', fontSize: '13px' }}>Please enter Student Roll No or Name to view details.</p>
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