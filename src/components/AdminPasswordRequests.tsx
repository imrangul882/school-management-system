import  { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const AdminPasswordRequests = () => {
  const [teacherRequests, setTeacherRequests] = useState<any[]>([]);
  const [studentRequests, setStudentRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    // Teachers requests fetch karein
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .eq('reset_requested', true);

    if (teacherError) {
      console.error('Error fetching teacher requests:', teacherError.message);
    } else {
      setTeacherRequests(teacherData || []);
    }

    // Students requests fetch karein
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('reset_requested', true);

    if (studentError) {
      console.error('Error fetching student requests:', studentError.message);
    } else {
      setStudentRequests(studentData || []);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveTeacherReset = async (teacherId: string, teacherName: string) => {
    const newPassword = prompt(`Enter a new temporary password for teacher ${teacherName}:`);
    if (!newPassword || newPassword.trim() === '') return;

    const { error } = await supabase
      .from('teachers')
      .update({
        password: newPassword.trim(),
        reset_requested: false
      })
      .eq('id', teacherId);

    if (error) {
      alert('Failed to reset password: ' + error.message);
    } else {
      alert(`Password updated successfully for ${teacherName}!`);
      fetchRequests();
    }
  };

  const handleApproveStudentReset = async (studentId: string, studentName: string) => {
    const newPassword = prompt(`Enter a new temporary password for student ${studentName}:`);
    if (!newPassword || newPassword.trim() === '') return;

    const { error } = await supabase
      .from('students')
      .update({
        password: newPassword.trim(),
        reset_requested: false
      })
      .eq('id', studentId);

    if (error) {
      alert('Failed to reset password: ' + error.message);
    } else {
      alert(`Password updated successfully for ${studentName}!`);
      fetchRequests();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Teacher Password Requests */}
      <div style={{ background: '#111827', padding: '20px', borderRadius: '14px', border: '1px solid #1f2937', boxSizing: 'border-box', width: '100%' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f9fafb', margin: '0 0 16px 0' }}>
           Teacher Password Reset Requests ({teacherRequests.length})
        </h3>
        
        {teacherRequests.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#1f2937', color: '#9ca3af', fontSize: '13px' }}>
                  <th style={{ padding: '12px', borderBottom: '1px solid #374151' }}>Teacher Name</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #374151' }}>Phone / ID</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #374151' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {teacherRequests.map((teacher: any) => (
                  <tr key={teacher.id} style={{ borderBottom: '1px solid #1f2937', color: '#f3f4f6', fontSize: '14px' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{teacher.name}</td>
                    <td style={{ padding: '12px', color: '#9ca3af' }}>{teacher.phone || teacher.id}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleApproveTeacherReset(teacher.id, teacher.name)}
                        style={{ 
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                          color: '#fff', 
                          border: 'none', 
                          padding: '8px 14px', 
                          borderRadius: '6px', 
                          cursor: 'pointer', 
                          fontWeight: '600',
                          fontSize: '13px'
                        }}
                      >
                        Reset & Clear
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>Koi teacher password reset ki request mojood nahi hai.</p>
        )}
      </div>

      {/* Student Password Requests */}
      <div style={{ background: '#111827', padding: '20px', borderRadius: '14px', border: '1px solid #1f2937', boxSizing: 'border-box', width: '100%' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f9fafb', margin: '0 0 16px 0' }}>
           Student Password Reset Requests ({studentRequests.length})
        </h3>
        
        {studentRequests.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#1f2937', color: '#9ca3af', fontSize: '13px' }}>
                  <th style={{ padding: '12px', borderBottom: '1px solid #374151' }}>Student Name</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #374151' }}>Roll No / ID</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #374151' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentRequests.map((student: any) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #1f2937', color: '#f3f4f6', fontSize: '14px' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{student.name}</td>
                          <td style={{ padding: '12px', color: '#9ca3af' }}>{student.roll_no || student.id}</td>        
                           <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleApproveStudentReset(student.id, student.name)}
                        style={{ 
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                          color: '#fff', 
                          border: 'none', 
                          padding: '8px 14px', 
                          borderRadius: '6px', 
                          cursor: 'pointer', 
                          fontWeight: '600',
                          fontSize: '13px'
                        }}
                      >
                        Reset & Clear
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>Koi student password reset ki request mojood nahi hai.</p>
        )}
      </div>
    </div>
  );
};