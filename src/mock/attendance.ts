export interface AttendanceRecord {
  id: string;
  clientId: string;
  clientName: string;
  membershipName: string;
  coachName: string;
  checkInTime: string; // e.g. "08:15"
  checkOutTime?: string; // e.g. "09:45"
  durationMins?: number; // total workout minutes
  status: 'present' | 'late' | 'absent';
  remarks?: string;
  createdBy: string;
  date: string; // e.g. "2026-07-18"
}

// Generate 100 realistic attendance records for the active list
function generateAttendanceLogs(): AttendanceRecord[] {
  const list: AttendanceRecord[] = [
    {
      id: 'ATT-901',
      clientId: 'CL-001',
      clientName: 'Sarah Jenkins',
      membershipName: 'Basic Monthly',
      coachName: 'Elena Rostova',
      checkInTime: '08:15',
      checkOutTime: '09:30',
      durationMins: 75,
      status: 'present',
      remarks: 'Cardio focus. Completed core routine.',
      createdBy: 'Front Desk: Danny',
      date: '2026-07-18'
    },
    {
      id: 'ATT-902',
      clientId: 'CL-002',
      clientName: 'David Vance',
      membershipName: 'Premium VIP Yearly',
      coachName: 'Marcus Sterling',
      checkInTime: '09:02',
      checkOutTime: '10:45',
      durationMins: 103,
      status: 'present',
      remarks: 'Heavy lift: Leg day with coach.',
      createdBy: 'Front Desk: Danny',
      date: '2026-07-18'
    },
    {
      id: 'ATT-903',
      clientId: 'CL-003',
      clientName: 'Sophia Liang',
      membershipName: 'Elite Quarterly',
      coachName: 'Damien Vance',
      checkInTime: '18:45', // still inside (no checkout time)
      status: 'present',
      remarks: 'Evening HIIT group workout.',
      createdBy: 'Self Checkin Terminal',
      date: '2026-07-18'
    },
    {
      id: 'ATT-904',
      clientId: 'CL-004',
      clientName: 'Marcus Miller',
      membershipName: 'Basic Monthly',
      coachName: 'Elena Rostova',
      checkInTime: '07:30',
      checkOutTime: '08:45',
      durationMins: 75,
      status: 'late',
      remarks: 'Late check-in due to morning traffic.',
      createdBy: 'Front Desk: Danny',
      date: '2026-07-17'
    },
    {
      id: 'ATT-905',
      clientId: 'CL-005',
      clientName: 'Elena Jenkins',
      membershipName: 'Elite Quarterly',
      coachName: 'Damien Vance',
      checkInTime: '00:00',
      status: 'absent',
      remarks: 'No checkin logged.',
      createdBy: 'System Auto Tracker',
      date: '2026-07-17'
    }
  ];

  const firstNames = ['John', 'Michael', 'James', 'Robert', 'William', 'Emily', 'Emma', 'Olivia', 'Sophia', 'Jessica', 'David', 'Daniel', 'Lucas', 'Ryan', 'Clara', 'Danny', 'Grace', 'Anna', 'Thomas', 'Ben'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez'];
  const memberships = ['Basic Monthly', 'Elite Quarterly', 'Premium VIP Yearly', 'Off-Peak Monthly'];
  const coaches = ['Elena Rostova', 'Marcus Sterling', 'Damien Vance'];
  const statuses: ('present' | 'late' | 'absent')[] = ['present', 'present', 'present', 'late', 'absent'];

  for (let i = 6; i <= 100; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[i % lastNames.length];
    const planName = memberships[i % memberships.length];
    const coach = coaches[i % coaches.length];
    const status = statuses[i % statuses.length];
    const checkinHour = 6 + (i % 14); // 06:00 to 20:00
    
    list.push({
      id: `ATT-${String(900 + i).padStart(3, '0')}`,
      clientId: `CL-${String(i).padStart(3, '0')}`,
      clientName: `${fName} ${lName}`,
      membershipName: planName,
      coachName: coach,
      checkInTime: `${String(checkinHour).padStart(2, '0')}:15`,
      checkOutTime: status === 'present' ? `${String(checkinHour + 1).padStart(2, '0')}:45` : undefined,
      durationMins: status === 'present' ? 90 : undefined,
      status: status,
      remarks: status === 'present' ? 'Completed training log.' : status === 'late' ? 'Late checkin logged.' : 'Absent checkin tracker.',
      createdBy: i % 2 === 0 ? 'Front Desk: Danny' : 'Self Checkin Terminal',
      date: `2026-07-${String((i % 18) + 1).padStart(2, '0')}`
    });
  }

  return list;
}

export const mockAttendanceLogs = generateAttendanceLogs();

// Peak Hour Distribution data
export const mockPeakHoursTrend = [
  { hour: '06:00', count: 12 },
  { hour: '08:00', count: 32 },
  { hour: '10:00', count: 18 },
  { hour: '12:00', count: 15 },
  { hour: '14:00', count: 10 },
  { hour: '16:00', count: 24 },
  { hour: '18:00', count: 45 },
  { hour: '20:00', count: 28 }
];

// 6 Months Attendance Aggregated Trend
export const mockSixMonthAttendanceTrend = [
  { month: 'Feb', rate: 76 },
  { month: 'Mar', rate: 81 },
  { month: 'Apr', rate: 79 },
  { month: 'May', rate: 84 },
  { month: 'Jun', rate: 88 },
  { month: 'Jul', rate: 86 }
];
