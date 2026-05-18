import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Table } from '../components/Table';
import { UserPlus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { Employee } from '../types';

const Employees: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useAppContext();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '', active: true });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) return;

    if (editingId) {
      updateEmployee(editingId, formData);
    } else {
      addEmployee(formData);
    }

    setFormData({ name: '', role: '', active: true });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (emp: Employee) => {
    setFormData({ name: emp.name, role: emp.role, active: emp.active });
    setEditingId(emp.id);
    setIsFormOpen(true);
  };

  const toggleStatus = (emp: Employee) => {
    updateEmployee(emp.id, { active: !emp.active });
  };

  const columns = [
    { header: 'Nome', accessor: 'name' as keyof Employee },
    { header: 'Cargo', accessor: 'role' as keyof Employee },
    { 
      header: 'Status', 
      accessor: (row: Employee) => (
        <span className={`badge ${row.active ? 'badge-active' : 'badge-inactive'}`}>
          {row.active ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    {
      header: 'Ações',
      accessor: (row: Employee) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => toggleStatus(row)}
            title={row.active ? 'Desativar' : 'Ativar'}
            style={{ background: 'none', color: row.active ? 'var(--warning)' : 'var(--success)' }}
          >
            {row.active ? <XCircle size={18} /> : <CheckCircle size={18} />}
          </button>
          <button onClick={() => handleEdit(row)} style={{ background: 'none', color: 'var(--primary-blue)' }}>
            <Edit2 size={18} />
          </button>
          <button onClick={() => deleteEmployee(row.id)} style={{ background: 'none', color: 'var(--danger)' }}>
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Funcionários</h1>
          <p className="text-muted">Gerencie a equipe para o cálculo de comissões.</p>
        </div>
        <Button onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); setFormData({ name: '', role: '', active: true }); }} icon={<UserPlus size={18} />}>
          Novo Funcionário
        </Button>
      </div>

      {isFormOpen && (
        <Card title={editingId ? 'Editar Funcionário' : 'Novo Funcionário'} className="animate-fade-in" style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Nome Completo</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Ex: João Silva"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Cargo</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                required
                placeholder="Ex: Vendedor"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button type="submit">{editingId ? 'Atualizar' : 'Salvar'}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <Table 
          columns={columns} 
          data={employees} 
          keyExtractor={(row) => row.id} 
          emptyMessage="Nenhum funcionário cadastrado. Adicione o primeiro!"
        />
      </Card>
    </div>
  );
};

export default Employees;
