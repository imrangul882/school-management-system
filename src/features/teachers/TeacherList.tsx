import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { addTeacherToSupabase, fetchTeachersFromSupabase, updateSalaryStatus, 
  markThumbInSupabase, markThumbOutSupabase,deleteTeacherFromSupabase } from './teacherSlice';
export const TeacherList: React.FC = () => {
  const dispatch = useAppDispatch();
  const teachers: any[] = useAppSelector((state: any) => state.teachers?.teachers || []);
  
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [salary, setSalary] = useState('');
  const [phone, setPhone] = useState('');

  // Page load hotay hi Supabase se teachers fetch karne ke liye
  useEffect(() => {
    dispatch(fetchTeachersFromSupabase());
  }, [dispatch]);

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subject || !salary) return;

    dispatch(addTeacherToSupabase({
      name,
      subject,
      salary: Number(salary),
      salaryStatus: "Pending",
      phone: phone || 'N/A',
      attendanceStatus: 'Not Marked'
    }));

    setName('');
    setSubject('');
    setSalary('');
    setPhone('');
  };
  const handleDeleteTeacher = (id: any, teacherName: string) => {
    if (window.confirm(`Are you sure you want to delete teacher "${teacherName}"?`)) {
      dispatch(deleteTeacherFromSupabase(id) as any);
    }
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Add New Teacher</h3>
        <form onSubmit={handleAddTeacher} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" placeholder="Teacher Name" value={name} 
            onChange={(e) => setName(e.target.value)} required style={{ padding: '8px' }}
          />
          <input 
            type="text" placeholder="Subject" value={subject} 
            onChange={(e) => setSubject(e.target.value)} required style={{ padding: '8px' }}
          />
          <input 
            type="number" placeholder="Salary (Rs)" value={salary} 
            onChange={(e) => setSalary(e.target.value)} required style={{ padding: '8px' }}
          />
          <input 
            type="text" placeholder="Phone Number" value={phone} 
            onChange={(e) => setPhone(e.target.value)} style={{ padding: '8px' }}
          />
          <button type="submit" style={{ background: '#2196F3', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>
            Save Teacher
          </button>
        </form>
      </div>

      <h2>Teacher Attendance & Salary Management</h2>
      <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'white' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>Name & Subject</th>
            <th>Salary</th>
            <th>Salary Status</th>
            <th>Thumb Attendance (In / Out)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {teachers.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: '#666' }}>No teachers found.</td>
            </tr>
          ) : (
            teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>
                  <div style={{ fontWeight: 'bold' }}>{teacher.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Subject: {teacher.subject}</div>
                </td>
                <td>Rs. {teacher.salary}</td>
                <td style={{ color: teacher.salaryStatus === 'Paid' ? 'green' : 'red', fontWeight: 'bold' }}>
                  {teacher.salaryStatus || 'Pending'}
                </td>
                
                {/* Thumb In / Out Attendance Column */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ fontSize: '12px' }}>
                      <b>In:</b> {teacher.checkIn || '--:--'} | <b>Out:</b> {teacher.checkOut || '--:--'}
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                     {!teacher.checkIn ? (
  <button 
    onClick={() => dispatch(markThumbInSupabase(teacher.id))}
    style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
  >
    Thumb In
  </button>
) : !teacher.checkOut ? (
  <button 
    onClick={() => dispatch(markThumbOutSupabase(teacher.id))}
    style={{ background: '#d32f2f', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
  >
    Thumb Out
  </button>
) : (
  <span style={{ color: 'green', fontWeight: 'bold', fontSize: '12px' }}>Completed</span>
)}
                    </div>
                  </div>
                </td>

                <td>
                  {teacher.salaryStatus === 'Pending' || !teacher.salaryStatus ? (
                    <button 
                      onClick={() => dispatch(updateSalaryStatus(teacher.id))}
                      style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}
                    >
                      Pay Salary
                    </button>
                  ) : (
                    <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>Paid</span>
                  )}
                  <button
                      onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                      style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      Delete
                    </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};