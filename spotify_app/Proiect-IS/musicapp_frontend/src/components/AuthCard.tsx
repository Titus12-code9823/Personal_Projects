import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const AuthCard = ({ title, subtitle, children, footer }: AuthCardProps) => (
  <div className="card">
    <header className="card__header">
      <h2>{title}</h2>
      {subtitle && <p className="card__subtitle">{subtitle}</p>}
    </header>
    <div className="card__body">{children}</div>
    {footer && <footer className="card__footer">{footer}</footer>}
  </div>
);

export default AuthCard;

