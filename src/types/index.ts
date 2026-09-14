export type PaymentMethod = "JazzCash" | "EasyPaisa" | "BankTransfer";

export interface Student {
  id: string;
  name: string;
  studentClass: string;
  section: "A" | "B" | "C"; 
  feeAmount: number;
  feeStatus: "Paid" | "Pending";
  parentPhone?: string;
}

export interface Teacher {
    id: string;
    name: string;
    subject: string;
    salary: number;
    salaryStatus: "Paid" | "Pending";
}
export interface Expense {
    id: string;
    title: string;
    amount: number;
    date: string;
}


export interface PaymentTransaction {
    studentId: string;
    amount: number;
    method: PaymentMethod;
    timestamp: string;
}