import React from 'react';
import { useDispatch } from 'react-redux';
import { saveTeacherAttendanceToSupabase } from '../../features/attendance/teacherAttendanceSlice';

interface TeacherAttendanceTableProps {
  teachers: any[];
  selectedMonth: string;
  customHolidays: { date: string; reason: string }[];
  manualStatuses: Record<string, string>;
  teacherMarkDates: Record<string, string>;
  dailyTimeLogs: Record<string, { inTime: string; outTime: string; isManual?: boolean; reason?: string }>;
  onDateChange: (teacherId: string, date: string) => void;
  onStatusChange: (teacherId: string, status: string) => void;
  onTimeInChange: (teacherId: string, time: string) => void;
  onTimeOutChange: (teacherId: string, time: string) => void;
  onManualToggle: (teacherId: string, isManual: boolean) => void;
  onReasonChange: (teacherId: string, reason: string) => void;
  onEditClick: (teacher: any) => void;
  onViewLog: (teacher: any, summary: any) => void;
  calculateSummary: (teacherId: string) => any;
}

export const TeacherAttendanceTable: React.FC<TeacherAttendanceTableProps> = ({
  teachers,
  selectedMonth,
  customHolidays,
  manualStatuses,
  teacherMarkDates,
  dailyTimeLogs,
  onDateChange,
  onStatusChange,
  onTimeInChange,
  onTimeOutChange,
  onManualToggle,
  onReasonChange,
  onEditClick,
  onViewLog,
  calculateSummary,
}) => {
  const dispatch = useDispatch<any>();

  return (
    <div style={{ 
      background: '#111827', 
      padding: '10px 24px 30px 10px', 
      borderRadius: '14px', 
      border: '1px solid #e2e8f1', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)', 
      overflowX: 'auto',
      marginBottom: '30px' 
    }}>       
      <div style={{ marginBottom: '10px', fontSize: '13px', color: '#b4bbc5', fontWeight: 'bold' }}>
        Showing Attendance Table for Month: <span style={{ color: '#2563eb' }}>{selectedMonth}</span>
      </div>

      <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#83590c', borderBottom: '2px solid #f1f4f7' }}>
            <th style={{ padding: '10px', color: '#fff' }}>Teacher Name</th>
            <th style={{ padding: '10px', color: '#fff' }}>Monthly Salary</th>
            <th style={{ padding: '10px', color: '#fff' }}>Marked Days (P / A / L)</th>
            <th style={{ padding: '10px', color: '#fff' }}>Date & Status</th>
            <th style={{ padding: '10px', color: '#fff' }}>Time In / Out & Manual Override</th>
            <th style={{ padding: '10px', color: '#fff' }}>Final Calculated Salary</th>
            <th style={{ padding: '10px', textAlign: 'center', color: '#fff' }}>Detail Log</th>
          </tr>
        </thead>
        <tbody>
          {teachers.length > 0 ? (
            teachers.map((teacher: any) => {
              const monthlySalary = Number(teacher.salary) || 0;
              const perDaySalary = monthlySalary / 30;
              const perMinuteSalary = perDaySalary / (8 * 60);

              const summary = calculateSummary(teacher.id);
              const activeDate = teacherMarkDates[teacher.id] || new Date().toISOString().slice(0, 10);
              const matchedHoliday = customHolidays.find((h) => h.date === activeDate);

              const currentStatusKey = `${teacher.id}_${activeDate}`;
              const currentStatus = manualStatuses[currentStatusKey] || teacher.attendanceLogs?.[activeDate]?.status || '';

              const timeKey = `${teacher.id}_${activeDate}`;
              const teacherTime = dailyTimeLogs[timeKey] || { 
                inTime: teacher.attendanceLogs?.[activeDate]?.inTime || '', 
                outTime: teacher.attendanceLogs?.[activeDate]?.outTime || '', 
                isManual: teacher.attendanceLogs?.[activeDate]?.isManual || false, 
                reason: teacher.attendanceLogs?.[activeDate]?.reason || '' 
              };

              const absentDeduction = summary.totalAbsent * perDaySalary;
              const lateDeduction = summary.totalLateMins * perMinuteSalary;
              const finalSalary = Math.max(0, monthlySalary - absentDeduction - lateDeduction).toFixed(0);
              
              return (
                <tr key={teacher.id} style={{ borderBottom: '1px solid #cdd4df', background: '#0f172a' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#f8fafc' }}>
                    {teacher.name}
                    <div style={{ fontSize: '11px', color: '#e5ebf3' }}>{teacher.subject || teacher.role}</div>
                  </td>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>Rs. {monthlySalary}</td>
                  <td style={{ padding: '10px', fontSize: '13px' }}>
                    <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{summary.totalPresent} P</span> /
                    <span style={{ color: '#f87171', fontWeight: 'bold' }}> {summary.totalAbsent} A</span> /
                    <span style={{ color: '#fbbf24', fontWeight: 'bold' }}> {summary.totalLeave} L</span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="date"
                          value={activeDate}
                          onChange={(e) => onDateChange(teacher.id, e.target.value)}
                          style={{
                            padding: '5px',
                            borderRadius: '4px',
                            border: '1px solid #22c55e',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            background: '#1e293b',
                            color: '#34d399',
                            outline: 'none',
                            colorScheme: 'dark',
                          }}
                        />
                        <select
                          value={currentStatus}
                          onChange={(e) => onStatusChange(teacher.id, e.target.value)}
                          style={{
                            padding: '5px',
                            borderRadius: '4px',
                            border: '1px solid #475569',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            outline: 'none',
                            background: currentStatus === 'Present' ? '#1b6133' : currentStatus === 'Absent' ? '#681c1c' : currentStatus === 'Leave' ? '#340758' : '#1e293b',
                            color: currentStatus ? '#fff' : '#94a3b8',
                          }}
                        >
                          <option value="" style={{ background: '#1e293b', color: '#94a3b8' }}>-- Status --</option>
                          <option value="Present" style={{ background: '#1e293b', color: '#4ade80' }}>Present</option>
                          <option value="Absent" style={{ background: '#1e293b', color: '#f87171' }}>Absent</option>
                          <option value="Leave" style={{ background: '#1e293b', color: '#c084fc' }}>Leave</option>
                        </select>
                      </div>

                      {matchedHoliday && (
                        <span style={{ fontSize: '10px', background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '3px', width: 'fit-content' }}>
                            Holiday: {matchedHoliday.reason}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                     <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input
                        type="time"
                        value={teacherTime.inTime ? teacherTime.inTime.slice(0, 5) : ''}
                        onChange={(e) => onTimeInChange(teacher.id, e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #425d83', background: '#dce4f1', color: '#131212', fontSize: '12px', width: '80px' }}
                        title="inTime"
                      />
                      <span style={{ color: '#94a3b8' }}>-</span>
                      <input
                        type="time"
                        value={teacherTime.outTime ? teacherTime.outTime.slice(0, 5) : ''}
                        onChange={(e) => onTimeOutChange(teacher.id, e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #475569', background: '#f7f9fc', color: '#131212', fontSize: '11px', width: '80px' }}
                        title="outTime"
                      />
                    </div>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <label style={{ fontSize: '10px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={teacherTime.isManual || false}
                            onChange={(e) => onManualToggle(teacher.id, e.target.checked)}
                          />
                          Manual by Admin
                        </label>
                        
                        {teacherTime.isManual && (
                          <input
                            type="text"
                            placeholder="Reason (e.g. came late, approved)"
                            value={teacherTime.reason || ''}
                            onChange={(e) => onReasonChange(teacher.id, e.target.value)}
                            style={{ fontSize: '10px', padding: '2px 4px', background: '#0f172a', border: '1px solid #38bdf8', color: '#fff', borderRadius: '3px', width: '130px' }}
                          />
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#4ade80' }}>Rs. {finalSalary}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                     <button
  type="button"
  style={{ background: '#10B981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
  onClick={async () => {
    // Direct input elements ya current state se fresh values nikalna
    const finalInTime = teacherTime?.inTime || '';
    const finalOutTime = teacherTime?.outTime || '';
    const finalStatus = currentStatus || 'Present';

    if (!finalStatus) {
      alert("Pehle Attendance Status select karein!");
      return;
    }

    try {
      const resultAction = await dispatch(saveTeacherAttendanceToSupabase({
        teacherId: String(teacher.id),
        date: activeDate,
        monthYear: selectedMonth,
        record: {
          status: finalStatus as 'Present' | 'Absent' | 'Leave',
          inTime: finalInTime,
          outTime: finalOutTime,
          thumbStatus: teacher.attendanceLogs?.[activeDate]?.thumbStatus || 'Out',
          isManual: teacherTime?.isManual || false,
          reason: teacherTime?.reason || ''
        }
      }));

      if (saveTeacherAttendanceToSupabase.fulfilled.match(resultAction)) {
        alert("Attendance Successfully Saved in Supabase!");
      } else {
        alert("Failed to save: " + (resultAction.payload || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error: " + (err.message || err));
    }
  }}
>
  Save
</button>
                      <button
                        onClick={() => onEditClick(teacher)}
                        style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onViewLog(teacher, summary)}
                        style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        👁️ View Log
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', background: '#0f172a' }}>No teachers found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};