import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card } from '../components/Card';
import { DollarSign, Users, TrendingUp, CalendarDays } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { employees, currentMonthRecords, history } = useAppContext();

  const activeEmployeesCount = employees.filter(e => e.active).length;
  
  const records = Object.values(currentMonthRecords);
  const daysRegistered = records.length;
  
  const { currentRevenue, currentCommission } = useMemo(() => {
    let rev = 0;
    let comm = 0;
    records.forEach(day => {
      rev += day.revenue;
      comm += day.revenue * (day.percentage / 100);
    });
    return { currentRevenue: rev, currentCommission: comm };
  }, [records]);

  const totalDistributedAllTime = history.reduce((acc, curr) => acc + curr.total10Percent, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Visão Geral do Mês</h1>
        <p className="text-muted">Acompanhamento do mês em aberto.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card title="Faturamento Parcial" icon={<DollarSign size={24} />}>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>
            {formatCurrency(currentRevenue)}
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Somado nos dias do mês atual
          </p>
        </Card>

        <Card title="Comissão Acumulada" icon={<TrendingUp size={24} />}>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--success)' }}>
            {formatCurrency(currentCommission)}
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Valor total a ser distribuído até agora
          </p>
        </Card>

        <Card title="Dias Registrados" icon={<CalendarDays size={24} />}>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--primary-blue)' }}>
            {daysRegistered}
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Dias com vendas informadas
          </p>
        </Card>

        <Card title="Equipe Ativa" icon={<Users size={24} />}>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>
            {activeEmployeesCount}
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Funcionários na distribuição
          </p>
        </Card>
      </div>
      
      {history.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
           <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Métricas Globais</h3>
           <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Histórico Distribuído</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(totalDistributedAllTime)}</div>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Fechamentos Realizados</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{history.length}</div>
                 </div>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
