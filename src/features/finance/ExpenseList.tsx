import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchExpensesFromSupabase, addExpenseToSupabase, deleteExpenseFromSupabase,  deleteExpenseLocal } from './financeSlice';

export const ExpenseList: React.FC = () => {
  const dispatch = useAppDispatch();
  const expenses = useAppSelector((state: any) => state.finance?.expenses || []);
  const status = useAppSelector((state: any) => state.finance?.status);
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchExpensesFromSupabase());
    }
  }, [status, dispatch]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const newExp = {
      id: "E" + Date.now(),
      title,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0]
    };

    // 1. Local state mein foran add karein (UI instant update ke liye)
    // dispatch(addExpenseLocal(newExp));

    // 2. Supabase database mein bhi save karein
    dispatch(addExpenseToSupabase({
      title: newExp.title,
      amount: newExp.amount,
      date: newExp.date
    }));

    setTitle('');
    setAmount('');
  };

  const handleDelete = (id: string, expenseTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${expenseTitle}" expense?`)) {
      // 1. Local state se foran remove karein
      dispatch(deleteExpenseLocal(id));

      // 2. Supabase database se bhi delete karein
      dispatch(deleteExpenseFromSupabase(id));
    }
  };

  return (
    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', color: '#f8fafc', marginTop: '30px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Form Container */}
      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #334155', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 14px 0', color: '#f8fafc', fontSize: '18px', fontWeight: '600' }}>
          ➕ Add School Expense
        </h3>
        <form onSubmit={handleAddExpense} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Expense Title (e.g. Electricity Bill)" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            style={{ padding: '10px 12px', width: '280px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
          />
          <input 
            type="number" 
            placeholder="Amount (Rs)" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            required 
            style={{ padding: '10px 12px', width: '160px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none' }}
          />
          <button 
            type="submit" 
            style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '6px', fontWeight: '600', fontSize: '14px' }}
          >
            Add Expense
          </button>
        </form>
      </div>

      {/* Expense List Table Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '20px', fontWeight: '700' }}>
          📊 School Expenses & Bills
        </h2>
        <span style={{ fontSize: '14px', color: '#94a3b8' }}>
          Total Records: <b>{expenses.length}</b>
        </span>
      </div>

      {/* Table Container */}
      <div style={{ background: '#1e293b', borderRadius: '10px', border: '1px solid #334155', overflowX: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#0f172a', color: '#94a3b8', borderBottom: '2px solid #334155' }}>
              <th style={{ padding: '12px 16px' }}>Title</th>
              <th style={{ padding: '12px 16px' }}>Amount</th>
              <th style={{ padding: '12px 16px' }}>Date</th>
              <th style={{ padding: '12px 16px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {status === 'loading' && expenses.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px', fontSize: '14px' }}>
                  Loading expenses from database...
                </td>
              </tr>
            ) : expenses.length > 0 ? (
              expenses.map((expense: any) => (
                <tr key={expense.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: '#f8fafc' }}>{expense.title}</td>
                  <td style={{ padding: '14px 16px', color: '#f87171', fontWeight: '700' }}>Rs. {expense.amount}</td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{expense.date}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <button 
                      onClick={() => handleDelete(expense.id, expense.title)}
                      style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: '600', fontSize: '12px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px', fontSize: '14px' }}>
                  No expenses added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};