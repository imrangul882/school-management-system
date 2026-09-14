import React from 'react';

interface StaffFilterBarProps {
  name: string;
  setName: (val: string) => void;
  role: 'Guard' | 'Aya' | 'Sweeper' | 'Peon' | 'Driver' | 'Other';
  setRole: (val: any) => void;
  salary: string;
  setSalary: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  handleAddStaff: (e: React.FormEvent) => void;
}

export const StaffFilterBar: React.FC<StaffFilterBarProps> = ({
  name,
  setName,
  role,
  setRole,
  salary,
  setSalary,
  phone,
  setPhone,
  handleAddStaff,
}) => {
  return (
    <form onSubmit={handleAddStaff} style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <input
        type="text"
        placeholder="Staff Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ background: '#0f172a', border: '1px solid #475569', padding: '10px 12px', borderRadius: '6px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
        required
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as any)}
        style={{ background: '#0f172a', border: '1px solid #475569', padding: '10px 12px', borderRadius: '6px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
      >
        <option value="Guard">Guard</option>
        <option value="Aya">Aya</option>
        <option value="Sweeper">Sweeper</option>
        <option value="Peon">Peon</option>
        <option value="Driver">Driver</option>
        <option value="Other">Other</option>
      </select>
      <input
        type="number"
        placeholder="Salary (Rs)"
        value={salary}
        onChange={(e) => setSalary(e.target.value)}
        style={{ background: '#0f172a', border: '1px solid #475569', padding: '10px 12px', borderRadius: '6px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
        required
      />
      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ background: '#0f172a', border: '1px solid #475569', padding: '10px 12px', borderRadius: '6px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
      />
      <button
        type="submit"
        style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
      >
        Save Staff
      </button>
    </form>
  );
};