 import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchAttendanceFromSupabase, addThumbInToSupabase, updateThumbOutInSupabase, addSmsLog } from './attendanceSlice';
import { ClassSectionFilters } from './ClassSectionFilters';
import { InsideSchoolTable } from './InsideSchoolTable';
import { WhatsAppLogsPanel } from './WhatsAppLogsPanel';

export const AttendancePanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const students = useAppSelector((state: any) => state.students.students);
  const attendanceRecords = useAppSelector((state: any) => state.attendance.records);
  const smsLogs = useAppSelector((state: any) => state.attendance.smsLogs);

  const [selectedClass, setSelectedClass] = useState<string>('Montessori');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [checkedStudentIds, setCheckedStudentIds] = useState<string[]>([]);
  
  const [checkedOutRecordIds, setCheckedOutRecordIds] = useState<string[]>([]);
  const [bulkPickedBy, setBulkPickedBy] = useState<string>('Father');
  const [pickedByMap, setPickedByMap] = useState<{ [key: string]: string }>({});

  const classesList = ['Montessori', 'Nursery', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
  const sectionsList = ['All', 'Section A', 'Section B', 'Section C'];

 useEffect(() => {
    dispatch(fetchAttendanceFromSupabase());
  }, [dispatch]);

  // 💡 Aaj ki date nikalne ka tareeqa
  const todayDateString = new Date().toISOString().split('T')[0]; // Format: "2026-09-17"

  // 👇 Yahan yeh nayi useEffect lagani hai taake checkboxes checked rahein
  useEffect(() => {
    if (attendanceRecords && attendanceRecords.length > 0) {
      const todayInStudentIds = attendanceRecords
        .filter((r: any) => {
          if (!r.created_at) return false;
          const recordDateOnly = r.created_at.split('T')[0].split(' ')[0];
          return recordDateOnly === todayDateString && r.status === 'In School';
        })
        .map((r: any) => r.studentId);

      setCheckedStudentIds(prev => Array.from(new Set([...prev, ...todayInStudentIds])));
    }
  }, [attendanceRecords, todayDateString]);

  const todayAttendanceRecords = attendanceRecords.filter((r: any) => {
    // ... baaki aapka code wese hi rahega    if (!r.created_at) return false;
    const recordDateOnly = r.created_at.split('T')[0].split(' ')[0];
    return recordDateOnly === todayDateString;
  });

  const todaySmsLogs = smsLogs.filter((l: any) => {
    if (!l.created_at) return false;
    // Sirf date ka hissa alag karna (jaise "2026-09-17")
    const logDateOnly = l.created_at.split('T')[0].split(' ')[0];
    return logDateOnly === todayDateString;
  });
  // Filter students for Thumb IN
  const filteredStudents = students.filter((s: any) => {
    const matchesClass = s.studentClass === selectedClass;
    const matchesSection = selectedSection === 'All' || s.section === selectedSection.replace('Section ', '');
    return matchesClass && matchesSection;
  });

  // Handlers (Thumb In, Thumb Out, Checkboxes waghera wese hi rahenge)
  const handleCheckboxToggle = (studentId: string) => {
    if (checkedStudentIds.includes(studentId)) {
      setCheckedStudentIds(checkedStudentIds.filter(id => id !== studentId));
    } else {
      setCheckedStudentIds([...checkedStudentIds, studentId]);
    }
  };

  const handleSelectAllToggle = () => {
    const allFilteredIds = filteredStudents.map((s: any) => s.id);
    const allSelected = allFilteredIds.every((id: string) => checkedStudentIds.includes(id));
    if (allSelected) {
      setCheckedStudentIds(checkedStudentIds.filter(id => !allFilteredIds.includes(id)));
    } else {
      setCheckedStudentIds(Array.from(new Set([...checkedStudentIds, ...allFilteredIds])));
    }
  };
  const isStudentAlreadyIn = (studentId: string) => {
    return todayAttendanceRecords.some(
      (r: any) => String(r.studentId) === String(studentId) && r.status === 'In School'
    );
  };

 const handleBulkThumbIn = async () => {
    if (checkedStudentIds.length === 0) {
      alert("Please select at least one student!");
      return;
    }
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let openedCount = 0;
    
    for (let i = 0; i < checkedStudentIds.length; i++) {
      const studentId = checkedStudentIds[i];
      const student = students.find((s: any) => s.id === studentId);
      if (!student) continue;

      if (isStudentAlreadyIn(studentId)) continue;
      try {
        await dispatch(addThumbInToSupabase({ 
          studentId: student.id, studentName: student.name, studentClass: student.studentClass,
          section: student.section || 'A', parentPhone: student.parentPhone || 'Not Provided', inTime: currentTime
        })).unwrap();
      } catch (error) {
        continue;
      }

      const message = `Alert: Your child ${student.name} (${student.studentClass} - Sec ${student.section || 'A'}) has safely arrived at school at ${currentTime}.`;
      if (student.parentPhone && student.parentPhone !== 'Not Provided') {
        let formattedPhone = student.parentPhone.replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('0')) formattedPhone = '92' + formattedPhone.slice(1);
        
        dispatch(addSmsLog({ phone: formattedPhone, message, time: currentTime }));
        setTimeout(() => window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank'), i * 600);
        openedCount++;
      }
    }
    alert(`Thumb IN processed for ${openedCount} students!`);
    setCheckedStudentIds([]);
  };

  const handleOutCheckboxToggle = (recordId: string) => {
    if (checkedOutRecordIds.includes(recordId)) {
      setCheckedOutRecordIds(checkedOutRecordIds.filter(id => id !== recordId));
    } else {
      setCheckedOutRecordIds([...checkedOutRecordIds, recordId]);
    }
  };

  const handleSelectAllOutToggle = () => {
    const insideRecords = todayAttendanceRecords.filter((r: any) => r.status === 'In School');
    const allRecordIds = insideRecords.map((r: any) => r.id);
    const allSelected = allRecordIds.every((id: string) => checkedOutRecordIds.includes(id));
    setCheckedOutRecordIds(allSelected ? [] : allRecordIds);
  };

  

  const handleBulkThumbOut = async () => {
    if (checkedOutRecordIds.length === 0) {
      alert("Please select at least one student!");
      return;
    }
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let openedCount = 0;

    for (let i = 0; i < checkedOutRecordIds.length; i++) {
      const recordId = checkedOutRecordIds[i];
      const record = todayAttendanceRecords.find((r: any) => r.id === recordId);
      if (!record) continue;

      const student = students.find((s: any) => String(s.id) === String(record.studentId));
      const parentPhone = student?.parentPhone || record?.parentPhone;
      const pickedBy = pickedByMap[record.studentId] || bulkPickedBy;

      const nameToUse = record?.studentName || student?.name || 'Student';

      try {
        await dispatch(updateThumbOutInSupabase({ recordId: record.id, outTime: currentTime, pickedBy })).unwrap();
      } catch (error) {
        continue;
      }

      const message = `Alert: Your child ${nameToUse} has left school at ${currentTime}, picked by ${pickedBy}.`;
      
      if (parentPhone && parentPhone !== 'Not Provided') {
        let formattedPhone = parentPhone.replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('0')) formattedPhone = '92' + formattedPhone.slice(1);
        
        dispatch(addSmsLog({ phone: formattedPhone, message, time: currentTime }));
        setTimeout(() => window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank'), i * 600);
        openedCount++;
      }
    }

    alert(`Thumb OUT processed for ${openedCount} students!`);
    setCheckedOutRecordIds([]);
    
    // ✅ List foran update karne ke liye sahi fetch action dispatch kardiya gaya hai
    dispatch(fetchAttendanceFromSupabase()); 
  };

  const handleThumbOut = async (recordId: string, studentId: string) => {
    const record = todayAttendanceRecords.find((r: any) => r.id === recordId || r.studentId === studentId);
    if (!record) return; // Safety check
    
    const student = students.find((s: any) => s.id === studentId);
    const parentPhone = student?.parentPhone || record?.parentPhone;
    const pickedBy = pickedByMap[studentId] || 'Father';
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const nameToUse = record?.studentName || student?.name || 'Student';

    try {
      await dispatch(updateThumbOutInSupabase({ recordId: record.id, outTime: currentTime, pickedBy })).unwrap();
      
      const message = `Alert: Your child ${nameToUse} has left school at ${currentTime}, picked by ${pickedBy}.`;
      if (parentPhone && parentPhone !== 'Not Provided') {
        let formattedPhone = parentPhone.replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('0')) formattedPhone = '92' + formattedPhone.slice(1);
        
        dispatch(addSmsLog({ phone: formattedPhone, message, time: currentTime }));
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
      }

      // ✅ Single thumb out ke baad bhi list refresh karne ke liye dispatch kardiya gaya hai
      dispatch(fetchAttendanceFromSupabase());

    } catch (error) {
      console.error("Thumb Out Error:", error);
    }
  };

  const handlePickedByChange = (studentId: string, value: string) => {
    setPickedByMap(prev => ({ ...prev, [studentId]: value }));
  };

  const insideStudents = todayAttendanceRecords.filter((r: any) => r.status === 'In School');
  return (
    <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '24px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '22px', fontWeight: '700' }}>
            Gate Biometric & Smart WhatsApp Alert System
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Select class buttons, pick students via checkboxes, and manage bulk Thumb In/Out broadcasts.
        </p>
      </div>

      {/* 1. Filters Component */}
      <ClassSectionFilters 
        classesList={classesList}
        sectionsList={sectionsList}
        selectedClass={selectedClass}
        selectedSection={selectedSection}
        onSelectClass={(cls) => { setSelectedClass(cls); setCheckedStudentIds([]); }}
        onSelectSection={setSelectedSection}
        students={students}
      />

      {/* Control Box: Student Checkbox List for Thumb IN */}
      <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#1e293b', fontWeight: '600' }}>
            Select Students for Thumb IN: <span style={{ color: '#2563eb' }}>{selectedClass} ({selectedSection})</span> — Total Found: {filteredStudents.length}
          </h3>
          <button 
            onClick={handleBulkThumbIn}
            style={{ background: '#16a34a', color: 'white', border: 'none', padding: '10px 18px', cursor: 'pointer', borderRadius: '6px', fontWeight: '600', fontSize: '14px' }}
          >
            Thumb IN & WhatsApp Alert ({checkedStudentIds.length} Selected)
          </button>
        </div>

        <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead style={{ background: '#f1f5f9', position: 'sticky', top: 0, zIndex: 1 }}>
              <tr>
                <th style={{ padding: '8px 12px', width: '40px' }}>
                  <input type="checkbox" onChange={handleSelectAllToggle} checked={filteredStudents.length > 0 && filteredStudents.every((s: any) => checkedStudentIds.includes(s.id))} />
                </th>
                <th style={{ padding: '8px 12px' }}>Roll No</th>
                <th style={{ padding: '8px 12px' }}>Student Name</th>
                <th style={{ padding: '8px 12px' }}>Father Name</th>
                <th style={{ padding: '8px 12px' }}>Parent Phone</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student: any) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 12px' }}>
                      <input type="checkbox" checked={checkedStudentIds.includes(student.id)} onChange={() => handleCheckboxToggle(student.id)} />
                    </td>
                    <td style={{ padding: '8px 12px', color: '#64748b' }}>{student.rollNo || 'N/A'}</td>
                    <td style={{ padding: '8px 12px', fontWeight: '600', color: '#0f172a' }}>{student.name}</td>
                    <td style={{ padding: '8px 12px', color: '#475569' }}>{student.fatherName || 'N/A'}</td>
                    <td style={{ padding: '8px 12px', color: '#059669', fontWeight: '500' }}>{student.parentPhone || 'Not Provided'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* 2. Inside School Table Component */}
        <InsideSchoolTable 
          insideStudents={insideStudents}
          checkedOutRecordIds={checkedOutRecordIds}
          bulkPickedBy={bulkPickedBy}
          setBulkPickedBy={setBulkPickedBy}
          pickedByMap={pickedByMap}
          handlePickedByChange={handlePickedByChange}
          handleOutCheckboxToggle={handleOutCheckboxToggle}
          handleSelectAllOutToggle={handleSelectAllOutToggle}
          handleBulkThumbOut={handleBulkThumbOut}
          handleThumbOut={handleThumbOut}
        />

        {/* 3. WhatsApp Logs Panel Component */}
        <WhatsAppLogsPanel smsLogs={todaySmsLogs} />

      </div>
    </div>
  );
};