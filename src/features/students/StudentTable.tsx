import React from 'react';
import type { Student } from "./studentSlice";

interface StudentTableProps {
    filteredStudents: Student[];
    onPayFee: (student: Student) => void;
    onEditStudent: (student: Student) => void;
    onCloseRecord: (id: string) => void;
}

export const StudentTable : React.FC<StudentTableProps> = ({
 filteredStudents,
 onPayFee,
 onEditStudent,
 onCloseRecord,
}) => {

    return(
        <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'white' }}>
            <thead>
        <tr style={{ background: '#f0f0f0' }}>
          <th style={{ width: '50px', textAlign: 'center' }}>Pic</th>
          <th>Roll No</th>
          <th>Student Name & Father Name</th>
          <th>Class</th>
          <th>Section</th>
          <th>Fee Amount</th>
          <th>Status</th>
          <th>Actions (Admin)</th>
        </tr>
      </thead>
      <tbody>
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <tr key={student.id} style={{ opacity: student.isClosed ? 0.6 : 1 }}>
              {/* Naya Picture Column */}
              <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                {student.image ? (
                  <img 
                    src={student.image} 
                    alt={student.name} 
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }} 
                  />
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b', margin: '0 auto', fontWeight: 'bold' }}>
                    N/A
                  </div>
                )}
              </td>

              <td style={{ fontWeight: 'bold', color: '#0288d1' }}>
                {student.rollNo || 'N/A'} {student.isClosed && <span style={{ color: 'red', fontSize: '10px' }}>(Closed)</span>}
              </td>
              <td>
                <div style={{ fontWeight: 'bold' }}>{student.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {student.gender === 'Female' ? 'D/O: ' : 'S/O: '} {student.fatherName || 'N/A'}
                </div>
              </td>
              <td>{student.studentClass}</td>
              <td>
                <span style={{ background: '#334155', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                  {student.section || 'A'}
                </span>
              </td>
              <td>Rs. {student.feeAmount}</td>
              <td style={{ color: student.feeStatus === 'Paid' ? 'green' : 'red', fontWeight: 'bold' }}>
                {student.feeStatus}
              </td>

              <td style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {student.feeStatus === 'Pending' ? (
                  <button
                    onClick={() => onPayFee(student)}
                    style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                  >
                    Pay Fee
                  </button>
                ) : (
                  <span style={{ color: '#2e7d32', fontSize: '13px', fontWeight: 'bold' }}>Paid</span>
                )}

                <button
                  onClick={() => onEditStudent(student)}
                  style={{ background: '#ff9800', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                >
                  Edit Info
                </button>

                <button
                  onClick={() => onCloseRecord(student.id)}
                  style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                >
                  Close
                </button>
                </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
              No students found.
            </td>
          </tr>
        )}
      </tbody>
        </table>
    );
};