import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { Download, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MonthClosingRecord } from '../types';

const History: React.FC = () => {
  const { history } = useAppContext();
  const [selectedRecord, setSelectedRecord] = useState<MonthClosingRecord | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const exportPDF = (record: MonthClosingRecord) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // Primary blue
    doc.text(`Fechamento de Comissão - ${record.monthLabel}`, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fechado em: ${format(record.closedAt, 'dd/MM/yyyy HH:mm')}`, 14, 30);
    
    // Summary Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, 35, 182, 30, 3, 3, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Faturamento Agregado: ${formatCurrency(record.totalRevenue)}`, 20, 45);
    doc.text(`Dias Registrados: ${record.dailyRecords.length}`, 20, 55);
    
    doc.text(`Total Distribuído: ${formatCurrency(record.total10Percent)}`, 110, 45);

    // Table
    const tableData = record.payments.map(p => [
      p.employeeName,
      p.employeeRole,
      p.daysPresent.toString(),
      p.daysAbsent.toString(),
      formatCurrency(p.paymentAmount)
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['Funcionário', 'Cargo', 'Dias Presente', 'Faltas', 'Valor a Pagar']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, // Primary blue header
      styles: { fontSize: 10, cellPadding: 5 },
      foot: [['', '', '', 'Total Pago', formatCurrency(record.total10Percent)]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
    });

    const filename = record.monthLabel.replace(/\s|\//g, '_').toLowerCase();
    doc.save(`fechamento_${filename}.pdf`);
  };

  const columns = [
    { 
      header: 'Referência', 
      accessor: (row: MonthClosingRecord) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Calendar size={16} className="text-primary" />
          {row.monthLabel}
        </div>
      )
    },
    { header: 'Faturamento', accessor: (row: MonthClosingRecord) => formatCurrency(row.totalRevenue) },
    { 
      header: 'Distribuído', 
      accessor: (row: MonthClosingRecord) => (
        <span style={{ color: 'var(--success)', fontWeight: 600 }}>
          {formatCurrency(row.total10Percent)}
        </span>
      )
    },
    { 
      header: 'Ações', 
      accessor: (row: MonthClosingRecord) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => setSelectedRecord(row)} icon={<Eye size={16} />}>
            Ver
          </Button>
          <Button onClick={() => exportPDF(row)} icon={<Download size={16} />}>
            PDF
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Histórico de Fechamentos</h1>
        <p className="text-muted">Consulte os meses encerrados e exporte os relatórios em PDF.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedRecord ? '1fr 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
        <Card title="Meses Fechados">
          <Table 
            columns={columns} 
            data={history} 
            keyExtractor={(row) => row.id} 
            emptyMessage="Nenhum fechamento registrado no histórico."
          />
        </Card>

        {selectedRecord && (
          <Card 
            title={`Detalhes - ${selectedRecord.monthLabel}`} 
            className="animate-fade-in"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Faturamento</p>
                  <div style={{ fontWeight: 600 }}>{formatCurrency(selectedRecord.totalRevenue)}</div>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Total Distribuído</p>
                  <div style={{ fontWeight: 600, color: 'var(--success)' }}>{formatCurrency(selectedRecord.total10Percent)}</div>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Dias Registrados</p>
                  <div style={{ fontWeight: 600 }}>{selectedRecord.dailyRecords.length}</div>
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Pagamentos Individuais</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedRecord.payments.map(p => (
                    <div key={p.employeeId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.employeeName}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <span style={{ color: 'var(--success)' }}>{p.daysPresent} presenças</span> • <span style={{ color: 'var(--danger)' }}>{p.daysAbsent} faltas</span>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>
                        {formatCurrency(p.paymentAmount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Button variant="secondary" fullWidth onClick={() => setSelectedRecord(null)}>Fechar</Button>
                <Button fullWidth icon={<Download size={18} />} onClick={() => exportPDF(selectedRecord)}>Exportar PDF</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default History;
