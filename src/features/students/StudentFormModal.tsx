import React from 'react';
import type { Student } from './studentSlice';

interface StudentFormModalProps {
  editingStudent: Student;
  setEditingStudent: React.Dispatch<React.SetStateAction<Student | null>>;
  handleUpdateSubmit: (e: React.FormEvent) => void;
  classesList: string[];
  sectionsList: readonly ("A" | "B" | "C")[];
  onCloseRecord?: (id: string) => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  editingStudent,
  setEditingStudent,
  handleUpdateSubmit,
  classesList,
  sectionsList,
  onCloseRecord,
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingStudent({
          ...editingStudent,
          image: reader.result as string, 
        });
      };
      reader.readAsDataURL(file);
    }
  };

 return (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
    <form onSubmit={handleUpdateSubmit} style={{ background: '#1e293b', padding: '25px', borderRadius: '12px', width: '480px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
      <h3 style={{ margin: '0 0 5px 0', color: '#f8fafc', fontSize: '18px' }}>Edit Student Profile</h3>
      
      {/* Image Upload Box */}
      <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px dashed #38bdf8', boxShadow: '0 0 8px rgba(56, 189, 248, 0.15)' }}>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: '#38bdf8', marginBottom: '6px' }}>
          Upload Student Picture from PC:
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            style={{ fontSize: '12px', width: '100%', color: '#f8fafc', background: '#0f172a', border: '1px solid #475569', padding: '6px', borderRadius: '6px', outline: 'none' }} 
          />
          {editingStudent.image && (
            <img 
              src={editingStudent.image} 
              alt="Preview" 
              style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #38bdf8' }} 
            />
          )}
        </div>
      </div>

      {/* Roll Number */}
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>Roll Number:</label>
      <input 
        type="text" 
        value={editingStudent.rollNo} 
        onChange={(e) => setEditingStudent({ ...editingStudent, rollNo: e.target.value })} 
        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #3b82f6', background: '#0f172a', color: '#60a5fa', fontWeight: '600', outline: 'none', boxShadow: '0 0 8px rgba(59, 130, 246, 0.15)' }} 
        required 
      />

      {/* Student Name */}
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>Student Name:</label>
      <input 
        type="text" 
        value={editingStudent.name} 
        onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })} 
        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #22c55e', background: '#0f172a', color: '#4ade80', fontWeight: '600', outline: 'none', boxShadow: '0 0 8px rgba(34, 197, 94, 0.15)' }} 
        required 
      />

      {/* Gender */}
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>Gender (S/O or D/O selection):</label>
      <select 
        value={editingStudent.gender || 'Male'} 
        onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value as 'Male' | 'Female' })} 
        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #a855f7', background: '#0f172a', color: '#c084fc', fontWeight: '600', outline: 'none', boxShadow: '0 0 8px rgba(168, 85, 247, 0.15)' }}
      >
        <option value="Male" style={{ background: '#0f172a', color: '#cff017' }}>Male (S/O)</option>
        <option value="Female" style={{ background: '#0f172a', color: '#a8ec09' }}>Female (D/O)</option>
      </select>

      {/* Father Name */}
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>Father Name:</label>
      <input 
        type="text" 
        value={editingStudent.fatherName} 
        onChange={(e) => setEditingStudent({ ...editingStudent, fatherName: e.target.value })} 
        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ec4899', background: '#0f172a', color: '#f472b6', fontWeight: '600', outline: 'none', boxShadow: '0 0 8px rgba(236, 72, 153, 0.15)' }} 
        required 
      />

      {/* Class */}
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>Class:</label>
      <select 
        value={editingStudent.studentClass} 
        onChange={(e) => setEditingStudent({ ...editingStudent, studentClass: e.target.value })} 
        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #eab308', background: '#0f172a', color: '#facc15', fontWeight: '600', outline: 'none', boxShadow: '0 0 8px rgba(234, 179, 8, 0.15)' }}
      >
        {classesList.map(cls => <option key={cls} value={cls} style={{ background: '#0f172a', color: '#f8fafc' }}>{cls}</option>)}
      </select>

      {/* Section */}
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>Section:</label>
      <select 
        value={editingStudent.section} 
        onChange={(e) => setEditingStudent({ ...editingStudent, section: e.target.value as "A" | "B" | "C" })} 
        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #225518', background: '#0f172a', color: '#22d3ee', fontWeight: '600', outline: 'none', boxShadow: '0 0 8px rgba(6, 182, 212, 0.15)' }}
      >
        {sectionsList.map(sec => <option key={sec} value={sec} style={{ background: '#0f172a', color: '#f8fafc' }}>Section {sec}</option>)}
      </select>

      {/* Fee Amount */}
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>Fee Amount (Rs):</label>
      <input 
        type="number" 
        value={editingStudent.feeAmount} 
        onChange={(e) => setEditingStudent({ ...editingStudent, feeAmount: Number(e.target.value) })} 
        style={{ padding: '10px', borderRadius: '50px', border: '10px solid #10b981', background: '#0f172a', color: '#34d399', fontWeight: '700', outline: 'none', boxShadow: '0 0 8px rgba(16, 185, 129, 0.15)' }} 
        required 
      />

      {/* Fee Status */}
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>Fee Status:</label>
      <select 
        value={editingStudent.feeStatus} 
        onChange={(e) => setEditingStudent({ ...editingStudent, feeStatus: e.target.value as 'Paid' | 'Pending' })} 
        style={{ padding: '10px', borderRadius: '8px', border: editingStudent.feeStatus === 'Paid' ? '1px solid #22c55e' : '1px solid #ef4444', background: '#0f172a', fontWeight: 'bold', color: editingStudent.feeStatus === 'Paid' ? '#4ade80' : '#f87171', outline: 'none', boxShadow: editingStudent.feeStatus === 'Paid' ? '0 0 8px rgba(34, 197, 94, 0.15)' : '0 0 8px rgba(239, 68, 68, 0.15)' }}
      >
        <option value="Pending" style={{ background: '#0f172a', color: '#f87171' }}>Pending (Unpaid)</option>
        <option value="Paid" style={{ background: '#0f172a', color: '#4ade80' }}>Paid</option>
      </select>

      {/* Parent Phone */}
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>Parent Phone:</label>
      <input 
        type="text" 
        value={editingStudent.parentPhone || ''} 
        onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })} 
        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #64748b', background: '#0f172a', color: '#cbd5e1', fontWeight: '600', outline: 'none', boxShadow: '0 0 8px rgba(100, 116, 139, 0.15)' }} 
      />

      {/* Buttons Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
        {onCloseRecord && (
          <button 
            type="button" 
            onClick={() => onCloseRecord(editingStudent.id)} 
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Close Record
          </button>
        )}
        <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
          <button type="button" onClick={() => setEditingStudent(null)} style={{ padding: '10px 14px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #475569', background: '#334155', color: '#f8fafc', fontWeight: '500' }}>Cancel</button>
          <button type="submit" style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
        </div>
      </div>
    </form>
  </div>
);
};