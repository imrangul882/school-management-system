import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { 
  fetchAttendanceFromSupabase, 
  addThumbInToSupabase, 
  updateThumbOutInSupabase, 
  addSmsLog 
} from './attendanceSlice';

export const AttendancePanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const students = useAppSelector((state: any) => state.students.students);
  const attendanceRecords = useAppSelector((state: any) => state.attendance.records);
  const smsLogs = useAppSelector((state: any) => state.attendance.smsLogs);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [pickedByMap, setPickedByMap] = useState<{ [key: string]: string }>({});

  // Component load hone par Supabase se records fetch karein
  useEffect(() => {
    dispatch(fetchAttendanceFromSupabase());
  }, [dispatch]);

  const handleThumbIn = async () => {
    const student = students.find((s: any) => s.id === selectedStudentId);
    if (!student) {
      alert("Please select a student first!");
      return;
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Supabase mein Thumb In entry save karein
    try {
      await dispatch(addThumbInToSupabase({
        studentId: student.id,
        studentName: student.name,
        studentClass: student.studentClass,
        section: student.section || 'A',
        parentPhone: student.parentPhone || 'Not Provided',
        inTime: currentTime
      })).unwrap();
    } catch (error) {
      console.error("Failed to save Thumb In to Supabase:", error);
      alert("Database error while marking Thumb In.");
      return;
    }

    const message = `Alert: Your child ${student.name} (${student.studentClass} - Sec ${student.section || 'A'}) has safely arrived at school at ${currentTime}.`;
    const encodedMessage = encodeURIComponent(message);

    if (student.parentPhone && student.parentPhone !== 'Not Provided') {
      let formattedPhone = student.parentPhone.replace(/[^0-9]/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '92' + formattedPhone.slice(1);
      }
      
      // SMS Log dispatch karein
      dispatch(addSmsLog({
        phone: formattedPhone,
        message: message,
        time: currentTime
      }));

      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert("Attendance marked, but Parent Phone number is missing!");
    }

    setSelectedStudentId('');
  };

  const handleThumbOut = async (recordId: string, studentId: string) => {
    const record = attendanceRecords.find((r: any) => r.id === recordId || r.studentId === studentId);
    const student = students.find((s: any) => s.id === studentId);
    const parentPhone = student?.parentPhone || record?.parentPhone;
    const pickedBy = pickedByMap[studentId] || 'Father';
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (!record) {
      alert("Attendance record not found!");
      return;
    }

    // Supabase mein Thumb Out update karein
    try {
      await dispatch(updateThumbOutInSupabase({
        recordId: record.id,
        outTime: currentTime,
        pickedBy: pickedBy
      })).unwrap();
    } catch (error) {
      console.error("Failed to update Thumb Out in Supabase:", error);
      alert("Database error while marking Thumb Out.");
      return;
    }

    const studentName = student?.name || record?.studentName || 'Student';
    const studentClass = student?.studentClass || record?.studentClass || '';
    const section = student?.section || record?.section || 'A';

    const message = `Alert: Your child ${studentName} (${studentClass} - Sec ${section}) has safely left the school at ${currentTime}, picked by ${pickedBy}.`;
    const encodedMessage = encodeURIComponent(message);

    if (parentPhone && parentPhone !== 'Not Provided') {
      let formattedPhone = parentPhone.replace(/[^0-9]/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '92' + formattedPhone.slice(1);
      }
      
      // SMS Log dispatch karein
      dispatch(addSmsLog({
        phone: formattedPhone,
        message: message,
        time: currentTime
      }));

      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert("Checked out successfully, but Parent Phone number is missing!");
    }
  };

  const handlePickedByChange = (studentId: string, value: string) => {
    setPickedByMap(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  return (
    <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '24px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '22px', fontWeight: '700' }}>
            Gate Biometric & Smart WhatsApp Alert System
        </h2>
        <p style={{ margin: 0, color: '#e3e7ee', fontSize: '14px' }}>
          Simulate fingerprint entries (Thumb In) and exits (Thumb Out) to automatically dispatch parent notifications via WhatsApp.
        </p>
      </div>

      {/* Control Box */}
      <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#334155', fontSize: '13px' }}>
            Select Student for Fingerprint (Thumb IN):
          </label>
          <select 
            value={selectedStudentId} 
            onChange={(e) => setSelectedStudentId(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', color: '#1e293b', outline: 'none' }}
          >
            <option value="">-- Choose Student (Name, Class, Section) --</option>
            {students.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name} — Class: {s.studentClass} (Sec: {s.section || 'A'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <button 
            onClick={handleThumbIn}
            style={{ 
              background: '#16a34a', 
              color: 'white', 
              border: 'none', 
              padding: '11px 20px', 
              cursor: 'pointer', 
              borderRadius: '6px', 
              fontWeight: '600', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
            }}
          >
              Thumb IN & WhatsApp Alert
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Active Students Table */}
        <div style={{ flex: 2, minWidth: '450px', background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 14px 0', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
             Students Currently Inside School
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 12px' }}>Student Name</th>
                  <th style={{ padding: '10px 12px' }}>Class / Section</th>
                  <th style={{ padding: '10px 12px' }}>In Time</th>
                  <th style={{ padding: '10px 12px' }}>Action (Thumb OUT)</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.filter((r: any) => r.status === 'In School').length > 0 ? (
                  attendanceRecords.filter((r: any) => r.status === 'In School').map((record: any) => (
                    <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#0f172a' }}>{record.studentName}</td>
                      <td style={{ padding: '12px', color: '#475569' }}>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                          {record.studentClass} — Sec: {record.section || 'A'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#16a34a', fontWeight: '600' }}>{record.inTime}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <select 
                            value={pickedByMap[record.studentId] || 'Father'} 
                            onChange={(e) => handlePickedByChange(record.studentId, e.target.value)} 
                            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          >
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Uncle">Uncle</option>
                            <option value="School Van Driver">Van Driver</option>
                          </select>
                          <button 
                            onClick={() => handleThumbOut(record.id, record.studentId)}
                            style={{ background: '#dc2626', color: 'white', border: 'none', padding: '7px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: '600', fontSize: '13px' }}
                          >
                            Thumb OUT
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px', fontSize: '14px' }}>
                      No students currently checked in.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live SMS / WhatsApp Logs Panel */}
        <div style={{ flex: 1, minWidth: '320px', background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 14px 0', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
            📱 Live WhatsApp Gateway Log
          </h3>
          <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {smsLogs.length > 0 ? (
              smsLogs.map((log: any) => (
                <div key={log.id} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', borderLeft: '4px solid #2563eb', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748b' }}>
                    To: <b>{log.phone}</b> • {log.time}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>{log.message}</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: '30px 0' }}>
                No messages dispatched yet today.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};