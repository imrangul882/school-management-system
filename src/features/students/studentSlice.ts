import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../supabaseClient';

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  gender: 'Male' | 'Female';
  fatherName: string; 
  studentClass: string;
  section: "A" | "B" | "C";
  feeAmount: number;
  feeStatus: 'Pending' | 'Paid';
  parentPhone?: string;
  image?: string;
  isClosed?: boolean;
}

interface StudentState {
  students: Student[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: StudentState = {
  students: [],
  status: 'idle',
  error: null,
};

// 1. Fetch Students Thunk
export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async () => {
    const { data, error } = await supabase.from('students').select('*');
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.id.toString(),
      rollNo: item.roll_no,
      name: item.name,
      gender: item.gender,
      fatherName: item.father_name,
      studentClass: item.class,
      section: item.section,
      feeAmount: item.fee_amount,
      feeStatus: item.fee_status,
      parentPhone: item.parent_phone,
      image: item.image,
      isClosed: item.is_closed || false
    })) as Student[];
  }
);

// 2. Save Student Thunk
export const saveStudentToSupabase = createAsyncThunk(
  'students/saveStudent',
  async (student: Student) => {
    const { error } = await supabase.from('students').insert([
      {
        roll_no: student.rollNo,
        name: student.name,
        gender: student.gender,
        father_name: student.fatherName,
        class: student.studentClass,
        section: student.section,
        fee_amount: student.feeAmount,
        fee_status: student.feeStatus,
        parent_phone: student.parentPhone,
        image: student.image,
        is_closed: student.isClosed || false
      }
    ]);

    if (error) throw error;
    return student;
  }
);

export const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    updateFeeStatus: (state, action: PayloadAction<string>) => {
      const student = state.students.find(s => s.id === action.payload);
      if (student) student.feeStatus = 'Paid';
    },
    updateStudent: (state, action: PayloadAction<Student>) => {
      const index = state.students.findIndex(s => s.id === action.payload.id);
      if (index !== -1) state.students[index] = action.payload;
    },
    closeStudentRecord: (state, action: PayloadAction<string>) => {
      const student = state.students.find(s => s.id === action.payload || s.rollNo === action.payload);
      if (student) student.isClosed = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.students = action.payload;
      })
      .addCase(saveStudentToSupabase.fulfilled, (state, action) => {
        state.students.push(action.payload);
      });
  },
});

export const { updateFeeStatus, updateStudent, closeStudentRecord } = studentSlice.actions;
export default studentSlice.reducer;