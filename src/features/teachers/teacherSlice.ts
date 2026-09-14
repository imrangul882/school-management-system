import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { supabase } from '../../supabaseClient';

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  phone: string;
  salary: number;
  salaryStatus?: 'Paid' | 'Pending';
  checkIn?: string;
  checkOut?: string;
  attendanceStatus: 'Present' | 'Absent' | 'Late' | 'Not Marked';
}

interface TeacherState {
  teachers: Teacher[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// 1. Supabase se teachers fetch karne ke liye Async Thunk
export const fetchTeachersFromSupabase = createAsyncThunk(
  'teachers/fetchTeachers',
  async () => {
    const { data, error } = await supabase.from('teachers').select('*');
    if (error) throw error;
    
    return data.map((t: any) => ({
      id: t.id.toString(),
      name: t.name,
      subject: t.subject,
      phone: t.phone || 'N/A',
      salary: Number(t.salary) || 0,
      salaryStatus: t.salaryStatus || 'Pending',
      checkIn: t.checkIn || '',
      checkOut: t.checkOut || '',
      attendanceStatus: t.attendanceStatus || 'Not Marked'
    })) as Teacher[];
  }
);

// 2. Supabase mein naya teacher add karne ke liye Async Thunk
export const addTeacherToSupabase = createAsyncThunk(
  'teachers/addTeacher',
  async (newTeacher: Omit<Teacher, 'id'>) => {
    const { data, error } = await supabase
      .from('teachers')
      .insert([
        {
          name: newTeacher.name,
          subject: newTeacher.subject,
          salary: newTeacher.salary,
          phone: newTeacher.phone,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id.toString(),
      name: data.name,
      subject: data.subject,
      phone: data.phone || 'N/A',
      salary: Number(data.salary) || 0,
      salaryStatus: 'Pending',
      checkIn: '',
      checkOut: '',
      attendanceStatus: 'Not Marked'
    } as Teacher;
  }
);

// 3. Thumb In ko Supabase mein save karne ke liye Async Thunk
export const markThumbInSupabase = createAsyncThunk(
  'teachers/markThumbIn',
  async (teacherId: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    
    const { error } = await supabase
      .from('teachers')
      .update({ checkIn: timeNow, attendanceStatus: 'Present' })
      .eq('id', teacherId);

    if (error) throw error;
    return { id: teacherId, checkIn: timeNow };
  }
);

// 4. Thumb Out ko Supabase mein save karne ke liye Async Thunk
export const markThumbOutSupabase = createAsyncThunk(
  'teachers/markThumbOut',
  async (teacherId: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    
    const { error } = await supabase
      .from('teachers')
      .update({ checkOut: timeNow })
      .eq('id', teacherId);

    if (error) throw error;
    return { id: teacherId, checkOut: timeNow };
  }
);

// 5. Supabase se teacher ko delete karne ke liye Async Thunk (New Added)
export const deleteTeacherFromSupabase = createAsyncThunk(
  'teachers/deleteTeacher',
  async (teacherId: string) => {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', teacherId);

    if (error) throw error;
    return teacherId;
  }
);

const initialState: TeacherState = {
  teachers: [],
  status: 'idle',
  error: null,
};

export const teacherSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    updateTeacher: (state, action: PayloadAction<Teacher>) => {
      const updatedTeacher = action.payload;
      const index = state.teachers.findIndex((t) => t.id === updatedTeacher.id);
      if (index !== -1) {
        state.teachers[index] = updatedTeacher;
      }
    },
    updateSalaryStatus: (state, action: PayloadAction<string>) => {
      const teacher = state.teachers.find(t => t.id === action.payload);
      if (teacher) {
        teacher.salaryStatus = teacher.salaryStatus === 'Paid' ? 'Pending' : 'Paid';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachersFromSupabase.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTeachersFromSupabase.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.teachers = action.payload;
      })
      .addCase(fetchTeachersFromSupabase.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch';
      })
      .addCase(addTeacherToSupabase.fulfilled, (state, action) => {
        state.teachers.push(action.payload);
      })
      .addCase(markThumbInSupabase.fulfilled, (state, action) => {
        const teacher = state.teachers.find(t => t.id === action.payload.id);
        if (teacher) {
          teacher.checkIn = action.payload.checkIn;
          teacher.attendanceStatus = 'Present';
        }
      })
      .addCase(markThumbOutSupabase.fulfilled, (state, action) => {
        const teacher = state.teachers.find(t => t.id === action.payload.id);
        if (teacher) {
          teacher.checkOut = action.payload.checkOut;
        }
      })
      // Delete Teacher case added here
      .addCase(deleteTeacherFromSupabase.fulfilled, (state, action) => {
        state.teachers = state.teachers.filter(t => t.id !== action.payload);
      });
  },
});

export const { updateTeacher, updateSalaryStatus } = teacherSlice.actions;
export default teacherSlice.reducer;