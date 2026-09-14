

import React from 'react';

interface StaffSummaryCardProps {
  totalStaffExpense: number;
  currentMonth: string;
  holidayDate: string;
  setHolidayDate: (date: string) => void;
  holidayOccasion: string;
  setHolidayOccasion: (occasion: string) => void;
  handleAddHoliday: (e: React.FormEvent) => void;
  customHolidays: any[];
  onRemoveHoliday: (id: string) => void;
}

export const StaffSummaryCard: React.FC<StaffSummaryCardProps> = ({
  totalStaffExpense,
  currentMonth,
  holidayDate,
  setHolidayDate,
  holidayOccasion,
  setHolidayOccasion,
  handleAddHoliday,
  customHolidays,
  onRemoveHoliday,
}) => {
  return (
    <>
      {/* Header Section */}
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '24px', display: 'flex', width: '100%', overflowX: 'auto', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>Staff Attendance, Leave & Salary Manager</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Manage guards, sweepers, ayas, and their monthly payroll & attendance logs.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#94a3b8' }}>Total Staff Expense</p>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#34d399' }}>Rs. {totalStaffExpense}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Current Month: {currentMonth}</p>
        </div>
      </div>

      {/* Holiday Management Form */}
      <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#38bdf8' }}>Add Custom Holiday</h3>
        <form onSubmit={handleAddHoliday} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="date"
            value={holidayDate || ''}
            onChange={(e) => setHolidayDate(e.target.value)}
            style={{ background: '#0f172a', border: '1px solid #475569', padding: '8px 12px', borderRadius: '6px', color: '#ffffff', outline: 'none' }}
            required
          />
          <input
            type="text"
            placeholder="Holiday Occasion"
            value={holidayOccasion || ''}
            onChange={(e) => setHolidayOccasion(e.target.value)}
            style={{ background: '#0f172a', border: '1px solid #475569', padding: '8px 12px', borderRadius: '6px', color: '#ffffff', outline: 'none', flex: 1 }}
            required
          />
          <button type="submit" style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            Add Holiday
          </button>
        </form>

        {customHolidays.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#94a3b8' }}>Existing Holidays</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
              {customHolidays.map((holiday: any) => (
                <div key={holiday.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#0f172a', borderRadius: '6px', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>{holiday.date} - <strong style={{ color: '#34d399' }}>{holiday.occasion}</strong></span>
                  <button 
                    type="button"
                    onClick={() => onRemoveHoliday(holiday.id)}
                    style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};