export interface Employee {
  id: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: number;
}

export interface DailyRecord {
  dateStr: string; // YYYY-MM-DD
  revenue: number;
  percentage: number;
  absentEmployeeIds: string[]; // List of employees who were absent (X) on this day
}

export interface MonthClosingRecord {
  id: string;
  closedAt: number; // timestamp
  monthLabel: string; // Ex: "Outubro/2023"
  totalRevenue: number;
  total10Percent: number;
  payments: EmployeePayment[];
  dailyRecords: DailyRecord[]; // To keep history of the month
}

export interface EmployeePayment {
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  daysPresent: number;
  daysAbsent: number;
  paymentAmount: number;
}
