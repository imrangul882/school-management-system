import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { updateFeeStatus, updateStudent, closeStudentRecord, fetchStudents } from './studentSlice';
import { PaymentModal } from '../../components/PaymentModal';
import { StudentFormModal } from './StudentFormModal';
import { StudentTable } from './StudentTable';
import type { Student } from './studentSlice';
import { supabase } from '../../supabaseClient';

const CLASSES_LIST = ["Montessori", "Nursery", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
const SECTIONS_LIST = ["A", "B", "C"] as const;

export const StudentList: React.FC = () => {
  const dispatch = useAppDispatch();
  const students = useAppSelector((state: any) => state.students.students);
  
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("All");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("All");

  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [fatherName, setFatherName] = useState(''); 
  const [studentClass, setStudentClass] = useState('Montessori');
  const [section, setSection] = useState<"A" | "B" | "C">("A");
  const [feeAmount, setFeeAmount] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [image, setImage] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const fetchStudentsFromSupabase = async () => {
    const { data, error } = await supabase.from('students').select('*');
    if (error) {
      console.error('Error fetching students:', error.message);
    } else if (data) {
      dispatch(fetchStudents());
    }
  };

  useEffect(() => {
    fetchStudentsFromSupabase();
  }, [dispatch]);

  // Supabase mein fee status update karne ka function
  const handleUpdateFeeInSupabase = async (studentId: string, rollNo: string) => {
    const { error } = await supabase
      .from('students')
      .update({ fee_status: 'Paid' })
      .eq('roll_no', rollNo);

    if (error) {
      console.error('Error updating fee status in Supabase:', error.message);
      alert('Fee status update nahi ho saka: ' + error.message);
    } else {
      console.log('Fee status updated successfully in Supabase!');
      fetchStudentsFromSupabase();
      dispatch(updateFeeStatus(studentId));
    }
  };

  const handleAddImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !studentClass || !feeAmount) return;

    const newRollNo = rollNo || `FIN-${Math.floor(100 + Math.random() * 900)}`;

    const { error } = await supabase
      .from('students')
      .insert([
        {
          roll_no: newRollNo,
          name: name,
          gender: gender,
          father_name: fatherName,
          class: studentClass,
          section: section,
          fee_amount: Number(feeAmount),
          fee_status: 'Pending',
          parent_phone: parentPhone,
          image: image,
        }
      ]);

    if (error) {
      console.error('Supabase Error:', error.message);
      alert('Database mein data save nahi ho saka: ' + error.message);
      return;
    }

    fetchStudentsFromSupabase();

    setRollNo('');
    setName('');
    setGender('Male');
    setFatherName('');
    setFeeAmount('');
    setParentPhone('');
    setImage('');

    alert('Student successfully saved to Supabase & loaded to Dashboard!');
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      dispatch(updateStudent(editingStudent));
      setEditingStudent(null);
      alert('Student details updated successfully!');
    }
  };

  const handleCloseRecord = (id: string) => {
    if (window.confirm("Are you sure you want to close this student record?")) {
      dispatch(closeStudentRecord(id));
      if (editingStudent?.id === id) {
        setEditingStudent(null);
      }
    }
  };

  const filteredStudents = students.filter((student: Student) => {
    const matchesClass = selectedClassFilter === "All" || student.studentClass === selectedClassFilter;
    const matchesSection = selectedSectionFilter === "All" || student.section === selectedSectionFilter;
    return matchesClass && matchesSection;
  });

  return (
    <div>
      {/* Add New Student Form */}
      <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #ddd' }}>
        <h3>Add New Student (Admin Panel)</h3>
        <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input 
            type="text" placeholder="Roll No (e.g. FIN-101)" value={rollNo} 
            onChange={(e) => setRollNo(e.target.value)} style={{ padding: '8px', width: '130px' }}
          />
          <input 
            type="text" placeholder="Student Name" value={name} 
            onChange={(e) => setName(e.target.value)} required style={{ padding: '8px' }}
          />
          <select 
            value={gender} 
            onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
            style={{ padding: '8px', fontWeight: 'bold' }}
          >
            <option value="Male">Male (S/O)</option>
            <option value="Female">Female (D/O)</option>
          </select>
          <input 
            type="text" placeholder="Father Name" value={fatherName} 
            onChange={(e) => setFatherName(e.target.value)} required style={{ padding: '8px' }}
          />
          <select 
            value={studentClass} 
            onChange={(e) => setStudentClass(e.target.value)}
            style={{ padding: '8px', fontWeight: 'bold' }}
          >
            {CLASSES_LIST.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          <select 
            value={section} 
            onChange={(e) => setSection(e.target.value as "A" | "B" | "C")}
            style={{ padding: '8px', fontWeight: 'bold' }}
          >
            {SECTIONS_LIST.map((sec) => (
              <option key={sec} value={sec}>Section {sec}</option>
            ))}
          </select>
          <input 
            type="number" placeholder="Fee Amount (Rs)" value={feeAmount} 
            onChange={(e) => setFeeAmount(e.target.value)} required style={{ padding: '8px', width: '120px' }}
          />
          <input 
            type="text" placeholder="Parent Phone" value={parentPhone} 
            onChange={(e) => setParentPhone(e.target.value)} style={{ padding: '8px' }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}>Student Picture:</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAddImageChange} 
                style={{ fontSize: '11px', width: '150px' }} 
              />
            </div>
            {image && (
              <img 
                src={image} 
                alt="Preview" 
                style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ccc' }} 
              />
            )}
          </div>

          <button type="submit" style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>
            Save Student
          </button>
        </form>
      </div>

      {/* Browse by Class & Sections */}
      <h3>Browse by Class & Sections</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => { setSelectedClassFilter("All"); setSelectedSectionFilter("All"); }}
          style={{ 
            padding: '10px 12px', 
            background: selectedClassFilter === "All" ? '#1e293b' : '#f8fafc', 
            color: selectedClassFilter === "All" ? '#fff' : '#334155', 
            border: selectedClassFilter === "All" ? '1px solid #1e293b' : '1px solid #cbd5e1', 
            cursor: 'pointer', borderRadius: '8px', fontWeight: '600', fontSize: '13px', textAlign: 'center'
          }}
        >
          All Classes
        </button>
        {CLASSES_LIST.map((cls) => {
          const classCount = students.filter((s: Student) => s.studentClass === cls).length;
          const isSelected = selectedClassFilter === cls;
          return (
            <button 
              key={cls}
              onClick={() => { setSelectedClassFilter(cls); setSelectedSectionFilter("All"); }}
              style={{ 
                padding: '10px 8px', 
                background: isSelected ? '#74223d' : '#f8fafc', 
                color: isSelected ? '#ece5e5' : '#5075b4', 
                border: isSelected ? '1px solid #691729' : '1px solid #cbd5e1', 
                cursor: 'pointer', borderRadius: '8px', fontWeight: '600', fontSize: '13px', textAlign: 'center'
              }}
            >
              {cls} ({classCount})
            </button>
          );
        })}
      </div>

      {selectedClassFilter !== "All" && (
        <div style={{ background: '#eef2f5', padding: '10px 15px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <span><b>{selectedClassFilter} Sections:</b></span>
          <button 
            onClick={() => setSelectedSectionFilter("All")}
            style={{ padding: '5px 10px', background: selectedSectionFilter === "All" ? '#0288d1' : '#fff', color: selectedSectionFilter === "All" ? '#fff' : '#333', border: '1px solid #0288d1', cursor: 'pointer', borderRadius: '3px' }}
          >
            All Sections
          </button>
         {SECTIONS_LIST.map((sec) => {
            const secCount = students.filter((s: Student) => s.studentClass === selectedClassFilter && s.section === sec).length;
            return (
              <button 
                key={sec}
                onClick={() => setSelectedSectionFilter(sec)}
                style={{ 
                  padding: '5px 12px', 
                  background: selectedSectionFilter === sec ? '#0288d1' : '#fff', 
                  color: selectedSectionFilter === sec ? '#fff' : '#333', 
                  border: '1px solid #0288d1', cursor: 'pointer', borderRadius: '3px', fontWeight: 'bold'
                }}
              >
                Section {sec} ({secCount} Students)
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3>
          Students List {selectedClassFilter !== "All" ? `- ${selectedClassFilter}` : ""} {selectedSectionFilter !== "All" ? `(Section ${selectedSectionFilter})` : ""}
        </h3>
        <span>Total Shown: <b>{filteredStudents.length}</b></span>
      </div>

      <StudentTable 
        filteredStudents={filteredStudents}
        onPayFee={(student: any) => setActiveStudent(student)}
        onEditStudent={(student: any) => setEditingStudent(student)}
        onCloseRecord={handleCloseRecord}
      />

      {activeStudent && (
        <PaymentModal 
          studentName={activeStudent.name}
          amount={activeStudent.feeAmount}
          onClose={() => setActiveStudent(null)}
          onSuccess={() => {
            // Yahan ab Supabase aur Redux dono mein status 'Paid' update ho jayega
            handleUpdateFeeInSupabase(activeStudent.id, activeStudent.rollNo);
            setActiveStudent(null);
          }}
        />
      )}

      {editingStudent && (
        <StudentFormModal 
          editingStudent={editingStudent}
          setEditingStudent={setEditingStudent}
          handleUpdateSubmit={handleUpdateSubmit}
          classesList={CLASSES_LIST}
          sectionsList={SECTIONS_LIST}
          onCloseRecord={handleCloseRecord}
        />
      )}
    </div>
  );
};