import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Table } from '../components/Table';
import { Calendar as CalendarIcon, Save, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Employee } from '../types';

const DailyTracking: React.FC = () => {
  const { employees, currentMonthRecords, updateDailyRecord } = useAppContext();
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const activeEmployees = useMemo(() => employees.filter(e => e.active), [employees]);

  // Load record for selected date
  const currentRecord = currentMonthRecords[selectedDate];

  const [revenueStr, setRevenueStr] = useState(currentRecord ? currentRecord.revenue.toString() : '');
  const [percentageStr, setPercentageStr] = useState(currentRecord ? currentRecord.percentage.toString() : '10');
  const [absentIds, setAbsentIds] = useState<string[]>(currentRecord ? currentRecord.absentEmployeeIds : []);

  // Sync state when selected date changes
  useEffect(() => {
    const record = currentMonthRecords[selectedDate];
    if (record) {
      setRevenueStr(record.revenue.toString());
      setPercentageStr(record.percentage.toString());
      setAbsentIds(record.absentEmployeeIds);
    } else {
      setRevenueStr('');
      setPercentageStr('10');
      setAbsentIds([]);
    }
  }, [selectedDate, currentMonthRecords]);

  const revenue = parseFloat(revenueStr) || 0;
  const percentage = parseFloat(percentageStr) || 10;
  const total10Percent = revenue * (percentage / 100);

  const presentEmployeesCount = activeEmployees.length - absentIds.length;
  const dailyValuePerPresent = presentEmployeesCount > 0 ? total10Percent / presentEmployeesCount : 0;

  const toggleAttendance = (empId: string) => {
    setAbsentIds(prev => 
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const handleSave = () => {
    updateDailyRecord(selectedDate, {
      dateStr: selectedDate,
      revenue,
      percentage,
      absentEmployeeIds: absentIds
    });
    alert('Dia salvo com sucesso!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const columns = [
    { header: 'Funcionário', accessor: 'name' as keyof Employee },
    { header: 'Cargo', accessor: 'role' as keyof Employee },
    {
      header: 'Presença',
      accessor: (row: Employee) => {
        const isAbsent = absentIds.includes(row.id);
        return (
          <button
            onClick={() => toggleAttendance(row.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
              backgroundColor: isAbsent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: isAbsent ? 'var(--danger)' : 'var(--success)',
              border: `1px solid ${isAbsent ? 'var(--danger)' : 'var(--success)'}`,
              cursor: 'pointer', fontWeight: 600, width: '120px', justifyContent: 'center'
            }}
          >
            {isAbsent ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
            {isAbsent ? 'Faltou' : 'Presente'}
          </button>
        );
      }
    },
    {
      header: 'Recebe Hoje',
      accessor: (row: Employee) => {
        const isAbsent = absentIds.includes(row.id);
        return (
          <span style={{ fontWeight: 600, color: isAbsent ? 'var(--text-muted)' : 'var(--primary-blue)', textDecoration: isAbsent ? 'line-through' : 'none' }}>
            {formatCurrency(isAbsent ? 0 : dailyValuePerPresent)}
          </span>
        );
      }
    }
  ];

  if (activeEmployees.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1>Diário de Vendas</h1>
        <p className="text-muted">Nenhum funcionário ativo cadastrado.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Diário de Vendas</h1>
        <p className="text-muted">Informe as vendas do dia e marque as faltas para calcular a comissão diária.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <Card title="Dados do Dia" icon={<CalendarIcon size={20} />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Data</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Faturamento Total (R$)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={revenueStr}
                  onChange={e => setRevenueStr(e.target.value)}
                  placeholder="Ex: 1500"
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Comissão (%)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={percentageStr}
                  onChange={e => setPercentageStr(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card title="Presença da Equipe e Distribuição">
            <Table 
              columns={columns} 
              data={activeEmployees} 
              keyExtractor={(row) => row.id} 
            />
          </Card>
        </div>

        <Card title="Resumo do Dia" style={{ position: 'sticky', top: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Faturamento</p>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {formatCurrency(revenue)}
              </div>
            </div>

            <div>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Total da Comissão ({percentage}%)</p>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                {formatCurrency(total10Percent)}
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Equipe Presente</p>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {presentEmployeesCount} de {activeEmployees.length}
              </div>
            </div>

            <div>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Valor por Funcionário Presente</p>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-blue)' }}>
                {formatCurrency(dailyValuePerPresent)}
              </div>
            </div>

            <Button onClick={handleSave} icon={<Save size={18} />} fullWidth style={{ marginTop: '1rem' }}>
              Salvar Dia
            </Button>
            
            {currentMonthRecords[selectedDate] && (
               <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--success)', marginTop: '-0.5rem' }}>
                 ✓ Este dia está salvo no mês.
               </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DailyTracking;
