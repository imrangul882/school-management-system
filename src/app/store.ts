import { configureStore } from '@reduxjs/toolkit';
import studentReducer from '../features/students/studentSlice';
import teacherReducer from '../features/teachers/teacherSlice';
import financeReducer from '../features/finance/financeSlice';
import attendanceReducer from '../components/AttendancePanel/attendanceSlice';
import periodAttendanceReducer from '../components/AttendancePanel/periodAttendanceSlice'; 
import teacherAttendanceReducer from '../features/attendance/teacherAttendanceSlice'; 
import staffReducer from '../features/finance/staffSlice';

const STORAGE_KEY = 'finland_school_state'; // Key ko aik jaisa kar diya

const loadFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (e) {
    console.error("Could not load state", e);
    return undefined;
  }
};

const saveToLocalStorage = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (e) {
    console.error("Could not save state", e);
  }
};

const preloadedState = loadFromLocalStorage();

export const store = configureStore({
  reducer: {
    students: studentReducer,
    teachers: teacherReducer,
    finance: financeReducer,
    periodAttendance: periodAttendanceReducer,
    attendance: attendanceReducer,
    teacherAttendance: teacherAttendanceReducer, 
    staff: staffReducer,
  },
  preloadedState,
} as any);

store.subscribe(() => {
  const currentState = store.getState();
  saveToLocalStorage({
    students: currentState.students,
    teachers: currentState.teachers,
    finance: currentState.finance,
    attendance: currentState.attendance,
    periodAttendance: currentState.periodAttendance,
    teacherAttendance: currentState.teacherAttendance, 
    staff: currentState.staff, // Yahan 'sataff' ko theek kar ke 'staff' kar diya hai
  });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;