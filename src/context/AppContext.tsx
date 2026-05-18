import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Employee, DailyRecord, MonthClosingRecord } from '../types';

interface AppContextType {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  // Current Month State
  currentMonthRecords: Record<string, DailyRecord>; // Key is YYYY-MM-DD
  updateDailyRecord: (dateStr: string, record: DailyRecord) => void;
  clearCurrentMonth: () => void;

  history: MonthClosingRecord[];
  addClosingRecord: (record: Omit<MonthClosingRecord, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('@comission:employees');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [currentMonthRecords, setCurrentMonthRecords] = useState<Record<string, DailyRecord>>(() => {
    try {
      const saved = localStorage.getItem('@comission:currentMonth');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [history, setHistory] = useState<MonthClosingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('@comission:historyV2');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('@comission:employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('@comission:currentMonth', JSON.stringify(currentMonthRecords));
  }, [currentMonthRecords]);

  useEffect(() => {
    localStorage.setItem('@comission:historyV2', JSON.stringify(history));
  }, [history]);

  const addEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setEmployees((prev) => [...prev, newEmployee]);
  };

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...data } : emp))
    );
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  };

  const updateDailyRecord = (dateStr: string, record: DailyRecord) => {
    setCurrentMonthRecords(prev => ({
      ...prev,
      [dateStr]: record
    }));
  };

  const clearCurrentMonth = () => {
    setCurrentMonthRecords({});
  };

  const addClosingRecord = (recordData: Omit<MonthClosingRecord, 'id'>) => {
    const newRecord: MonthClosingRecord = {
      ...recordData,
      id: crypto.randomUUID(),
    };
    setHistory((prev) => [newRecord, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        currentMonthRecords,
        updateDailyRecord,
        clearCurrentMonth,
        history,
        addClosingRecord,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
