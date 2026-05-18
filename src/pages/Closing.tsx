import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Table } from '../components/Table';
import { Calculator, Save } from 'lucide-react';
import type { EmployeePayment } from '../types';

const Closing: React.FC = () => {
  const { employees, addClosingRecord } = useAppContext();
  const navigate = useNavigate();

  const activeEmployees = useMemo(() => employees.filter(e => e.active), [employees]);

  const [revenueStr, setRevenueStr] = useState('');
  const [percentageStr, setPercentageStr] = useState('10');
  const [daysWorkedMap, setDaysWorkedMap] = useState<Record<string, number>>({});

  const revenue = parseFloat(revenueStr) || 0;
  const percentage = parseFloat(percentageStr) || 10;

  const total10Percent = revenue * (percentage / 100);
  const totalDaysWorked = activeEmployees.reduce((acc, emp) => acc + (daysWorkedMap[emp.id] || 0), 0);
  const valuePerDay = totalDaysWorked > 0 ? total10Percent / totalDaysWorked : 0;

  const handleDaysChange = (id: string, days: string) => {
    const parsed = parseInt(days, 10);
    setDaysWorkedMap(prev => ({
      ...prev,
      [id]: isNaN(parsed) ? 0 : parsed
    }));
  };

  const handleSave = () => {
    if (revenue <= 0) {
      alert('Por favor, informe um faturamento válido.');
      return;
    }
    if (totalDaysWorked <= 0) {
      alert('É necessário informar os dias trabalhados de pelo menos um funcionário.');
      return;
    }

    const payments: EmployeePayment[] = activeEmployees.map(emp => {
      const days = daysWorkedMap[emp.id] || 0;
      return {
        employeeId: emp.id,
        employeeName: emp.name,
        employeeRole: emp.role,
        daysPresent: days > 0 ? 1 : 0,
        daysAbsent: days === 0 ? 1 : 0,
        paymentAmount: days * valuePerDay
      };
    }).filter(p => p.daysPresent > 0 || p.daysAbsent > 0);

    addClosingRecord({
      closedAt: Date.now(),
      monthLabel: `Fechamento ${new Date().toLocaleDateString('pt-BR')}`,
      totalRevenue: revenue,
      total10Percent,
      payments,
      dailyRecords: []
    });

    navigate('/history');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const columns = [
    { header: 'Funcionário', accessor: 'name' as const },
    { header: 'Cargo', accessor: 'role' as const },
    { 
      header: 'Dias Trabalhados', 
      accessor: (row: any) => (
        <input 
          type="number" 
          min="0"
          className="input-field" 
          style={{ width: '100px', padding: '0.5rem' }}
          value={daysWorkedMap[row.id] || ''}
          onChange={(e) => handleDaysChange(row.id, e.target.value)}
          placeholder="0"
        />
      )
    },
    { 
      header: 'Pagamento (R$)', 
      accessor: (row: any) => (
        <span style={{ fontWeight: 600, color: 'var(--primary-blue)' }}>
          {formatCurrency((daysWorkedMap[row.id] || 0) * valuePerDay)}
        </span>
      )
    }
  ];

  if (activeEmployees.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1>Fechamento</h1>
        <p className="text-muted">Nenhum funcionário ativo cadastrado para realizar o fechamento.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Fechamento do Período</h1>
        <p className="text-muted">Calcule automaticamente a comissão proporcional da equipe.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Card title="Dados de Faturamento" icon={<Calculator size={20} />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Faturamento Total (R$)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={revenueStr}
                  onChange={e => setRevenueStr(e.target.value)}
                  placeholder="Ex: 50000"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Percentual de Comissão (%)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={percentageStr}
                  onChange={e => setPercentageStr(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card title="Distribuição por Funcionário">
            <Table 
              columns={columns} 
              data={activeEmployees} 
              keyExtractor={(row) => row.id} 
            />
          </Card>
        </div>

        <Card title="Resumo do Cálculo" style={{ position: 'sticky', top: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Total a Distribuir ({percentage}%)</p>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                {formatCurrency(total10Percent)}
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Total de Dias Trabalhados</p>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {totalDaysWorked} dias
              </div>
            </div>

            <div>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Valor por Dia</p>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-blue)' }}>
                {formatCurrency(valuePerDay)}
              </div>
            </div>

            <Button onClick={handleSave} icon={<Save size={18} />} fullWidth style={{ marginTop: '1rem' }}>
              Salvar Fechamento
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Closing;
