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
}

interface AttendanceState {
  records: AttendanceRecord[];
  smsLogs: { id: string; message: string; time: string; phone: string }[];
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
      status: r.status
    })) as AttendanceRecord[];
  }
);

// 2. Thumb IN par database mein entry save karne ke liye
export const addThumbInToSupabase = createAsyncThunk(
  'attendance/addThumbIn',
  async (payload: { studentId: string; studentName: string; studentClass: string; section: string; parentPhone: string; inTime: string }) => {
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
          status: 'In School'
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
      status: inserted.status
    } as AttendanceRecord;
  }
);

// 3. Thumb OUT par database record update karne ke liye (Fixed with Number conversion)
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
      .eq('id', Number(payload.recordId)) // String ko number mein convert kiya taake bigint se match ho jaye
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

export const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    addSmsLog: (state, action: PayloadAction<{ phone: string; message: string; time: string }>) => {
      state.smsLogs.unshift({
        id: Date.now().toString(),
        ...action.payload
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
      });
  }
});

export const { addSmsLog } = attendanceSlice.actions;
export default attendanceSlice.reducer;