import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../supabaseClient';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  section: string;
  parentPhone: string;
  inTime?: string;
  outTime?: string;
  pickedBy?: string;
  status: 'In School' | 'Left School';
  created_at?: string; 
}

interface AttendanceState {
  records: AttendanceRecord[];
  smsLogs: { id: string; message: string; time: string; phone: string; created_at: string }[]; // 💡 SMS logs mein date add ki
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AttendanceState = {
  records: [],
  smsLogs: [],
  status: 'idle'
};

// 1. Database se records fetch karne ke liye
export const fetchAttendanceFromSupabase = createAsyncThunk(
  'attendance/fetchAttendance',
  async () => {
    const { data, error } = await supabase.from('attendance_records').select('*');
    if (error) throw error;

    return data.map((r: any) => ({
      id: r.id.toString(),
      studentId: r.studentId,
      studentName: r.studentName,
      studentClass: r.studentClass,
      section: r.section,
      parentPhone: r.parentPhone,
      inTime: r.inTime,
      outTime: r.outTime,
      pickedBy: r.pickedBy,
      status: r.status,
      created_at: r.created_at || r.inTime // Fallback date
    })) as AttendanceRecord[];
  }
);

// 2. Thumb IN par database mein entry save karne ke liye
export const addThumbInToSupabase = createAsyncThunk(
  'attendance/addThumbIn',
  async (payload: { studentId: string; studentName: string; studentClass: string; section: string; parentPhone: string; inTime: string }) => {
    const todayISO = new Date().toISOString(); // 💡 Current exact date & time (e.g. 2026-09-17T...)
    
    const { data, error } = await supabase
      .from('attendance_records')
      .insert([
        {
          studentId: payload.studentId,
          studentName: payload.studentName,
          studentClass: payload.studentClass,
          section: payload.section,
          parentPhone: payload.parentPhone,
          inTime: payload.inTime,
          status: 'In School',
          created_at: todayISO // 💡 Supabase mein date save hogi
        }
      ])
      .select();

    if (error) throw error;
    const inserted = data && data[0] ? data[0] : null;
    if (!inserted) throw new Error("Failed to insert attendance record");

    return {
      id: inserted.id.toString(),
      studentId: inserted.studentId,
      studentName: inserted.studentName,
      studentClass: inserted.studentClass,
      section: inserted.section,
      parentPhone: inserted.parentPhone,
      inTime: inserted.inTime,
      status: inserted.status,
      created_at: inserted.created_at || todayISO
    } as AttendanceRecord;
  }
);

// 3. Thumb OUT par database record update karne ke liye
export const updateThumbOutInSupabase = createAsyncThunk(
  'attendance/updateThumbOut',
  async (payload: { recordId: string; outTime: string; pickedBy: string }) => {
    const { data, error } = await supabase
      .from('attendance_records')
      .update({
        outTime: payload.outTime,
        pickedBy: payload.pickedBy,
        status: 'Left School'
      })
      .eq('id', Number(payload.recordId))
      .select();

    if (error) throw error;
    const updated = data && data[0] ? data[0] : null;
    if (!updated) throw new Error("No record found to update in database");

    return {
      id: updated.id.toString(),
      outTime: updated.outTime,
      pickedBy: updated.pickedBy,
      status: updated.status
    };
  }
);
export const addSmsLogToSupabase = createAsyncThunk(
  'attendance/addSmsLogToSupabase',
  async ({ phone, message, time }: { phone: string; message: string; time: string }) => {
    const todayISO = new Date().toISOString();
    const { data, error } = await supabase
      .from('sms_logs') // Apni Supabase table ka naam yahan confirm kar lein
      .insert([{ phone, message, time, created_at: todayISO }])
      .select();
    
    if (error) throw error;
    const inserted = data && data[0] ? data[0] : null;
    if (!inserted) throw new Error("Failed to insert SMS log");

    return {
      id: inserted.id.toString(),
      phone: inserted.phone,
      message: inserted.message,
      time: inserted.time,
      created_at: inserted.created_at || todayISO
    };
  }
);


export const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    addSmsLog: (state, action: PayloadAction<{ phone: string; message: string; time: string }>) => {
      const todayDateStr = new Date().toISOString(); // 💡 SMS log ke sath aaj ki date save ho rahi hai
      state.smsLogs.unshift({
        id: Date.now().toString(),
        ...action.payload,
        created_at: todayDateStr
      });
    }
  },
 extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceFromSupabase.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.records = action.payload;
      })
      .addCase(addThumbInToSupabase.fulfilled, (state, action) => {
        state.records.unshift(action.payload);
      })
      .addCase(updateThumbOutInSupabase.fulfilled, (state, action) => {
        const index = state.records.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.records[index].outTime = action.payload.outTime;
          state.records[index].pickedBy = action.payload.pickedBy;
          state.records[index].status = action.payload.status;
        }
      })
      .addCase(addSmsLogToSupabase.fulfilled, (state, action) => {
        state.smsLogs.unshift({
          id: action.payload.id,
          phone: action.payload.phone,
          message: action.payload.message,
          time: action.payload.time,
          created_at: action.payload.created_at
        });
      });
  }
}); // <-- Yeh bracket slice ko close kar raha hai

export const { addSmsLog } = attendanceSlice.actions;
export default attendanceSlice.reducer;