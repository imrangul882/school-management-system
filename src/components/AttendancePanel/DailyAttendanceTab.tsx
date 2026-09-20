import React from 'react';

interface DailyAttendanceTabProps {
  CLASSES_LIST: string[];
  SECTIONS_LIST: readonly string[];
  PERIODS_LIST: string[];
  attendanceDate: string;
  setAttendanceDate: (date: string) => void;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  selectedSection: "A" | "B" | "C";
  setSelectedSection: (sec: "A" | "B" | "C") => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  teacherNameInput: string;
  setTeacherNameInput: (name: string) => void;
  periodTopicDetail: string;
  setPeriodTopicDetail: (detail: string) => void;
  filteredStudents: any[];
  classAttendance: Record<string, string>;
  handleStatusChange: (studentId: string, status: string) => void;
  handleSaveToSupabase: () => void;
  attendanceRecords: any[];
}

export const DailyAttendanceTab: React.FC<DailyAttendanceTabProps> = ({
  CLASSES_LIST,
  SECTIONS_LIST,
  PERIODS_LIST,
  attendanceDate,
  setAttendanceDate,
  selectedClass,
  setSelectedClass,
  selectedSection,
  setSelectedSection,
  selectedPeriod,
  setSelectedPeriod,
  teacherNameInput,
  setTeacherNameInput,
  periodTopicDetail,
  setPeriodTopicDetail,
  filteredStudents,
  classAttendance,
  handleStatusChange,
  handleSaveToSupabase,
  attendanceRecords,
}) => {
  return (
    <div>
      {/* Controls Bar */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', background: '#0f172a', color: '#cbd5e1', padding: '15px', borderRadius: '6px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 130px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#e2e8f0' }}>Date:</label>
          <input 
            type="date" 
            value={attendanceDate} 
            onChange={(e) => setAttendanceDate(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #374151', background: '#0f172a', color: '#ffffff', boxSizing: 'border-box', colorScheme: 'dark', outline: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }} 
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

      {/* Teacher Name & Topic Details */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ flex: '1 1 250px', background: '#0f172a', padding: '15px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#c7d2e4' }}>Teacher Name:</label>
          <input 
            type="text"
            placeholder="Type teacher name..."
            value={teacherNameInput}
            onChange={(e) => setTeacherNameInput(e.target.value)}
            style={{ width: '100%', padding: '9px', borderRadius: '4px', border: '1px solid #c7d2e4', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ flex: '2 1 300px', background: '#0f172a', padding: '15px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#c7d2e4' }}>
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

      {/* Students Table */}
      <div style={{ width: '100%', overflowX: 'auto', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#0f172a', color: '#fff', borderBottom: '2px solid #cbd5e1' }}>
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
                    <td style={{ padding: '10px' }}>{student.studentClass || student.class} - {student.section}</td>
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

      {/* Save Button */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleSaveToSupabase}
          style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', width: '100%', maxWidth: '320px' }}
        >
          Save Attendance & Topic to Supabase
        </button>
      </div>

      {/* History Table */}
      <div style={{ marginTop: '40px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Saved Period Topics & Attendance History</h3>
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
  );
};