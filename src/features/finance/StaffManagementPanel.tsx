import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { 
  removeStaff, 
  editStaff, 
  updateStaffTime, 
  saveStaffAttendance, 
  removeStaffHoliday,
  fetchStaffFromSupabase, 
  addStaffToSupabase,
  addHolidayToSupabase, 
  fetchHolidaysFromSupabase 
} from './staffSlice';
import type { StaffMember, AttendanceRecord } from './staffSlice';

import { StaffSummaryCard } from './StaffSummaryCard';
import { StaffFilterBar } from './StaffFilterBar';
import { StaffTable } from './StaffTable';

const StaffManagementPanel = () => {
  const dispatch = useDispatch();
  const staffList = useSelector((state: RootState) => state.staff?.staffList || []);
  const customHolidays = useSelector((state: RootState) => state.staff?.customHolidays || []);

  const currentDate = new Date().toISOString().split('T')[0];
  const currentMonth = currentDate.slice(0, 7);

  useEffect(() => {
    dispatch(fetchStaffFromSupabase() as any);
    dispatch(fetchHolidaysFromSupabase() as any);
  }, [dispatch]);

  // Form States for Adding
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Guard' | 'Aya' | 'Sweeper' | 'Peon' | 'Driver' | 'Other'>('Guard');
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState('');

  // Holiday States
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayOccasion, setHolidayOccasion] = useState('');

  // Row-wise temporary input states for marking attendance
  const [rowInputs, setRowInputs] = useState<Record<string, { date: string; status: any; inTime: string; outTime: string; isManual: boolean; reason: string }>>({});

  // Modal States for Editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);

  // View Log Modal States
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedStaffLog, setSelectedStaffLog] = useState<StaffMember | null>(null);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !salary) return;

    try {
      await dispatch(addStaffToSupabase({
        name,
        role,
        phone: phone || 'N/A',
        salary: Number(salary),
        joiningDate: currentDate,
        thumbStatus: 'Out',
        inTime: '--:--',
        outTime: '--:--',
        isManual: false,
        reason: '',
        attendanceLogs: {}
      }) as any).unwrap();

      alert('Staff successfully database mein save ho gaya!');
      setName('');
      setPhone('');
      setSalary('');
    } catch (error: any) {
      alert('Data save nahi ho saka: ' + (error.message || error));
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayDate || !holidayOccasion) return;

    try {
      await dispatch(addHolidayToSupabase({
        date: holidayDate,
        occasion: holidayOccasion
      }) as any).unwrap();

      alert('Holiday successfully database mein save ho gayi!');
      setHolidayDate('');
      setHolidayOccasion('');
    } catch (error: any) {
      alert('Holiday save nahi ho saki: ' + (error.message || error));
    }
  };

  const handleOpenEditModal = (staff: StaffMember) => {
    setCurrentStaff(staff);
    setIsEditModalOpen(true);
  };

  const getRowInput = (staffId: string) => {
    if (!rowInputs[staffId]) {
      return { date: currentDate, status: '', inTime: '--:--', outTime: '--:--', isManual: false, reason: '' };
    }
    return rowInputs[staffId];
  };

  const updateRowInput = (staffId: string, field: string, value: any) => {
    const current = getRowInput(staffId);
    setRowInputs({
      ...rowInputs,
      [staffId]: { ...current, [field]: value },
    });
  };

  const handleSaveAttendanceRow = (staffId: string) => {
    const input = getRowInput(staffId);
    if (!input.status) {
      alert('Please select an attendance status (Present, Absent, or Leave).');
      return;
    }

    const record: AttendanceRecord = {
      date: input.date,
      status: input.status,
      inTime: input.inTime,
      outTime: input.outTime,
      isManual: input.isManual,
      reason: input.reason,
    };

    dispatch(saveStaffAttendance({ staffId, date: input.date, record }));
    alert('Attendance saved successfully!');
  };

  const calculateFinalSalary = (staff: StaffMember) => {
    const logs = staff.attendanceLogs || {};
    const daysInMonth = 30; 
    const perDaySalary = staff.salary / daysInMonth;
    
    let absentCount = 0;
    Object.values(logs).forEach((log: any) => {
      if (log.status === 'Absent') {
        absentCount += 1;
      }
    });

    const deduction = absentCount * perDaySalary;
    const final = staff.salary - deduction;
    return Math.max(0, Math.round(final));
  };

  const handleOpenLogModal = (staff: StaffMember) => {
    setSelectedStaffLog(staff);
    setIsLogModalOpen(true);
  };

  const handleUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStaff) return;

    dispatch(editStaff(currentStaff));
    setIsEditModalOpen(false);
    setCurrentStaff(null);
  };

  const totalStaffExpense = staffList.reduce((acc: any, curr: any) => acc + (curr.salary || 0), 0);

  return (
    <div style={{ padding: '24px', background: '#0f172a', color: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', position: 'relative', width: '100%', overflowX: 'auto'}}>
      
      {/* 1. Summary & Holiday Section */}
      <StaffSummaryCard 
        totalStaffExpense={totalStaffExpense}
        currentMonth={currentMonth}
        holidayDate={holidayDate}
        setHolidayDate={setHolidayDate}
        holidayOccasion={holidayOccasion}
        setHolidayOccasion={setHolidayOccasion}
        handleAddHoliday={handleAddHoliday}
        customHolidays={customHolidays}
        onRemoveHoliday={(id) => dispatch(removeStaffHoliday(id))}
      />

      {/* 2. Staff Input Filter/Add Bar */}
      <StaffFilterBar 
        name={name}
        setName={setName}
        role={role}
        setRole={setRole}
        salary={salary}
        setSalary={setSalary}
        phone={phone}
        setPhone={setPhone}
        handleAddStaff={handleAddStaff}
      />

      {/* 3. Main Attendance & Salary Table */}
      <StaffTable 
        staffList={staffList}
        currentDate={currentDate}
        getRowInput={getRowInput}
        updateRowInput={updateRowInput}
        updateStaffTime={updateStaffTime}
        calculateFinalSalary={calculateFinalSalary}
        handleSaveAttendanceRow={handleSaveAttendanceRow}
        handleOpenEditModal={handleOpenEditModal}
        handleOpenLogModal={handleOpenLogModal}
        dispatch={dispatch}
        removeStaff={removeStaff}
      />

      {/* Edit Staff Modal */}
      {isEditModalOpen && currentStaff && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '24px', color: '#ffffff' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '12px', margin: '0 0 16px 0' }}>Edit Staff Details</h2>
            
            <form onSubmit={handleUpdateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Staff Name:</label>
                <input
                  type="text"
                  value={currentStaff.name}
                  onChange={(e) => setCurrentStaff({ ...currentStaff, name: e.target.value })}
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #dfe7f1', padding: '10px', borderRadius: '6px', fontSize: '14px', color: '#704040', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Role / Designation:</label>
                <select
                  value={currentStaff.role}
                  onChange={(e) => setCurrentStaff({ ...currentStaff, role: e.target.value as any })}
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', padding: '10px', borderRadius: '6px', fontSize: '14px', color: '#ffffff', outline: 'none' }}
                >
                  <option value="Guard">Guard</option>
                  <option value="Aya">Aya</option>
                  <option value="Sweeper">Sweeper</option>
                  <option value="Peon">Peon</option>
                  <option value="Driver">Driver</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Phone Number:</label>
                <input
                  type="text"
                  value={currentStaff.phone}
                  onChange={(e) => setCurrentStaff({ ...currentStaff, phone: e.target.value })}
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #828c9b', padding: '10px', borderRadius: '6px', fontSize: '14px', color: '#ffffff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Monthly Salary (Rs.):</label>
                <input
                  type="number"
                  value={currentStaff.salary}
                  onChange={(e) => setCurrentStaff({ ...currentStaff, salary: Number(e.target.value) })}
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', padding: '10px', borderRadius: '6px', fontSize: '14px', color: '#ffffff', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '14px', borderTop: '1px solid #334155', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ background: '#475569', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Log Modal */}
      {isLogModalOpen && selectedStaffLog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto', padding: '24px', color: '#ffffff' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', borderBottom: '1px solid #334155', paddingBottom: '10px', margin: '0 0 12px 0' }}>
              Attendance & Holiday Log: {selectedStaffLog.name}
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
              Role: <span style={{ color: '#fff' }}>{selectedStaffLog.role}</span> | Phone: <span style={{ color: '#fff' }}>{selectedStaffLog.phone}</span>
            </p>
            
            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155', fontSize: '13px', marginBottom: '16px', color: '#cbd5e1' }}>
              <p style={{ margin: '0 0 6px 0' }}>Monthly Salary: Rs. {selectedStaffLog.salary}</p>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#38bdf8', marginBottom: '8px' }}>Registered Holidays / Occasions</h3>
            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155', fontSize: '13px', marginBottom: '20px', color: '#cbd5e1', maxHeight: '150px', overflowY: 'auto' }}>
              {customHolidays && customHolidays.length > 0 ? (
                customHolidays.map((holiday: any, idx: number) => (
                  <div key={idx} style={{ padding: '6px 0', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{holiday.date}</span>
                    <span style={{ color: '#34d399', fontWeight: '600' }}>{holiday.occasion}</span>
                  </div>
                ))
              ) : (
                <p style={{ margin: 0, color: '#64748b', textAlign: 'center' }}>No holidays added yet.</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                style={{ background: '#475569', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementPanel;