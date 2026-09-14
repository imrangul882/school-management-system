import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../supabaseClient';

export interface PeriodAttendanceRecord {
  id?: number;
  rollNo: string;
  studentName: string;
  teacherName?: string;
  date: string;
  className: string;
  section: string;
  period: string;
  topicDetail?: string;
  
  
  
  status: string;
}

interface PeriodAttendanceState {
  periodRecords: PeriodAttendanceRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: PeriodAttendanceState = {
  periodRecords: [],
  loading: false,
  error: null,
};

// 1. Fetch data and map lowercase DB columns to camelCase for frontend/Redux
export const fetchPeriodAttendanceFromSupabase = createAsyncThunk(
  'periodAttendance/fetchFromSupabase',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('period_attendance')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      // Map lowercase database columns to interface camelCase properties
      const mappedData: PeriodAttendanceRecord[] = (data || []).map((item: any) => ({
        id: item.id,
        date: item.date,
        className: item.classname,
        section: item.section,
        period: item.period,
        topicDetail: item.topicdetail,
        teacherName: item.teachername,
        rollNo: item.rollno,
        studentName: item.studentname,
        status: item.status,
      }));

      return mappedData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. Save data to Supabase using lowercase column names
export const savePeriodAttendanceToSupabase = createAsyncThunk(
  'periodAttendance/saveToSupabase',
  async (payload: {
    date: string;
    className: string;
    section: string;
    period: string;
    topicDetail?: string;
    teacherName?: string;
    attendanceData: Array<{ rollNo: string; name: string; status: string }>;
  }, { rejectWithValue }) => {
    try {
      const rowsToInsert = payload.attendanceData.map(student => ({
        date: payload.date,
        classname: payload.className,
        section: payload.section,
        period: payload.period,
        topicdetail: payload.topicDetail || '',
        teachername: payload.teacherName || '',
        rollno: student.rollNo,
        studentname: student.name,
        status: student.status,
      }));

      const { error } = await supabase
        .from('period_attendance')
        .insert(rowsToInsert)
        .select();

      if (error) throw error;

      // Return camelCase mapped objects for Redux state compatibility
      const savedRecordsForState: PeriodAttendanceRecord[] = rowsToInsert.map(row => ({
        date: row.date,
        className: row.classname,
        section: row.section,
        period: row.period,
        topicDetail: row.topicdetail,
        teacherName: row.teachername,
        rollNo: row.rollno,
        studentName: row.studentname,
        status: row.status,
      }));

      return savedRecordsForState;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const periodAttendanceSlice = createSlice({
  name: 'periodAttendance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPeriodAttendanceFromSupabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPeriodAttendanceFromSupabase.fulfilled, (state, action) => {
        state.loading = false;
        state.periodRecords = action.payload;
      })
      .addCase(fetchPeriodAttendanceFromSupabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(savePeriodAttendanceToSupabase.fulfilled, (state, action) => {
        state.periodRecords = [...action.payload, ...state.periodRecords];
      });
  },
});

export default periodAttendanceSlice.reducer;