export const calculateTeacherAttendanceSummary = (
  teacherId: string,
  selectedMonth: string,
  customHolidays: { date: string; reason: string }[],
  manualStatuses: Record<string, string>,
  attendanceRecords: any[]
) => {
  const [year, month] = selectedMonth.split('-').map(Number);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;
  const daysToCalculate = isCurrentMonth ? today.getDate() : new Date(year, month, 0).getDate();
  
  let officialHolidaysCount = 0;
  const holidayDetails: string[] = [];
  let presentCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  const presentDates: string[] = [];
  const absentDates: string[] = [];
  const leaveDates: string[] = [];
  const lateLogs: { date: string; minutes: number }[] = [];

  for (let day = 1; day <= daysToCalculate; day++) {
    const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, day);
    const customMatch = customHolidays.find(h => h.date === dateStr);
    const manualKey = `${teacherId}_${dateStr}`;
    const manualStatus = manualStatuses[manualKey];

    if (dateObj.getDay() === 0) { 
      officialHolidaysCount++;
      holidayDetails.push(`${dateStr} (Sunday)`);
    } else if (customMatch) { 
      officialHolidaysCount++;
      holidayDetails.push(`${dateStr} — ${customMatch.reason}`);
    } else {
      const teacherLogs = Array.isArray(attendanceRecords) 
        ? attendanceRecords.filter((r: any) => (r.teacherId === teacherId || r.name === teacherId) && r.date === dateStr)
        : [];
      
      const hasTimeIn = teacherLogs.length > 0;
      const isAbsentLog = teacherLogs.some((r: any) => r.status === 'Absent');

      if (manualStatus === 'Present') {
        presentCount++;
        presentDates.push(dateStr);
      } else if (manualStatus === 'Absent') {
        absentCount++;
        absentDates.push(dateStr);
      } else if (manualStatus === 'Leave') {
        leaveCount++;
        leaveDates.push(dateStr);
      } else {
        if (isAbsentLog) {
          absentCount++;
          absentDates.push(dateStr);
        } else if (hasTimeIn) {
          presentCount++;
          presentDates.push(dateStr);
        }
      }

      teacherLogs.forEach((r: any) => {
        if ((r.lateMinutes || 0) > 0) {
          lateLogs.push({ date: r.date, minutes: r.lateMinutes });
        }
      });
    }
  }

  const totalLateMins = lateLogs.reduce((acc: number, curr: any) => acc + curr.minutes, 0);

  return {
    daysToCalculate,
    officialHolidaysCount,
    holidayDetails,
    presentDates,
    absentDates,
    leaveDates,
    lateLogs,
    totalPresent: presentCount,
    totalAbsent: absentCount,
    totalLeave: leaveCount,
    totalLateMins
  };
};