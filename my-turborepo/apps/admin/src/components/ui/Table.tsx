import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="table-container">
      <table className={clsx('table', className)}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return <thead>{children}</thead>;
}

interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="bg-white divide-y divide-primary-200">{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, onClick, className }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={clsx(onClick && 'cursor-pointer', className)}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export function TableHead({ children, className }: TableHeadProps) {
  return <th className={className}>{children}</th>;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number; // ✅ AGREGADO
}

export function TableCell({ children, className, colSpan }: TableCellProps) {
  return <td className={className} colSpan={colSpan}>{children}</td>;
}