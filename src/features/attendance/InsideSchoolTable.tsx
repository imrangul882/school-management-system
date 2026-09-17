import React from 'react';

interface Props {
  insideStudents: any[];
  checkedOutRecordIds: string[];
  bulkPickedBy: string;
  setBulkPickedBy: (val: string) => void;
  pickedByMap: { [key: string]: string };
  handlePickedByChange: (studentId: string, value: string) => void;
  handleOutCheckboxToggle: (recordId: string) => void;
  handleSelectAllOutToggle: () => void;
  handleBulkThumbOut: () => void;
  handleThumbOut: (recordId: string, studentId: string) => void;
}

export const InsideSchoolTable: React.FC<Props> = ({
  insideStudents,
  checkedOutRecordIds,
  bulkPickedBy,
  setBulkPickedBy,
  pickedByMap,
  handlePickedByChange,
  handleOutCheckboxToggle,
  handleSelectAllOutToggle,
  handleBulkThumbOut,
  handleThumbOut,
}) => {
  return (
    <div style={{ flex: 2, minWidth: '450px', background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
          Students Currently Inside School ({insideStudents.length})
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select 
            value={bulkPickedBy} 
            onChange={(e) => setBulkPickedBy(e.target.value)} 
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#35587c', color: '#fff' }}
          >
            <option value="Father">Bulk Picked By: Father</option>
            <option value="Mother">Mother</option>
            <option value="Uncle">Uncle</option>
            <option value="School Van Driver">Van Driver</option>
          </select>
          <button 
            onClick={handleBulkThumbOut}
            style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 14px', cursor: 'pointer', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}
          >
            Thumb OUT Selected ({checkedOutRecordIds.length})
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '10px 12px', width: '40px' }}>
                <input 
                  type="checkbox" 
                  onChange={handleSelectAllOutToggle}
                  checked={insideStudents.length > 0 && insideStudents.every((r: any) => checkedOutRecordIds.includes(r.id))}
                />
              </th>
              <th style={{ padding: '10px 12px' }}>Student Name</th>
              <th style={{ padding: '10px 12px' }}>Class / Section</th>
              <th style={{ padding: '10px 12px' }}>In Time</th>
              <th style={{ padding: '10px 12px' }}>Action (Thumb OUT)</th>
            </tr>
          </thead>
          <tbody>
            {insideStudents.length > 0 ? (
              insideStudents.map((record: any) => (
                <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px' }}>
                    <input 
                      type="checkbox" 
                      checked={checkedOutRecordIds.includes(record.id)}
                      onChange={() => handleOutCheckboxToggle(record.id)}
                    />
                  </td>
                  <td style={{ padding: '12px', fontWeight: '600', color: '#0f172a' }}>{record.studentName}</td>
                  <td style={{ padding: '12px', color: '#475569' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                      {record.studentClass} — Sec: {record.section || 'A'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#16a34a', fontWeight: '600' }}>{record.inTime}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select 
                        value={pickedByMap[record.studentId] || 'Father'} 
                        onChange={(e) => handlePickedByChange(record.studentId, e.target.value)} 
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Uncle">Uncle</option>
                        <option value="School Van Driver">Van Driver</option>
                      </select>
                      <button 
                        onClick={() => handleThumbOut(record.id, record.studentId)}
                        style={{ background: '#dc2626', color: 'white', border: 'none', padding: '7px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: '600', fontSize: '13px' }}
                      >
                        Thumb OUT
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px', fontSize: '14px' }}>
                  No students currently checked in.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};