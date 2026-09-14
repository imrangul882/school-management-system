import { useSelector } from 'react-redux';
import {type RootState } from '../../app/store';
const StaffExpenseSummary = () => {
  // Staff list aur salaries ka data fetch karna
  const staffList = useSelector((state: RootState) => state.staff.staffList);
  
  // Total salaries ka sum
  const staffSalaries = staffList.reduce((total:any, member:any) => total + member.salary, 0);

  return (
    <div className="p-4 bg-navy-900 rounded-lg text-white">
      <h3 className="text-lg font-bold mb-3">Staff Expense Overview</h3>
      <p>Total Staff Members: {staffList.length}</p>
      <p>Staff Salaries (Guards/Sweepers/Ayaz): Rs. {staffSalaries}</p>
      <hr className="my-2 border-gray-700" />
      <h2 className="text-xl font-extrabold text-red-400">Total Staff Expense: Rs. {staffSalaries}</h2> 
    </div>
  );
};

export default StaffExpenseSummary;