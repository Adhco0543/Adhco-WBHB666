'use client';

import { useState } from 'react';
import dayjs from 'dayjs';

interface CalendarTask {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  projectId: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [tasks] = useState<CalendarTask[]>([
    {
      id: '1',
      title: 'Complete site survey',
      dueDate: currentDate.format('YYYY-MM-DD'),
      status: 'pending',
      priority: 'high',
      projectId: 'p1',
    },
  ]);

  const daysInMonth = currentDate.daysInMonth();
  const firstDay = currentDate.startOf('month').day();
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getTasksForDate = (day: number | null) => {
    if (!day) return [];
    const dateStr = currentDate.date(day).format('YYYY-MM-DD');
    return tasks.filter((t) => t.dueDate === dateStr);
  };

  const priorityColors: Record<string, string> = {
    high: '#dc3545',
    medium: '#ffc107',
    low: '#28a745',
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>Calendar & Scheduling</h1>

      {/* Calendar header with navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <button
          onClick={() => setCurrentDate(currentDate.subtract(1, 'month'))}
          style={{
            padding: '8px 12px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ◀
        </button>

        <h2 style={{ margin: '0', fontSize: '20px' }}>{currentDate.format('MMMM YYYY')}</h2>

        <button
          onClick={() => setCurrentDate(currentDate.add(1, 'month'))}
          style={{
            padding: '8px 12px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ▶
        </button>
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          backgroundColor: '#ddd',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            style={{
              padding: '12px',
              textAlign: 'center',
              fontWeight: 'bold',
              backgroundColor: '#f5f5f5',
              fontSize: '14px',
            }}
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const dayTasks = getTasksForDate(day);
          return (
            <div
              key={index}
              style={{
                minHeight: '120px',
                padding: '8px',
                backgroundColor: day ? '#fff' : '#f9f9f9',
                borderTop: '1px solid #ddd',
              }}
            >
              {day && (
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                    {day}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        style={{
                          padding: '4px 6px',
                          backgroundColor: priorityColors[task.priority],
                          color: '#fff',
                          borderRadius: '3px',
                          fontSize: '11px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                        }}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Task list for selected date */}
      <div style={{ marginTop: '30px' }}>
        <h3>Tasks for {currentDate.format('MMMM D, YYYY')}</h3>
        {tasks.filter((t) => t.dueDate === currentDate.format('YYYY-MM-DD')).length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks
              .filter((t) => t.dueDate === currentDate.format('YYYY-MM-DD'))
              .map((task) => (
                <div
                  key={task.id}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f9f9f9',
                    border: `2px solid ${priorityColors[task.priority]}`,
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{task.title}</div>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        Priority: <span style={{ textTransform: 'capitalize' }}>{task.priority}</span>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#e3f2fd',
                        color: '#007bff',
                        borderRadius: '20px',
                        fontSize: '12px',
                      }}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p style={{ color: '#999' }}>No tasks scheduled for this date.</p>
        )}
      </div>
    </div>
  );
}
