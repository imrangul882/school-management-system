import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { saveTeacherMonthlyRecord } from './teacherAttendanceSlice';
import { updateTeacher } from '../teachers/teacherSlice'; 
import { TeacherDetailModal } from './TeacherDetailModal';
import { calculateTeacherAttendanceSummary } from './teacherSalaryHelpers';
import { TeacherAttendanceTable } from './TeacherAttendanceTable';
import { TeacherList } from '../teachers/TeacherList'; 

interface TeacherSalaryPanelProps {
  onBack: () => void;
}

export const TeacherSalaryPanel: React.FC<TeacherSalaryPanelProps> = ({ onBack }) => {
  const dispatch = useAppDispatch();
  const teachers = useAppSelector((state: any) => state.teachers?.teachers || []);
  const attendanceRecords = useAppSelector((state: any) => state.attendance?.records || state.attendance || []);
  
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [editFormName, setEditFormName] = useState('');
  const [editFormSubject, setEditFormSubject] = useState('');
  const [editFormSalary, setEditFormSalary] = useState('');

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [teacherMarkDates, setTeacherMarkDates] = useState<Record<string, string>>({});
  const [customHolidays, setCustomHolidays] = useState<{ date: string; reason: string }[]>([]);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayReason, setNewHolidayReason] = useState('');
  const [manualStatuses, setManualStatuses] = useState<Record<string, string>>({});
  const [activeTeacherDetail, setActiveTeacherDetail] = useState<any | null>(null);

  const [dailyTimeLogs, setDailyTimeLogs] = useState<Record<string, {inTime:string; outTime: string; isManual?: boolean; reason?: string }>>({});

  const handleEditClick = (teacher: any) => {
    setEditingTeacher(teacher);
    setEditFormName(teacher.name || '');
    setEditFormSubject(teacher.subject || '');
    setEditFormSalary(teacher.salary?.toString() || '');
  };

  const handleSaveEdit = () => {
    if (!editingTeacher) return;
    const updated = {
      ...editingTeacher,
      name: editFormName,
      subject: editFormSubject,
      salary: Number(editFormSalary)
    };
    dispatch(updateTeacher(updated));
    setEditingTeacher(null);
  };

  const handleDateChangeForTeacher = (teacherId: string, date: string) => {
    setTeacherMarkDates(prev => ({ ...prev, [teacherId]: date }));
  };

  const handleStatusChange = (teacherId: string, status: string) => {
    const activeDate = teacherMarkDates[teacherId] || new Date().toISOString().slice(0, 10);
    const key = `${teacherId}_${activeDate}`;
    setManualStatuses(prev => ({ ...prev, [key]: status }));
  };

 
const handleManualToggle = (teacherId: string, isManual: boolean) => {
    const activeDate = teacherMarkDates[teacherId] || new Date().toISOString().slice(0, 10);
    const key = `${teacherId}_${activeDate}`;
    setDailyTimeLogs(prev => ({
      ...prev,
      [key]: { ...(prev[key] || { inTime: '', outTime: '' }), isManual }
    }));
  };

  const handleReasonChange = (teacherId: string, reason: string) => {
    const activeDate = teacherMarkDates[teacherId] || new Date().toISOString().slice(0, 10);
    const key = `${teacherId}_${activeDate}`;
    setDailyTimeLogs(prev => ({
      ...prev,
      [key]: { ...(prev[key] || { inTime: '', outTime: '' }), reason }
    }));
  };

  const handleTimeInChange = (teacherId: string, time: string) => {
    const activeDate = teacherMarkDates[teacherId] || new Date().toISOString().slice(0, 10);
    const key = `${teacherId}_${activeDate}`;
    setDailyTimeLogs(prev => ({
      ...prev,
      [key]: { ...(prev[key] || { inTime: '', outTime: '' }), inTime: time }
    }));
  };

  const handleTimeOutChange = (teacherId: string, time: string) => {
    const activeDate = teacherMarkDates[teacherId] || new Date().toISOString().slice(0, 10);
    const key = `${teacherId}_${activeDate}`;
    setDailyTimeLogs(prev => ({
      ...prev,
      [key]: { ...(prev[key] || { inTime: '', outTime: '' }), outTime: time }
    }));
  };
  const handleAddCustomHoliday = () => {
    if (newHolidayDate && !customHolidays.some(h => h.date === newHolidayDate)) {
      setCustomHolidays([...customHolidays, { date: newHolidayDate, reason: newHolidayReason || 'Approved Special Off' }]);
      setNewHolidayDate('');
      setNewHolidayReason('');
    } else if (!newHolidayDate) {
      alert('Please select a holiday date.');
    }
  };

  const handleRemoveCustomHoliday = (dateStr: string) => {
    setCustomHolidays(customHolidays.filter(h => h.date !== dateStr));
  };

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset all custom holidays, manual statuses, and time logs?')) {
      setCustomHolidays([]);
      setManualStatuses({});
      setTeacherMarkDates({});
      setDailyTimeLogs({});
    }
  };

  const calculateSummary = (teacherId: string) => {
    return calculateTeacherAttendanceSummary(teacherId, selectedMonth, customHolidays, manualStatuses, attendanceRecords);
  };
  
  return (
    <div style={{ background: '#090d16', minHeight: '100vh', padding: '24px', color: '#f8fafc', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', width: '100%' }}>
      
      {/* Header & Back Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px', background: '#111827', padding: '20px', borderRadius: '14px', border: '1px solid #68768a' }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', color: '#f7f8fa' }}>Teacher Attendance, Leave & Salary Manager</h2>
          <p style={{ color: '#ecf0f5', fontSize: '13px', margin: 0 }}>
            Salary is calculated based on actual Present days. Absents deduct per-day salary; Leave has zero deduction.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleResetAll} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
             Reset All
          </button>
          <button onClick={onBack} style={{ background: '#2d3e5a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            ⬅ Back to Dashboard
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div style={{ marginBottom: '20px', background: '#111827', padding: '20px', borderRadius: '14px', border: '1px solid #49576b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#e1e4eb' }}>Select Month:</label>
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ background: '#1e293b', color: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #475569', fontWeight: 'bold', colorScheme: 'dark' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#f1f5fc' }}>Add Holiday Date & Reason:</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input 
                type="date" 
                value={newHolidayDate} 
                onChange={(e) => setNewHolidayDate(e.target.value)} 
                style={{ background: '#1e293b', color: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #475569', colorScheme: 'dark' }} 
              />            
              <input 
                type="text" 
                placeholder="Occasion (e.g. 14 August)" 
                value={newHolidayReason} 
                onChange={(e) => setNewHolidayReason(e.target.value)} 
                style={{ background: '#1e293b', color: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e4e6e7', fontSize: '13px', width: '180px' }} 
              />
              <button 
                onClick={handleAddCustomHoliday} 
                style={{ background: '#3b82f6', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                + Holiday
              </button>
            </div>
          </div>
        </div>

        <button onClick={() => { dispatch(saveTeacherMonthlyRecord({ month: selectedMonth, customHolidays, manualStatuses, dailyTimeLogs })); alert('Monthly records saved successfully!'); }} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
          Save Monthly Records
        </button>
      </div>

      {customHolidays.length > 0 && (
        <div style={{ marginBottom: '20px', background: '#1e293b', padding: '12px 18px', borderRadius: '10px', border: '1px solid #334155' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#60a5fa' }}>Approved Custom Holidays for {selectedMonth}: </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            {customHolidays.map((item, idx) => (
              <span key={idx} style={{ background: '#0f172a', color: '#cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #334155' }}>
                <b style={{ color: '#fff' }}>{item.date}</b>: {item.reason}
                <button onClick={() => handleRemoveCustomHoliday(item.date)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ✅ 1. TeacherList UI (Add Teacher Form aur Thumb In/Out Table yahan render hoga) */}
      <div style={{ marginBottom: '24px', background: '#111827', padding: '20px', borderRadius: '14px', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(153, 127, 127, 0.4)' }}>
        <TeacherList />
      </div>

      {/* ✅ 2. Teacher Attendance & Salary Summary Table UI */}
      <div style={{ background: '#111827', padding: '20px', borderRadius: '14px', border: '1px solid #6a81a1', boxShadow: '0 4px 20px rgba(228, 243, 241, 0.4)', overflowX: 'auto' }}>
        <TeacherAttendanceTable
          teachers={teachers}
          selectedMonth={selectedMonth}
          customHolidays={customHolidays}
          manualStatuses={manualStatuses}
          teacherMarkDates={teacherMarkDates}
          dailyTimeLogs={dailyTimeLogs}
          onDateChange={handleDateChangeForTeacher}
          onStatusChange={handleStatusChange}
          onTimeInChange={handleTimeInChange}
          onTimeOutChange={handleTimeOutChange}
          onManualToggle={handleManualToggle}
          onReasonChange={handleReasonChange}
          onEditClick={handleEditClick}
          onViewLog={(teacher, summary) => setActiveTeacherDetail({ teacher, summary })}
          calculateSummary={calculateSummary}
        />
      </div>

      <TeacherDetailModal 
        activeTeacherDetail={activeTeacherDetail} 
        selectedMonth={selectedMonth} 
        manualStatuses={manualStatuses}
        customHolidays={customHolidays}
        onClose={() => setActiveTeacherDetail(null)} 
      />

      {editingTeacher && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#111827', padding: '25px', borderRadius: '12px', width: '400px', boxShadow: '0 8px 25px rgba(244, 243, 247, 0.9)', color: '#f8fafc', border: '1px solid #1f2937' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px', color: '#f9fafb' }}>Edit Teacher Details</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#f1f3f7' }}>Teacher Name:</label>
              <input type="text" value={editFormName} onChange={(e) => setEditFormName(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #475569', background: '#1e293b', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#e5ebf3' }}>Subject / Role:</label>
              <input type="text" value={editFormSubject} onChange={(e) => setEditFormSubject(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #475569', background: '#1e293b', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#9ca3af' }}>Monthly Salary (Rs.):</label>
              <input type="number" value={editFormSalary} onChange={(e) => setEditFormSalary(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #475569', background: '#1e293b', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setEditingTeacher(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                Cancel
              </button>
              <button onClick={handleSaveEdit} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};