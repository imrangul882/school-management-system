import React from 'react';

interface Props {
  classesList: string[];
  sectionsList: string[];
  selectedClass: string;
  selectedSection: string;
  onSelectClass: (cls: string) => void;
  onSelectSection: (sec: string) => void;
  students: any[];
}

export const ClassSectionFilters: React.FC<Props> = ({
  classesList,
  sectionsList,
  selectedClass,
  selectedSection,
  onSelectClass,
  onSelectSection,
  students,
}) => {
  return (
    <>
      {/* Class Selection Buttons Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
        {classesList.map((cls) => {
          const count = students.filter((s: any) => s.studentClass === cls).length;
          return (
            <button
              key={cls}
              onClick={() => onSelectClass(cls)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: selectedClass === cls ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: selectedClass === cls ? '#eff6ff' : '#ffffff',
                color: selectedClass === cls ? '#1d4ed8' : '#334155',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
              }}
            >
              {cls} ({count})
            </button>
          );
        })}
      </div>

      {/* Section Filter Bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Sections:</span>
        {sectionsList.map((sec) => (
          <button
            key={sec}
            onClick={() => onSelectSection(sec)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: selectedSection === sec ? '#334155' : '#e2e8f0',
              color: selectedSection === sec ? '#ffffff' : '#475569',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            {sec}
          </button>
        ))}
      </div>
    </>
  );
};