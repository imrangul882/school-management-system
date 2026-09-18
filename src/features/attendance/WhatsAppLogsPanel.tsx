import React from 'react';

interface Props {
  smsLogs: any[];
}

export const WhatsAppLogsPanel: React.FC<Props> = ({ smsLogs }) => {
  // 1. Aaj ki date nikalna (Format: "2026-09-17")
  const todayDateString = new Date().toISOString().split('T')[0];

  // 2. Behtar filtering logic jo space aur 'T' dono ko handle karegi
  const todaySmsLogs = smsLogs.filter((log: any) => {
    // Agar created_at mojood hai
    if (log.created_at) {
      // Date ka sirf pehla hissa nikal lo (jaise "2026-09-17")
      const logDateOnly = log.created_at.split('T')[0].split(' ')[0];
      return logDateOnly === todayDateString;
    }
    return false;
  });

  return (
    <div style={{ flex: 1, minWidth: '320px', background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 14px 0', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
        📱 Live WhatsApp Gateway Log
      </h3>
      <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {todaySmsLogs.length > 0 ? (
          todaySmsLogs.map((log: any) => (
            <div key={log.id} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', borderLeft: '4px solid #2563eb', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748b' }}>
                To: <b>{log.phone}</b> • {log.time}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>{log.message}</p>
            </div>
          ))
        ) : (
          <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: '30px 0' }}>
            No messages dispatched yet today.
          </p>
        )}
      </div>
    </div>
  );
};