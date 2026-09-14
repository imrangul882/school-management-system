import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { saveTeacherAttendanceToSupabase } from '../../features/attendance/teacherAttendanceSlice';

interface TeacherDetailModalProps {
  activeTeacherDetail: any;
  selectedMonth: string;
  manualStatuses?: Record<string, string>;
  customHolidays?: { date: string; reason: string }[];
  onClose: () => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  activeTeacherDetail,
  selectedMonth,
  customHolidays = [],
  onClose,
}) => {
  const dispatch = useDispatch<any>();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!activeTeacherDetail) return null;

  const { teacher } = activeTeacherDetail;

  // Teacher ke attendance logs jo Redux / Supabase se aa rahe hain
  const attendanceLogs = teacher.attendanceLogs || {};
  const allLogDates = Object.keys(attendanceLogs).filter(date => date.startsWith(selectedMonth));
  
    
  
  const monthCustomHolidays = customHolidays.filter(h => h.date.startsWith(selectedMonth));

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Direct Supabase update handler for individual log item inside modal
  const handleUpdateLogTime = async (date: string, field: 'inTime' | 'outTime', value: string) => {
    const currentLog = attendanceLogs[date] || { status: 'Present', thumbStatus: 'Out' };
    
    const updatedRecord = {
      ...currentLog,
      inTime: field === 'inTime' ? value : (currentLog.inTime || ''),
      outTime: field === 'outTime' ? value : (currentLog.outTime || ''),
    };
console.log("Sending to dispatch:", { teacherId: teacher.id, date, monthYear: selectedMonth, updatedRecord });
    try {
      await dispatch(saveTeacherAttendanceToSupabase({
        teacherId: teacher.id,
        date: date,
        monthYear: selectedMonth,
        record: updatedRecord
      })).unwrap();
    } catch (err) {
      console.error("Failed to update time in Supabase:", err);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        width: '550px',
        height: '85vh',
        maxHeight: '700px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
        color: '#1e293b',
        transform: `translate(${position.x}px, ${position.y}px)`,
        position: 'relative',
        userSelect: 'none',
        overflow: 'hidden'
      }}>
        {/* Draggable Header */}
        <div 
          onMouseDown={handleMouseDown}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            borderBottom: '1px solid #e2e8f0', 
            paddingBottom: '10px', 
            marginBottom: '12px',
            cursor: 'move',
            background: '#f8fafc',
            margin: '-20px -20px 12px -20px',
            padding: '12px 20px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            flexShrink: 0
          }}
        >
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '15px' }}>
            Attendance Log: {teacher.name} <span style={{ fontSize: '11px', color: '#64748b' }}>(Drag ✋)</span>
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>

        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', flexShrink: 0 }}>
          Calculated for month: <b>{selectedMonth}</b>
        </p>

        {/* Scrollable Container for lists */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Detailed Attendance Logs with Times */}
          <div>
            <h4 style={{ fontSize: '13px', color: '#334155', marginBottom: '6px' }}>Detailed Attendance & Time Logs:</h4>
            {allLogDates.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {allLogDates.map((date, idx) => {
                  const log = attendanceLogs[date];
                  const statusColor = log.status === 'Present' ? '#16a34a' : log.status === 'Absent' ? '#dc2626' : '#d97706';
                  
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span>📅 <b>{date}</b></span>
                        <span style={{ fontWeight: 'bold', color: statusColor, fontSize: '11px' }}>{log.status || 'Marked'}</span>
                      </div>

                      {/* Time Inputs inside Modal for Direct Correction */}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '9px', color: '#64748b' }}>In Time</span>
                          <input
                            type="time"
                            value={log.inTime ? log.inTime.slice(0, 5) : ''}
                            onChange={(e) => handleUpdateLogTime(date, 'inTime', e.target.value)}
                            style={{ padding: '3px', borderRadius: '3px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '9px', color: '#64748b' }}>Out Time</span>
                          <input
                            type="time"
                            value={log.outTime ? log.outTime.slice(0, 5) : ''}
                            onChange={(e) => handleUpdateLogTime(date, 'outTime', e.target.value)}
                            style={{ padding: '3px', borderRadius: '3px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No attendance logs found for this month.</p>
            )}
          </div>

          {/* Sundays & Custom Holidays Section */}
          <div>
            <h4 style={{ fontSize: '13px', color: '#334155', marginBottom: '6px' }}>Sundays & Custom Holidays:</h4>
            
            {/* Custom Holidays List */}
            {monthCustomHolidays.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '6px' }}>
                {monthCustomHolidays.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#eff6ff', borderRadius: '4px', fontSize: '12px', border: '1px solid #bfdbfe' }}>
                    <span><b>{item.date}</b> ({item.reason})</span>
                    <span style={{ fontWeight: 'bold', color: '#1d4ed8' }}>Holiday (Off)</span>
                  </div>
                ))}
              </div>
            )}

            {/* Auto Calculated Sundays */}
            {(() => {
              const [year, month] = selectedMonth.split('-').map(Number);
              const sundays: string[] = [];
              const date = new Date(year, month - 1, 1);
              
              while (date.getMonth() === month - 1) {
                if (date.getDay() === 0) {
                  sundays.push(new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 10));
                }
                date.setDate(date.getDate() + 1);
              }

              return sundays.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {sundays.map((sunDate, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f1f5f9', borderRadius: '4px', fontSize: '12px', color: '#475569' }}>
                      <span><b>{sunDate}</b></span>
                      <span style={{ fontWeight: 'bold', color: '#0284c7' }}>Sunday (Off)</span>
                    </div>
                  ))}
                </div>
              ) : null;
            })()}
          </div>

        </div>

        {/* Footer Close Button */}
        <div style={{ textAlign: 'right', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};