import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { savePeriodAttendanceToSupabase, fetchPeriodAttendanceFromSupabase } 
from './periodAttendanceSlice';

const CLASSES_LIST = ["Montessori", "Nursery", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
const SECTIONS_LIST = ["A", "B", "C"] as const;
const PERIODS_LIST = ["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6", "Period 7"];

interface PeriodAttendancePanelProps {
  onBack: () => void;
}

export const PeriodAttendancePanel: React.FC<PeriodAttendancePanelProps> = ({ onBack }) => {
  const dispatch = useAppDispatch();
  const students = useAppSelector((state: any) => state.students.students || []);
  
  const attendanceRecords = useAppSelector((state: any) => state.periodAttendance?.periodRecords || []);

  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');

  const [selectedClass, setSelectedClass] = useState("5th");
  const [selectedSection, setSelectedSection] = useState<"A" | "B" | "C">("A");
  const [selectedPeriod, setSelectedPeriod] = useState("Period 1");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [classAttendance, setClassAttendance] = useState<Record<string, string>>({});
  const [periodTopicDetail, setPeriodTopicDetail] = useState('');
  const [teacherNameInput, setTeacherNameInput] = useState(''); // 👈 Teacher name state

  const [monthlyClass, setMonthlyClass] = useState("5th");
  const [monthlySection, setMonthlySection] = useState<"A" | "B" | "C">("A");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); 

  useEffect(() => {
    dispatch(fetchPeriodAttendanceFromSupabase() as any);
  }, [dispatch]);

  const handleStatusChange = (studentId: string, status: string) => {
    setClassAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // 👈 UPDATED: Ab har student ki alag row Supabase mein save hogi
  const handleSaveToSupabase = async () => {
    const attendanceData = filteredStudents.map((student: any) => ({
      rollNo: student.rollNo || 'N/A',
      name: student.name,
      status: classAttendance[student.id] || 'Present',
    }));

    try {
      await dispatch(savePeriodAttendanceToSupabase({
        date: attendanceDate,
        className: selectedClass,
        section: selectedSection,
        period: selectedPeriod,
        topicDetail: periodTopicDetail,
        teacherName: teacherNameInput, // 👈 Teacher name payload mein bheja
        attendanceData
      })).unwrap();

      alert(`Successfully saved ${selectedPeriod} attendance & topic to Supabase!`);
      dispatch(fetchPeriodAttendanceFromSupabase() as any); // Table refresh karne ke liye
    } catch (error: any) {
      alert('Save karne mein error aa gaya: ' + error);
    }
  };

  const filteredStudents = students.filter((s: any) => 
    s.studentClass === selectedClass && s.section === selectedSection
  );

  const monthlyFilteredStudents = students.filter((s: any) => 
    s.studentClass === monthlyClass && s.section === monthlySection
  );

  // 👈 UPDATED: Supabase ke naye flat columns ke mutabiq filtering
  const relevantRecords = attendanceRecords.filter((rec: any) => 
    rec.className === monthlyClass && 
    rec.section === monthlySection && 
    rec.date?.startsWith(selectedMonth)
  );

  return (
    <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%', boxSizing: 'border-box' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(18px, 4vw, 22px)', margin: '0 0 5px 0' }}>Classroom Period-Wise Attendance & Monthly Records</h2>
          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
            Tablet & Laptop friendly interface for teachers & admin.
          </p>
        </div>
        <button 
          onClick={onBack}
          style={{ background: '#64748b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
        >
          ⬅️ Back to Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('daily')}
          style={{
            padding: '10px 16px',
            background: activeTab === 'daily' ? '#0288d1' : '#e2e8f0',
            color: activeTab === 'daily' ? '#fff' : '#334155',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
            Mark Daily Attendance
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          style={{
            padding: '10px 16px',
            background: activeTab === 'monthly' ? '#0288d1' : '#e2e8f0',
            color: activeTab === 'monthly' ? '#fff' : '#334155',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          View Monthly Attendance Report
        </button>
      </div>

      {/* TAB 1: DAILY ATTENDANCE ENTRY */}
      {activeTab === 'daily' && (
        <div>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', background: '#f8fafc', padding: '15px', borderRadius: '6px', marginBottom: '20px', alignItems: 'center' }}>
            <div style={{ flex: '1 1 130px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Date:</label>
              <input 
                type="date" 
                value={attendanceDate} 
                onChange={(e) => setAttendanceDate(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ flex: '1 1 110px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Class:</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 'bold', boxSizing: 'border-box' }}
              >
                {CLASSES_LIST.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>
            </div>

            <div style={{ flex: '1 1 110px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Section:</label>
              <select 
                value={selectedSection} 
                onChange={(e) => setSelectedSection(e.target.value as any)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 'bold', boxSizing: 'border-box' }}
              >
                {SECTIONS_LIST.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
              </select>
            </div>

            <div style={{ flex: '1 1 130px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Period:</label>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 'bold', color: '#0288d1', boxSizing: 'border-box' }}
              >
                {PERIODS_LIST.map(period => <option key={period} value={period}>{period}</option>)}
              </select>
            </div>
          </div>

         {/* Teacher Name & Topic / Book Details Input Section */}
<div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
  <div style={{ flex: '1 1 250px', background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#1e293b' }}>
      Teacher Name:
    </label>
    <input 
      type="text"
      placeholder="Type teacher name..."
      value={teacherNameInput}
      onChange={(e) => setTeacherNameInput(e.target.value)}
      style={{ width: '100%', padding: '9px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
    />
  </div>

  <div style={{ flex: '2 1 300px', background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#1e293b' }}>
      Subject / Topic & Lines Covered Details ({selectedPeriod}):
    </label>
    <input 
      type="text"
      placeholder="Type subject & topic details..."
      value={periodTopicDetail}
      onChange={(e) => setPeriodTopicDetail(e.target.value)}
      style={{ width: '100%', padding: '9px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
    />
  </div>
</div>

          {/* Responsive Scrollable Table Container */}
          <div style={{ width: '100%', overflowX: 'auto', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '10px' }}>Roll No</th>
                  <th style={{ padding: '10px' }}>Student Name & Father</th>
                  <th style={{ padding: '10px' }}>Class / Section</th>
                  <th style={{ padding: '10px' }}>{selectedPeriod} Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student: any) => {
                    const currentStatus = classAttendance[student.id] || 'Present';
                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#0288d1' }}>{student.rollNo || 'N/A'}</td>
                        <td style={{ padding: '10px' }}>
                          {student.name}
                          <div style={{ fontSize: '11px', color: '#666' }}>S/O: {student.fatherName}</div>
                        </td>
                        <td style={{ padding: '10px' }}>{student.studentClass} - {student.section}</td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {['Present', 'Absent', 'Leave'].map((statusOption) => (
                              <button
                                key={statusOption}
                                type="button"
                                onClick={() => handleStatusChange(student.id, statusOption)}
                                style={{
                                  padding: '5px 10px',
                                  background: currentStatus === statusOption 
                                    ? (statusOption === 'Present' ? '#2e7d32' : statusOption === 'Absent' ? '#d32f2f' : '#ed8936') 
                                    : '#e2e8f0',
                                  color: currentStatus === statusOption ? '#fff' : '#334155',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  fontSize: '12px'
                                }}
                              >
                                {statusOption}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
                      No students found in Class {selectedClass} - Section {selectedSection}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Save Button for Supabase */}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleSaveToSupabase}
              style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', width: '100%', maxWidth: '320px' }}
            >
                Save Attendance & Topic to Supabase
            </button>
          </div>

          {/* Saved Period Topics History Table */}
          <div style={{ marginTop: '40px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>📜 Saved Period Topics & Attendance History</h3>
            {attendanceRecords && attendanceRecords.length > 0 ? (
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', background: '#fff' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                      <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Date</th>
                      <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Class / Section</th>
                      <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Period</th>
                      <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Topic / Book Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Unique rows ke liye date + class + section + period ka combination ya map index */}
                    {Array.from(new Set(attendanceRecords.map((r: any) => `${r.date}-${r.className}-${r.section}-${r.period}`))).map((key: any, index: number) => {
                      const record = attendanceRecords.find((r: any) => `${r.date}-${r.className}-${r.section}-${r.period}` === key);
                      if (!record) return null;
                      return (
                        <tr key={index}>
                          <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>{record.date}</td>
                          <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>{record.className} - {record.section}</td>
                          <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>{record.period}</td>
                          <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>{record.topicDetail || 'No topic recorded'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Koi record database mein mojood nahi hai.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MONTHLY REPORT VIEW */}
      {activeTab === 'monthly' && (
        <div>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', background: '#f8fafc', padding: '15px', borderRadius: '6px', marginBottom: '20px', alignItems: 'center' }}>
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Select Month:</label>
              <input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 'bold', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ flex: '1 1 110px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Class:</label>
              <select 
                value={monthlyClass} 
                onChange={(e) => setMonthlyClass(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 'bold', boxSizing: 'border-box' }}
              >
                {CLASSES_LIST.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>
            </div>

            <div style={{ flex: '1 1 110px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Section:</label>
              <select 
                value={monthlySection} 
                onChange={(e) => setMonthlySection(e.target.value as any)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 'bold', boxSizing: 'border-box' }}
              >
                {SECTIONS_LIST.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '15px', fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>
            Total Recorded Rows for Month ({selectedMonth}): {relevantRecords.length} entries found.
          </div>

          {/* Responsive Scrollable Table Container */}
          <div style={{ width: '100%', overflowX: 'auto', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #a0bee0' }}>
                  <th style={{ padding: '10px' }}>Roll No</th>
                  <th style={{ padding: '10px' }}>Student Name</th>
                  <th style={{ padding: '10px' }}>Total Present</th>
                  <th style={{ padding: '10px' }}>Total Absent</th>
                  <th style={{ padding: '10px' }}>Total Leave</th>
                  <th style={{ padding: '10px' }}>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {monthlyFilteredStudents.length > 0 ? (
                  monthlyFilteredStudents.map((student: any) => {
                    let presentCount = 0;
                    let absentCount = 0;
                    let leaveCount = 0;

                    // 👈 UPDATED: Ab flat database rows mein se student ka rollNo match karke counts nikal rahe hain
                    relevantRecords.forEach((rec: any) => {
                      if (rec.rollNo === student.rollNo || rec.studentName === student.name) {
                        if (rec.status === 'Present') presentCount++;
                        else if (rec.status === 'Absent') absentCount++;
                        else if (rec.status === 'Leave') leaveCount++;
                      }
                    });

                    const totalMarked = presentCount + absentCount + leaveCount;
                    const percentage = totalMarked > 0 ? ((presentCount / totalMarked) * 100).toFixed(1) : '0.0';

                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#0288d1' }}>{student.rollNo || 'N/A'}</td>
                        <td style={{ padding: '10px' }}>
                          {student.name}
                          <div style={{ fontSize: '11px', color: '#666' }}>S/O: {student.fatherName}</div>
                        </td>
                        <td style={{ padding: '10px', color: 'green', fontWeight: 'bold' }}>{presentCount}</td>
                        <td style={{ padding: '10px', color: 'red', fontWeight: 'bold' }}>{absentCount}</td>
                        <td style={{ padding: '10px', color: '#d97706', fontWeight: 'bold' }}>{leaveCount}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{percentage}%</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
                      No students found in Class {monthlyClass} - Section {monthlySection}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};