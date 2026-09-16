import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchAttendanceFromSupabase, addThumbInToSupabase, updateThumbOutInSupabase, addSmsLog 
} from './attendanceSlice';

export const AttendancePanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const students = useAppSelector((state: any) => state.students.students);
  const attendanceRecords = useAppSelector((state: any) => state.attendance.records);
  const smsLogs = useAppSelector((state: any) => state.attendance.smsLogs);

  // States for Class Filtering and Checkbox Selection (Thumb IN)
  const [selectedClass, setSelectedClass] = useState<string>('Montessori');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [checkedStudentIds, setCheckedStudentIds] = useState<string[]>([]);
  
  // States for Thumb OUT Checkboxes & Bulk Picked By
  const [checkedOutRecordIds, setCheckedOutRecordIds] = useState<string[]>([]);
  const [bulkPickedBy, setBulkPickedBy] = useState<string>('Father');
  const [pickedByMap, setPickedByMap] = useState<{ [key: string]: string }>({});

  const classesList = ['Montessori', 'Nursery', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
  const sectionsList = ['All', 'Section A', 'Section B', 'Section C'];

  // Component load hone par Supabase se records fetch karein
  useEffect(() => {
    dispatch(fetchAttendanceFromSupabase());
  }, [dispatch]);

  // Filter students for Thumb IN based on selected class and section
  const filteredStudents = students.filter((s: any) => {
    const matchesClass = s.studentClass === selectedClass;
    const matchesSection = selectedSection === 'All' || s.section === selectedSection.replace('Section ', '');
    return matchesClass && matchesSection;
  });

  // Handle individual checkbox selection (Thumb IN)
  const handleCheckboxToggle = (studentId: string) => {
    if (checkedStudentIds.includes(studentId)) {
      setCheckedStudentIds(checkedStudentIds.filter(id => id !== studentId));
    } else {
      setCheckedStudentIds([...checkedStudentIds, studentId]);
    }
  };

  // Handle Select All / Unselect All for Thumb IN view
  const handleSelectAllToggle = () => {
    const allFilteredIds = filteredStudents.map((s: any) => s.id);
    const allSelected = allFilteredIds.every((id: string) => checkedStudentIds.includes(id));

    if (allSelected) {
      setCheckedStudentIds(checkedStudentIds.filter(id => !allFilteredIds.includes(id)));
    } else {
      const combined = Array.from(new Set([...checkedStudentIds, ...allFilteredIds]));
      setCheckedStudentIds(combined);
    }
  };

  // Bulk Thumb IN & WhatsApp Broadcast with Delay
  const handleBulkThumbIn = async () => {
    if (checkedStudentIds.length === 0) {
      alert("Please select at least one student using checkboxes!");
      return;
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let openedCount = 0;
    
    for (let i = 0; i < checkedStudentIds.length; i++) {
      const studentId = checkedStudentIds[i];
      const student = students.find((s: any) => s.id === studentId);
      if (!student) continue;

      const alreadyInside = attendanceRecords.some((r: any) => r.studentId === studentId && r.status === 'In School');
      if (alreadyInside) continue;

      try {
        await dispatch(addThumbInToSupabase({ 
          studentId: student.id,
          studentName: student.name, 
          studentClass: student.studentClass,
          section: student.section || 'A',
          parentPhone: student.parentPhone || 'Not Provided',
          inTime: currentTime
        })).unwrap();
      } catch (error) {
        console.error(`Failed to save Thumb In for ${student.name}:`, error);
        continue;
      }

      const message = `Alert: Your child ${student.name} (${student.studentClass} - Sec ${student.section || 'A'}) has safely arrived at school at ${currentTime}.`;
      const encodedMessage = encodeURIComponent(message);

      if (student.parentPhone && student.parentPhone !== 'Not Provided') {
        let formattedPhone = student.parentPhone.replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '92' + formattedPhone.slice(1);
        }
        
        dispatch(addSmsLog({
          phone: formattedPhone,
          message: message,
          time: currentTime
        }));

        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
        
        // Use setTimeout to open each tab sequentially so browser doesn't block them
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
        }, i * 600); // 600ms gap between each opened tab

        openedCount++;
      }
    }

    alert(`Thumb IN processed & WhatsApp alerts triggered for ${openedCount} students!`);
    setCheckedStudentIds([]);
  };

  // Handle individual Thumb OUT checkbox toggle
  const handleOutCheckboxToggle = (recordId: string) => {
    if (checkedOutRecordIds.includes(recordId)) {
      setCheckedOutRecordIds(checkedOutRecordIds.filter(id => id !== recordId));
    } else {
      setCheckedOutRecordIds([...checkedOutRecordIds, recordId]);
    }
  };

  // Handle Select All for Thumb OUT table
  const handleSelectAllOutToggle = () => {
    const insideRecords = attendanceRecords.filter((r: any) => r.status === 'In School');
    const allRecordIds = insideRecords.map((r: any) => r.id);
    const allSelected = allRecordIds.every((id: string) => checkedOutRecordIds.includes(id));

    if (allSelected) {
      setCheckedOutRecordIds([]);
    } else {
      setCheckedOutRecordIds(allRecordIds);
    }
  };

  // Bulk Thumb OUT & WhatsApp Broadcast with Delay
  const handleBulkThumbOut = async () => {
    if (checkedOutRecordIds.length === 0) {
      alert("Please select at least one student from inside school table!");
      return;
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let openedCount = 0;

    for (let i = 0; i < checkedOutRecordIds.length; i++) {
      const recordId = checkedOutRecordIds[i];
      const record = attendanceRecords.find((r: any) => r.id === recordId);
      if (!record) continue;

      const student = students.find((s: any) => s.id === record.studentId);
      const parentPhone = student?.parentPhone || record?.parentPhone;
      const pickedBy = pickedByMap[record.studentId] || bulkPickedBy;

      try {
        await dispatch(updateThumbOutInSupabase({
          recordId: record.id,
          outTime: currentTime,
          pickedBy: pickedBy
        })).unwrap();
      } catch (error) {
        console.error("Failed to update Thumb Out for record:", record.id, error);
        continue;
      }

      const studentName = student?.name || record?.studentName || 'Student';
      const studentClass = student?.studentClass || record?.studentClass || '';
      const section = student?.section || record?.section || 'A';

      const message = `Alert: Your child ${studentName} (${studentClass} - Sec ${section}) has safely left the school at ${currentTime}, picked by ${pickedBy}.`;
      const encodedMessage = encodeURIComponent(message);

      if (parentPhone && parentPhone !== 'Not Provided') {
        let formattedPhone = parentPhone.replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '92' + formattedPhone.slice(1);
        }
        
        dispatch(addSmsLog({ 
          phone: formattedPhone, 
          message: message,
          time: currentTime 
        }));

        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
        
        // Sequential opening with delay to prevent popup blocking
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
        }, i * 600);

        openedCount++;
      }
    }

    alert(`Thumb OUT processed & WhatsApp alerts triggered for ${openedCount} students!`);
    setCheckedOutRecordIds([]);
  };

  // Single Thumb OUT handler
  const handleThumbOut = async (recordId: string, studentId: string) => {
    const record = attendanceRecords.find((r: any) => r.id === recordId || r.studentId === studentId);
    const student = students.find((s: any) => s.id === studentId);
    const parentPhone = student?.parentPhone || record?.parentPhone;
    const pickedBy = pickedByMap[studentId] || 'Father';
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (!record) {
      alert("Attendance record not found!");
      return;
    }

    try {
      await dispatch(updateThumbOutInSupabase({
        recordId: record.id,
        outTime: currentTime,
        pickedBy: pickedBy
      })).unwrap();
    } catch (error) {
      console.error("Failed to update Thumb Out in Supabase:", error);
      alert("Database error while marking Thumb Out.");
      return;
    }

    const studentName = student?.name || record?.studentName || 'Student';
    const studentClass = student?.studentClass || record?.studentClass || '';
    const section = student?.section || record?.section || 'A';

    const message = `Alert: Your child ${studentName} (${studentClass} - Sec ${section}) has safely left the school at ${currentTime}, picked by ${pickedBy}.`;
    const encodedMessage = encodeURIComponent(message);

    if (parentPhone && parentPhone !== 'Not Provided') {
      let formattedPhone = parentPhone.replace(/[^0-9]/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '92' + formattedPhone.slice(1);
      }
      
      dispatch(addSmsLog({ 
        phone: formattedPhone, 
        message: message,
        time: currentTime 
      }));

      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert("Checked out successfully, but Parent Phone number is missing!");
    }
  };

  const handlePickedByChange = (studentId: string, value: string) => {
    const val = value; // local usage guard
    setPickedByMap(prev => ({
      ...prev,
      [studentId]: val
    }));
  };

  const insideStudents = attendanceRecords.filter((r: any) => r.status === 'In School');

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

      {/* Class Selection Buttons Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
        {classesList.map((cls) => {
          const count = students.filter((s: any) => s.studentClass === cls).length;
          return (
            <button
              key={cls}
              onClick={() => { setSelectedClass(cls); setCheckedStudentIds([]); }}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: selectedClass === cls ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: selectedClass === cls ? '#eff6ff' : '#ffffff',
                color: selectedClass === cls ? '#1d4ed8' : '#334155',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              {cls} ({count})
            </button>
          );
        })}
      </div>

      {/* Section Filter Bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Sections:</span>
        {sectionsList.map((sec) => (
          <button
            key={sec}
            onClick={() => setSelectedSection(sec)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: selectedSection === sec ? '#334155' : '#e2e8f0',
              color: selectedSection === sec ? '#ffffff' : '#475569',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Control Box: Student Checkbox List for Thumb IN */}
      <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#1e293b', fontWeight: '600' }}>
            Select Students for Thumb IN: <span style={{ color: '#2563eb' }}>{selectedClass} ({selectedSection})</span> — Total Found: {filteredStudents.length}
          </h3>
          <button 
            onClick={handleBulkThumbIn}
            style={{ 
              background: '#16a34a', color: 'white', border: 'none', padding: '10px 18px', 
              cursor: 'pointer', borderRadius: '6px', fontWeight: '600', fontSize: '14px',
              boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
            }}
          >
            Thumb IN & WhatsApp Alert ({checkedStudentIds.length} Selected)
          </button>
        </div>

        <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead style={{ background: '#f1f5f9', position: 'sticky', top: 0, zIndex: 1 }}>
              <tr>
                <th style={{ padding: '8px 12px', width: '40px' }}>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAllToggle}
                    checked={filteredStudents.length > 0 && filteredStudents.every((s: any) => checkedStudentIds.includes(s.id))}
                  />
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
                      <input 
                        type="checkbox" 
                        checked={checkedStudentIds.includes(student.id)}
                        onChange={() => handleCheckboxToggle(student.id)}
                      />
                    </td>
                    <td style={{ padding: '8px 12px', color: '#64748b' }}>{student.rollNo || 'N/A'}</td>
                    <td style={{ padding: '8px 12px', fontWeight: '600', color: '#0f172a' }}>{student.name}</td>
                    <td style={{ padding: '8px 12px', color: '#475569' }}>{student.fatherName || 'N/A'}</td>
                    <td style={{ padding: '8px 12px', color: '#059669', fontWeight: '500' }}>{student.parentPhone || 'Not Provided'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                    No students found in {selectedClass} ({selectedSection}).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Content Layout: Active Students Inside (Thumb OUT with Checkboxes) & Live Logs */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Active Students Table with Checkboxes & Bulk Thumb OUT */}
        <div style={{ flex: 2, minWidth: '450px', background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
               Students Currently Inside School ({insideStudents.length})
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select 
                value={bulkPickedBy} 
                onChange={(e) => setBulkPickedBy(e.target.value)} 
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#35587c' }}
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

        {/* Live SMS / WhatsApp Logs Panel */}
        <div style={{ flex: 1, minWidth: '320px', background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 14px 0', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
            📱 Live WhatsApp Gateway Log
          </h3>
          <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {smsLogs.length > 0 ? (
              smsLogs.map((log: any) => (
                <div key={log.id} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', borderLeft: '4px solid #2563eb', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748b' }}>
                    To: <b>{log.phone}</b> • {log.time}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>{log.message}</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: '30px 0' }}>
                No messages dispatched yet today.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};