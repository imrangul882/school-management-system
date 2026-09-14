import React from 'react';
import type { StaffMember } from './staffSlice';

interface StaffTableProps {
  staffList: StaffMember[];
  currentDate: string;
  getRowInput: (staffId: string) => any;
  updateRowInput: (staffId: string, field: string, value: any) => void;
  updateStaffTime: any;
  calculateFinalSalary: (staff: StaffMember) => number;
  handleSaveAttendanceRow: (staffId: string) => void;
  handleOpenEditModal: (staff: StaffMember) => void;
  handleOpenLogModal: (staff: StaffMember) => void;
  dispatch: any;
  removeStaff: any;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  staffList,
  currentDate,
  getRowInput,
  updateRowInput,
  updateStaffTime,
  calculateFinalSalary,
  handleSaveAttendanceRow,
  handleOpenEditModal,
  handleOpenLogModal,
  dispatch,
  removeStaff,
}) => {
  return (
    <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #334155', fontSize: '14px', fontWeight: '600', color: '#cbd5e1', background: '#162032' }}>
        Showing Attendance Table for Month: {currentDate.slice(0, 7)}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', background: '#162032', letterSpacing: '0.05em' }}>
              <th style={{ padding: '14px' }}>Staff Name & Role</th>
              <th style={{ padding: '14px' }}>Monthly Salary</th>
              <th style={{ padding: '14px' }}>Marked Days (P / A / L)</th>
              <th style={{ padding: '14px' }}>Date & Status</th>
              <th style={{ padding: '14px' }}>Time In / Out & Manual Override</th>
              <th style={{ padding: '14px' }}>Final Calculated Salary</th>
              <th style={{ padding: '14px' }}>Save Attendance</th>
              <th style={{ padding: '14px', textAlign: 'center' }}>Detail Log</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No staff members added yet. Add staff using the form above.
                </td>
              </tr>
            ) : (
              staffList.map((staff: StaffMember) => (
                <tr key={staff.id} style={{ borderBottom: '1px solid #334155' }}>
                  
                  {/* Staff Name & Role */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '14px' }}>{staff.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Role: {staff.role} | Ph: {staff.phone}</div>
                  </td>

                  {/* Monthly Salary */}
                  <td style={{ padding: '14px', color: '#e2e8f0', fontWeight: '600', fontSize: '14px' }}>
                    Rs. {staff.salary}
                  </td>

                  {/* Marked Days */}
                  <td style={{ padding: '14px', fontSize: '12px', fontWeight: '700', color: '#eab308' }}>
                    0 P / 0 A / 0 L
                  </td>

                  {/* Date & Status */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input 
                        type="date" 
                        defaultValue={currentDate} 
                        style={{ background: '#e5e8ee', border: '1px solid #475569', fontSize: '12px', borderRadius: '4px', padding: '4px 8px', color: '#381616', outline: 'none' }}
                      />
                      <select 
                        value={getRowInput(staff.id).status}
                        onChange={(e) => updateRowInput(staff.id, 'status', e.target.value)}
                        style={{ background: '#cad0db', border: '1px solid #475569', fontSize: '12px', borderRadius: '4px', padding: '4px 8px', color: '#121a24', outline: 'none' }}
                      >
                        <option value="">-- Status --</option>
                        <option value="Present">Present (P)</option>
                        <option value="Absent">Absent (A)</option>
                        <option value="Leave">Leave (L)</option>
                      </select>
                    </div>
                  </td>

                  {/* Time In / Out & Manual Override */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <input 
                        type="time" 
                        value={staff.inTime || ''} 
                        onChange={(e) => dispatch(updateStaffTime({ id: staff.id, inTime: e.target.value }))}
                        style={{ background: '#e6e7e9', border: '1px solid #1b4b8f', fontSize: '12px', borderRadius: '4px', padding: '4px 6px', color: '#2f5583', width: '80px', textAlign: 'center' }}
                      />
                      <span style={{ color: '#64748b' }}>—</span>
                      <input 
                        type="time" 
                        value={staff.outTime || ''} 
                        onChange={(e) => dispatch(updateStaffTime({ id: staff.id, outTime: e.target.value }))}
                        style={{ background: '#e6e7e9', border: '1px solid #1b4b8f', fontSize: '12px', borderRadius: '4px', padding: '4px 6px', color: '#2f5583', width: '80px', textAlign: 'center' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                      <label style={{ fontSize: '10px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={staff.isManual || false}
                          onChange={(e) => dispatch(updateStaffTime({ id: staff.id, isManual: e.target.checked }))}
                        />
                        Manual by Admin
                      </label>
                      
                      {staff.isManual && (
                        <input
                          type="text"
                          placeholder="Reason (e.g. came late)"
                          value={staff.reason || ''}
                          onChange={(e) => dispatch(updateStaffTime({ id: staff.id, reason: e.target.value }))}
                          style={{ fontSize: '10px', padding: '2px 4px', background: '#0f172a', border: '1px solid #38bdf8', color: '#fff', borderRadius: '3px', width: '130px' }}
                        />
                      )}
                    </div>
                  </td>

                  {/* Final Calculated Salary */}
                  <td style={{ padding: '14px', color: '#34d399', fontWeight: '700', fontSize: '14px' }}>
                    Rs. {calculateFinalSalary(staff)}
                  </td>

                  {/* Save Attendance Row Button */}
                  <td style={{ padding: '14px' }}>
                    <button 
                      type="button"
                      onClick={() => handleSaveAttendanceRow(staff.id)}
                      style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Save Attendance
                    </button>
                  </td>

                  {/* Detail Log / Actions */}
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(staff)}
                        style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '6px 12px', fontSize: '12px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenLogModal(staff)}
                        style={{ background: '#7c3aed', color: '#ffffff', border: 'none', padding: '6px 10px', fontSize: '12px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        👁️ View Log
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch(removeStaff(staff.id))}
                        style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '6px 10px', fontSize: '12px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};