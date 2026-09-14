import { useState } from "react";
import type { PaymentMethod } from "../types";



interface PaymentModalProps {
    studentName: string;
    amount: number;
    onClose: () => void;
    onSuccess: (method: PaymentMethod) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    studentName,amount, onClose, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod> ("JazzCash");

  const handlePayment = () => {
    alert (`Payment of Rs. ${amount} for ${studentName} successfully processed via ${selectedMethod}!`);
    onSuccess(selectedMethod);
    onClose();
  };
  return (
<div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>  
 <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '350px' }}>
<h3>Fee Payment Gateway</h3>
<p>Student: <b>{studentName}</b></p>
<p>Amount: <b>Rs. {amount}</b></p>

<label>Select Payment Method:</label>
<select
      value={selectedMethod} 
          onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
          style={{ width: '100%', padding: '8px', margin: '10px 0' }}>
            <option value="JazzCash">JazzCash Mobile Account</option>
          <option value="EasyPaisa">EasyPaisa Mobile Account</option>
          <option value="BankTransfer">Direct Bank Transfer</option>
        </select>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
          <button onClick={handlePayment} style={{ background: 'green', color: 'white', padding: '8px 15px', border: 'none', cursor: 'pointer' }}>Pay Now</button>
          <button onClick={onClose} style={{ background: 'red', color: 'white', padding: '8px 15px', border: 'none', cursor: 'pointer' }}>Cancel</button>
        </div>

 </div>
</div>
);
};
