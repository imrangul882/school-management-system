import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../supabaseClient';

export interface AttendanceRecord {
  status: 'Present' | 'Absent' | 'Leave' | '';
  inTime?: string;
  outTime?: string;
  thumbStatus?: 'In' | 'Out';
  isManual?: boolean;
  reason?: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  salary: number;
  phone: string;
  thumbStatus?: 'In' | 'Out';
  inTime?: string;
  outTime?: string;
  isManual?: boolean;
  reason?: string;
  attendanceLogs?: Record<string, AttendanceRecord>;
}

interface TeacherAttendanceState {
  teachersList: Teacher[];
  records: any[];
  selectedMonth: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  loading: boolean;
  error: string | null;
}

const initialState: TeacherAttendanceState = {
  teachersList: [],
  records: [],
  selectedMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
  status: 'idle',
  loading: false,
  error: null,
};

// 1. Fetch Teachers & Attendance from Supabase
export const fetchTeachersFromSupabase = createAsyncThunk(
  'teacherAttendance/fetchTeachers',
  async (monthYear: string) => {
    const { data: teachersData, error: tError } = await supabase.from('teachers').select('*');
    if (tError) throw tError;

    const { data: attData, error: aError } = await supabase
      .from('teacher_attendance')
      .select('*')
      .eq('month_year', monthYear);
    if (aError) throw aError;

    return teachersData.map((t: any) => {
      const logs: Record<string, AttendanceRecord> = {};
      const tAtts = attData.filter((a: any) => String(a.teacher_id) === String(t.id));      
      tAtts.forEach((a: any) => {
        logs[a.date] = {
          status: a.status,
          inTime: a.inTime || '',
          outTime: a.outTime || '',
          thumbStatus: a.thumb_status || 'Out',
          isManual: a.is_manual || false,
          reason: a.reason || '',
        };
      });

      return {
        id: t.id.toString(),
        name: t.name,
        subject: t.subject,
        salary: Number(t.salary),
        phone: t.phone || '',
        thumbStatus: 'Out',
        attendanceLogs: logs,
      };
    }) as Teacher[];
  }
);

// 2. Add New Teacher to Supabase
export const addTeacherToSupabase = createAsyncThunk(
  'teacherAttendance/addTeacher',
  async (newTeacher: Omit<Teacher, 'id'>) => {
    const { data, error } = await supabase.from('teachers').insert([
      {
        name: newTeacher.name,
        subject: newTeacher.subject,
        salary: newTeacher.salary,
        phone: newTeacher.phone,
      }
    ]).select().single();

    if (error) throw error;

    return {
      id: data.id.toString(),
      name: data.name,
      subject: data.subject,
      salary: Number(data.salary),
      phone: data.phone || '',
      attendanceLogs: {},
    } as Teacher;
  }
);

// 3. Save/Update Attendance & Thumb In/Out to Supabase
export const saveTeacherAttendanceToSupabase = createAsyncThunk(
  'teacherAttendance/saveAttendance',
  async ({ teacherId, date, monthYear, record }: { teacherId: string; date: string; monthYear: string; record: AttendanceRecord }, thunkAPI) => {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('teacher_attendance')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('date', date)
        .maybeSingle();

      if (fetchError) throw new Error(fetchError.message);

      const finalInTime = record.inTime && record.inTime.trim() !== '' 
        ? record.inTime 
        : (existing?.inTime || null);

      const finalOutTime = record.outTime && record.outTime.trim() !== '' 
        ? record.outTime 
        : (existing?.outTime || null);

      // Exact matching with Supabase columns: inTime, outTime, thumb_status, is_manual
      const payload = {
        teacher_id: teacherId,
        date,
        month_year: monthYear,
        status: record.status,
        inTime: finalInTime,
        outTime: finalOutTime,
        thumb_status: record.thumbStatus || existing?.thumb_status || 'Out',
        is_manual: record.isManual ?? existing?.is_manual ?? false,
        reason: record.reason || existing?.reason || '',
      };

      const mergedRecord: AttendanceRecord = {
        ...record,
        inTime: finalInTime || '',
        outTime: finalOutTime || '',
      };

      if (existing) {
        const { error } = await supabase
          .from('teacher_attendance')
          .update(payload)
          .eq('id', existing.id);

        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from('teacher_attendance')
          .insert([payload]);

        if (error) throw new Error(error.message);
      }

      return { teacherId, date, record: mergedRecord };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// 4. Delete Attendance from Supabase
export const deleteTeacherAttendanceFromSupabase = createAsyncThunk(
  'teacherAttendance/deleteAttendance',
  async ({ teacherId, date }: { teacherId: string; date: string }, thunkAPI) => {
    try {
      const { error } = await supabase
        .from('teacher_attendance')
        .delete()
        .eq('teacher_id', teacherId)
        .eq('date', date);

      if (error) throw new Error(error.message);
      return { teacherId, date };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// 5. Fetch Attendance for Month
export const fetchTeacherAttendanceForMonth = createAsyncThunk(
  'teacherAttendance/fetchAttendanceForMonth',
  async ({ teacherId, monthYear }: { teacherId: string; monthYear: string }) => {
    const { data: attData, error } = await supabase
      .from('teacher_attendance')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('month_year', monthYear);

    if (error) throw error;
    return { teacherId, attData };
  }
);

export const teacherAttendanceSlice = createSlice({
  name: 'teacherAttendance',
  initialState,
  reducers: {
    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },
    saveTeacherMonthlyRecord: (state, action: PayloadAction<any>) => {
      const index = state.records.findIndex(r => r.month === action.payload.month);
      if (index >= 0) {
        state.records[index] = action.payload;
      } else {
        state.records.push(action.payload);
      }
    },
    toggleTeacherThumb: (state, action: PayloadAction<{ teacherId: string; date: string }>) => {
      const { teacherId, date } = action.payload;
      const teacher = state.teachersList.find(t => t.id === teacherId);
      if (teacher) {
        if (!teacher.attendanceLogs) teacher.attendanceLogs = {};
        const currentLog = teacher.attendanceLogs[date] || { status: 'Present', thumbStatus: 'Out' };
        
        const nextThumb = currentLog.thumbStatus === 'In' ? 'Out' : 'In';
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        
        teacher.attendanceLogs[date] = {
          ...currentLog,
          status: 'Present',
          thumbStatus: nextThumb,
          inTime: nextThumb === 'In' ? currentTime : currentLog.inTime,
          outTime: nextThumb === 'Out' ? currentTime : currentLog.outTime,
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachersFromSupabase.fulfilled, (state, action) => {
        state.teachersList = action.payload;
        state.status = 'succeeded';
      })
      .addCase(addTeacherToSupabase.fulfilled, (state, action) => {
        state.teachersList.push(action.payload);
      })
      .addCase(saveTeacherAttendanceToSupabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveTeacherAttendanceToSupabase.fulfilled, (state, action) => {
        state.loading = false;
        const { teacherId, date, record } = action.payload;
        const teacher = state.teachersList.find(t => t.id === teacherId);
        if (teacher) {
          if (!teacher.attendanceLogs) teacher.attendanceLogs = {};
          teacher.attendanceLogs[date] = record;
        }
      })
      .addCase(saveTeacherAttendanceToSupabase.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || 'Failed to save attendance';
      })
      .addCase(deleteTeacherAttendanceFromSupabase.fulfilled, (state, action) => {
        const { teacherId, date } = action.payload;
        const teacher = state.teachersList.find(t => t.id === teacherId);
        if (teacher && teacher.attendanceLogs) {
          delete teacher.attendanceLogs[date];
        }
      })
      .addCase(fetchTeacherAttendanceForMonth.fulfilled, (state, action) => {
        const { teacherId, attData } = action.payload;
        const teacher = state.teachersList.find(t => t.id === teacherId);
        if (teacher) {
          if (!teacher.attendanceLogs) teacher.attendanceLogs = {};
          attData.forEach((a: any) => {
            teacher.attendanceLogs![a.date] = {
              status: a.status,
              inTime: a.inTime || '',
              outTime: a.outTime || '',
              thumbStatus: a.thumb_status || 'Out',
              isManual: a.is_manual || false,
              reason: a.reason || '',
            };
          });
        }
      });
  },
});

export const { setSelectedMonth, saveTeacherMonthlyRecord, toggleTeacherThumb } = teacherAttendanceSlice.actions;
export default teacherAttendanceSlice.reducer;