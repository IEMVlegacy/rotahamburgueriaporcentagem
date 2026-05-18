import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Calculator, History, Menu, X, Coins } from 'lucide-react';
import styles from './AdminLayout.module.css';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/employees', label: 'Funcionários', icon: <Users size={20} /> },
    { path: '/daily', label: 'Diário de Vendas', icon: <Calculator size={20} /> },
    { path: '/closing', label: 'Fechar Mês', icon: <History size={20} /> },
    { path: '/history', label: 'Histórico', icon: <History size={20} /> },
  ];

  return (
    <div className={styles.layout}>
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className={styles.overlay} 
          onClick={toggleSidebar}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <Coins color="var(--primary-blue)" size={28} />
            <span>Comission Pro</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <button className={styles.mobileMenuBtn} onClick={toggleSidebar}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          {/* Header Title could go here based on route, or empty for cleaner look */}
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
