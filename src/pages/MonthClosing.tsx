import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Table } from '../components/Table';
import { CalendarCheck } from 'lucide-react';
import type { EmployeePayment } from '../types';

const MonthClosing: React.FC = () => {
  const { employees, currentMonthRecords, addClosingRecord, clearCurrentMonth } = useAppContext();
  const navigate = useNavigate();

  const [monthLabel, setMonthLabel] = useState('');

  const activeEmployees = useMemo(() => employees.filter(e => e.active), [employees]);
  const records = Object.values(currentMonthRecords);

  const { totalRevenue, total10Percent, payments } = useMemo(() => {
    let rev = 0;
    let comm = 0;
    
    // Initialize payments map
    const payMap: Record<string, EmployeePayment> = {};
    activeEmployees.forEach(emp => {
      payMap[emp.id] = {
        employeeId: emp.id,
        employeeName: emp.name,
        employeeRole: emp.role,
        daysPresent: 0,
        daysAbsent: 0,
        paymentAmount: 0
      };
    });

    records.forEach(day => {
      rev += day.revenue;
      const dayComm = day.revenue * (day.percentage / 100);
      comm += dayComm;

      const presentCount = activeEmployees.length - day.absentEmployeeIds.length;
      const valPerEmp = presentCount > 0 ? dayComm / presentCount : 0;

      activeEmployees.forEach(emp => {
        if (day.absentEmployeeIds.includes(emp.id)) {
          payMap[emp.id].daysAbsent += 1;
        } else {
          payMap[emp.id].daysPresent += 1;
          payMap[emp.id].paymentAmount += valPerEmp;
        }
      });
    });

    return {
      totalRevenue: rev,
      total10Percent: comm,
      payments: Object.values(payMap).filter(p => p.daysPresent > 0 || p.daysAbsent > 0)
    };
  }, [records, activeEmployees]);

  const handleSave = () => {
    if (records.length === 0) {
      alert('Nenhum dia foi registrado neste mês.');
      return;
    }
    if (!monthLabel) {
      alert('Por favor, informe um nome/mês de referência (Ex: Outubro/2023).');
      return;
    }

    addClosingRecord({
      closedAt: Date.now(),
      monthLabel,
      totalRevenue,
      total10Percent,
      payments,
      dailyRecords: records
    });

    clearCurrentMonth();
    navigate('/history');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const columns = [
    { header: 'Funcionário', accessor: 'employeeName' as const },
    { 
      header: 'Presenças', 
      accessor: (row: EmployeePayment) => <span style={{ color: 'var(--success)' }}>{row.daysPresent} dias</span> 
    },
    { 
      header: 'Faltas', 
      accessor: (row: EmployeePayment) => <span style={{ color: 'var(--danger)' }}>{row.daysAbsent} dias</span> 
    },
    { 
      header: 'Total a Receber', 
      accessor: (row: EmployeePayment) => (
        <span style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>
          {formatCurrency(row.paymentAmount)}
        </span>
      )
    }
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Fechamento do Mês</h1>
        <p className="text-muted">Revise os totais acumulados dos dias registrados e feche a competência.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Card title="Resumo da Equipe">
            <Table 
              columns={columns} 
              data={payments} 
              keyExtractor={(row) => row.employeeId}
              emptyMessage="Nenhum dado calculado. Adicione dias no Diário de Vendas primeiro."
            />
          </Card>
        </div>

        <Card title="Finalizar Mês" style={{ position: 'sticky', top: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Mês de Referência</label>
              <input 
                type="text" 
                className="input-field" 
                value={monthLabel}
                onChange={e => setMonthLabel(e.target.value)}
                placeholder="Ex: Novembro/2023"
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Dias Registrados</p>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {records.length} dias
              </div>
            </div>

            <div>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Faturamento Total Agregado</p>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {formatCurrency(totalRevenue)}
              </div>
            </div>

            <div>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Total de Comissão a Pagar</p>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                {formatCurrency(total10Percent)}
              </div>
            </div>

            <Button onClick={handleSave} icon={<CalendarCheck size={18} />} fullWidth style={{ marginTop: '1rem' }}>
              Salvar Histórico
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MonthClosing;
