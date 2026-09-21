import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchPeriodAttendanceFromSupabase, savePeriodAttendanceToSupabase } from './periodAttendanceSlice';
import { DailyAttendanceTab } from './DailyAttendanceTab';
import { MonthlyReportTab } from './MonthlyReportTab';

interface PeriodAttendancePanelProps {
  onBack?: () => void; // onBack ko optional (?) bana diya taake error na aaye
}

export const PeriodAttendancePanel: React.FC<PeriodAttendancePanelProps> = ({ onBack }) => {
  const dispatch = useAppDispatch();
  
  // URL check karna ke aya yeh link ke zariye khula hai ya nahi
  const queryParams = new URLSearchParams(window.location.search);
  const currentView = queryParams.get('view');
  const isLinkedView = currentView === 'period-attendance';

  // Redux Data Hooks with safe fallbacks
  const students = useAppSelector((state: any) => state.students?.students || []);
  const attendanceRecords = useAppSelector((state: any) => state.periodAttendance?.periodRecords || []);

  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');

  const CLASSES_LIST = ["Montessori", "Nursery", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
  const SECTIONS_LIST = ["A", "B", "C"] as const;
  const PERIODS_LIST = ["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6", "Period 7"];

  // Daily Tab States
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState(CLASSES_LIST[0]);
  const [selectedSection, setSelectedSection] = useState<'A' | 'B' | 'C'>('A');
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS_LIST[0]);
  const [teacherNameInput, setTeacherNameInput] = useState('');
  const [periodTopicDetail, setPeriodTopicDetail] = useState('');
  const [classAttendance, setClassAttendance] = useState<Record<string, string>>({});

  // Monthly Tab States
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [monthlyClass, setMonthlyClass] = useState(CLASSES_LIST[0]);
  const [monthlySection, setMonthlySection] = useState<'A' | 'B' | 'C'>('A');

  useEffect(() => {
    dispatch(fetchPeriodAttendanceFromSupabase() as any);
  }, [dispatch]);

  // Safe student filters (supporting both studentClass and class keys)
  const filteredStudents = students.filter((s: any) => {
    const sClass = s.studentClass || s.class || '';
    const sSec = s.section || '';
    return sClass.trim().toLowerCase() === selectedClass.trim().toLowerCase() && 
           sSec.trim().toUpperCase() === selectedSection.trim().toUpperCase();
  });

  const monthlyFilteredStudents = students.filter((s: any) => {
    const sClass = s.studentClass || s.class || '';
    const sSec = s.section || '';
    return sClass.trim().toLowerCase() === monthlyClass.trim().toLowerCase() && 
           sSec.trim().toUpperCase() === monthlySection.trim().toUpperCase();
  });

  const relevantRecords = attendanceRecords.filter((rec: any) => {
    return rec.className === monthlyClass && 
           rec.section === monthlySection && 
           rec.date?.startsWith(selectedMonth);
  });

  const handleStatusChange = (studentId: string, status: string) => {
    setClassAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveToSupabase = async () => {
    const attendanceData = filteredStudents.map((student: any) => ({
      rollNo: student.rollNo || 'N/A',
      name: student.name,
      status: classAttendance[student.id] || 'Present',
    }));

    try {
      await dispatch(savePeriodAttendanceToSupabase({
        date: attendanceDate,
        className: selectedClass,
        section: selectedSection,
        period: selectedPeriod,
        topicDetail: periodTopicDetail,
        teacherName: teacherNameInput,
        attendanceData
      })).unwrap();

      alert(`Successfully saved ${selectedPeriod} attendance & topic to Supabase!`);
      dispatch(fetchPeriodAttendanceFromSupabase() as any);
    } catch (error: any) {
      alert('Save karne mein error aa gaya: ' + error);
    }
  };

  return (
    <div style={{ background: '#51754d', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%', boxSizing: 'border-box' }}>
      {/* Header & Back Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(18px, 4vw, 22px)', margin: '0 0 5px 0' }}>Classroom Period-Wise Attendance & Monthly Records</h2>
          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
            Tablet & Laptop friendly interface for teachers & admin.
          </p>
        </div>

        {/* Condition: Agar link ke zariye khula hai toh button nahi dikhega, warna dikhega */}
        {!isLinkedView && onBack && (
          <button 
            onClick={onBack}
            style={{ background: '#64748b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
          >
            ⬅️ Back to Dashboard
          </button>
        )}
      </div>

      {/* Tabs Navigation Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('daily')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'daily' ? '#144679' : '#e2e8f0',
            color: activeTab === 'daily' ? '#fff' : '#334155',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Daily Attendance & Topic
        </button>

        <button
          onClick={() => setActiveTab('monthly')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'monthly' ? '#144679' : '#e2e8f0',
            color: activeTab === 'monthly' ? '#fff' : '#334155',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Monthly Attendance Report
        </button>
      </div>

      {/* Conditional Rendering of Tabs */}
      {activeTab === 'daily' ? (
        <DailyAttendanceTab
          CLASSES_LIST={CLASSES_LIST}
          SECTIONS_LIST={SECTIONS_LIST}
          PERIODS_LIST={PERIODS_LIST}
          attendanceDate={attendanceDate}
          setAttendanceDate={setAttendanceDate}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          teacherNameInput={teacherNameInput}
          setTeacherNameInput={setTeacherNameInput}
          periodTopicDetail={periodTopicDetail}
          setPeriodTopicDetail={setPeriodTopicDetail}
          filteredStudents={filteredStudents}
          classAttendance={classAttendance}
          handleStatusChange={handleStatusChange}
          handleSaveToSupabase={handleSaveToSupabase}
          attendanceRecords={attendanceRecords}
        />
      ) : (
        <MonthlyReportTab
          CLASSES_LIST={CLASSES_LIST}
          SECTIONS_LIST={SECTIONS_LIST}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          monthlyClass={monthlyClass}
          setMonthlyClass={setMonthlyClass}
          monthlySection={monthlySection}
          setMonthlySection={setMonthlySection}
          relevantRecords={relevantRecords}
          monthlyFilteredStudents={monthlyFilteredStudents}
        />
      )}
    </div>
  );
};
export default PeriodAttendancePanel;