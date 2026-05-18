import React from 'react';
import './components.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, icon, style }) => {
  return (
    <div className={`card bg-glass animate-fade-in ${className}`} style={style}>
      {(title || icon) && (
        <div className="card-header">
          {icon && <div className="card-icon">{icon}</div>}
          {title && <h3 className="card-title">{title}</h3>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};
