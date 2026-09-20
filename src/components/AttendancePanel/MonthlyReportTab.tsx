import React from 'react';

interface MonthlyReportTabProps {
  CLASSES_LIST: string[];
  SECTIONS_LIST: readonly string[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  monthlyClass: string;
  setMonthlyClass: (cls: string) => void;
  monthlySection: "A" | "B" | "C";
  setMonthlySection: (sec: "A" | "B" | "C") => void;
  relevantRecords: any[];
  monthlyFilteredStudents: any[];
}

export const MonthlyReportTab: React.FC<MonthlyReportTabProps> = ({
  CLASSES_LIST,
  SECTIONS_LIST,
  selectedMonth,
  setSelectedMonth,
  monthlyClass,
  setMonthlyClass,
  monthlySection,
  setMonthlySection,
  relevantRecords,
  monthlyFilteredStudents,
}) => {
  return (
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
  );
};