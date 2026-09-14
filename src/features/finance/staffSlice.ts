import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../supabaseClient';

export interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent' | 'Leave' | '';
  inTime?: string;
  outTime?: string;
  isManual?: boolean;
  reason?: string;
}

export interface CustomHoliday {
  id: string;
  date: string;
  occasion: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Guard' | 'Aya' | 'Sweeper' | 'Peon' | 'Driver' | 'Other';
  phone: string;
  salary: number;
  joiningDate: string;
  thumbStatus?: 'In' | 'Out';
  inTime?: string;
  outTime?: string;
  isManual?: boolean;
  reason?: string;
  attendanceLogs?: Record<string, AttendanceRecord>;
}

interface StaffState {
  staffList: StaffMember[];
  customHolidays: CustomHoliday[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: StaffState = {
  staffList: [],
  customHolidays: [],
  status: 'idle',
};

// 1. Supabase se Staff Fetch karne ke liye
export const fetchStaffFromSupabase = createAsyncThunk(
  'staff/fetchStaff',
  async () => {
    const { data, error } = await supabase.from('staff').select('*');
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      role: item.role,
      phone: item.phone || '',
      salary: Number(item.salary),
      joiningDate: item.joining_date,
      attendanceLogs: item.attendance_logs || {},
    })) as StaffMember[];
  }
);

// 2. Supabase mein Naya Staff add karne ke liye
export const addStaffToSupabase = createAsyncThunk(
  'staff/addStaff',
  async (newStaff: Omit<StaffMember, 'id'>) => {
    const { data, error } = await supabase.from('staff').insert([
      {
        name: newStaff.name,
        role: newStaff.role,
        phone: newStaff.phone,
        salary: newStaff.salary,
        joining_date: newStaff.joiningDate,
        attendance_logs: newStaff.attendanceLogs || {},
      }
    ]).select().single();

    if (error) throw error;

    return {
      id: data.id.toString(),
      name: data.name,
      role: data.role,
      phone: data.phone,
      salary: data.salary,
      joiningDate: data.joining_date,
      attendanceLogs: data.attendance_logs,
    } as StaffMember;
  }
);

// 3. Supabase se Staff Delete karne ke liye
export const removeStaffFromSupabase = createAsyncThunk(
  'staff/removeStaff',
  async (id: string) => {
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) throw error;
    return id;
  }
);

// 4. Supabase se Holidays Fetch karne ke liye (Naya add kiya gaya)
export const fetchHolidaysFromSupabase = createAsyncThunk(
  'staff/fetchHolidays',
  async () => {
    const { data, error } = await supabase.from('custom_holidays').select('*');
    if (error) throw error;
    return data.map((item: any) => ({
      id: item.id.toString(),
      date: item.date,
      occasion: item.occasion,
    })) as CustomHoliday[];
  }
);

// 5. Supabase mein Holiday Add karne ke liye (Naya add kiya gaya)
export const addHolidayToSupabase = createAsyncThunk(
  'staff/addHoliday',
  async (holiday: Omit<CustomHoliday, 'id'>) => {
    const { data, error } = await supabase.from('custom_holidays').insert([
      {
        date: holiday.date,
        occasion: holiday.occasion,
      }
    ]).select().single();

    if (error) throw error;
    return {
      id: data.id.toString(),
      date: data.date,
      occasion: data.occasion,
    } as CustomHoliday;
  }
);

// 6. Supabase se Holiday Delete karne ke liye (Naya add kiya gaya)
export const removeHolidayFromSupabase = createAsyncThunk(
  'staff/removeHoliday',
  async (id: string) => {
    const { error } = await supabase.from('custom_holidays').delete().eq('id', id);
    if (error) throw error;
    return id;
  }
);

export const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    addStaff: (state, action: PayloadAction<StaffMember>) => {
      state.staffList.push(action.payload);
    },
    removeStaff: (state, action: PayloadAction<string>) => {
      state.staffList = state.staffList.filter(s => s.id !== action.payload);
    },
    editStaff: (state, action: PayloadAction<StaffMember>) => {
      const index = state.staffList.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.staffList[index] = action.payload;
      }
    },
    toggleThumb: (state, action: PayloadAction<string>) => {
      const staff = state.staffList.find(s => s.id === action.payload);
      if (staff) {
        staff.thumbStatus = staff.thumbStatus === 'In' ? 'Out' : 'In';
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (staff.thumbStatus === 'In') staff.inTime = currentTime;
        if (staff.thumbStatus === 'Out') staff.outTime = currentTime;
      }
    },
    saveStaffAttendance: (
      state,
      action: PayloadAction<{ staffId: string; date: string; record: AttendanceRecord }>
    ) => {
      const staff = state.staffList.find(s => s.id === action.payload.staffId);
      if (staff) {
        if (!staff.attendanceLogs) {
          staff.attendanceLogs = {};
        }
        staff.attendanceLogs[action.payload.date] = action.payload.record;
      }
    },
    addStaffHoliday: (state, action: PayloadAction<CustomHoliday>) => {
      state.customHolidays.push(action.payload);
    },
    removeStaffHoliday: (state, action: PayloadAction<string>) => {
      state.customHolidays = state.customHolidays.filter(h => h.id !== action.payload);
    },
    updateStaffTime: (state, action: PayloadAction<{ id: string; inTime?: string; outTime?: string; isManual?: boolean; reason?: string }>) => {
      const staff = state.staffList.find(s => s.id === action.payload.id);
      if (staff) {
        if (action.payload.inTime !== undefined) staff.inTime = action.payload.inTime;
        if (action.payload.outTime !== undefined) staff.outTime = action.payload.outTime;
        if (action.payload.isManual !== undefined) staff.isManual = action.payload.isManual;
        if (action.payload.reason !== undefined) staff.reason = action.payload.reason;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Staff
      .addCase(fetchStaffFromSupabase.fulfilled, (state, action) => {
        state.staffList = action.payload;
        state.status = 'succeeded';
      })
      // Add Staff
      .addCase(addStaffToSupabase.fulfilled, (state, action) => {
        state.staffList.push(action.payload);
      })
      // Remove Staff
      .addCase(removeStaffFromSupabase.fulfilled, (state, action) => {
        state.staffList = state.staffList.filter(staff => staff.id !== action.payload);
      })
      // Fetch Holidays
      .addCase(fetchHolidaysFromSupabase.fulfilled, (state, action) => {
        state.customHolidays = action.payload;
      })
      // Add Holiday
      .addCase(addHolidayToSupabase.fulfilled, (state, action) => {
        state.customHolidays.push(action.payload);
      })
      // Remove Holiday
      .addCase(removeHolidayFromSupabase.fulfilled, (state, action) => {
        state.customHolidays = state.customHolidays.filter(h => h.id !== action.payload);
      });
  },
});

export const { 
  addStaff,
  removeStaff,
  editStaff, 
  saveStaffAttendance, 
  addStaffHoliday, 
  removeStaffHoliday, 
  toggleThumb, 
  updateStaffTime 
} = staffSlice.actions;

export default staffSlice.reducer;