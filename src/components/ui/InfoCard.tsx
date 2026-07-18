import React from 'react';
import { cn } from '@/utils';
import Card, { CardContent, CardHeader } from './Card';

interface InfoRow {
  label: string;
  value: React.ReactNode;
}

interface InfoCardProps {
  title: string;
  rows: InfoRow[];
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  rows,
  description,
  action,
  className
}) => {
  return (
    <Card className={cn('border-slate-900', className)}>
      <CardHeader title={title} description={description} action={action} />
      <CardContent>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rows.map((row, idx) => (
            <div key={idx} className="border-b border-slate-900 pb-2 sm:border-0 sm:pb-0 space-y-0.5">
              <dt className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{row.label}</dt>
              <dd className="text-xs sm:text-sm font-semibold text-slate-200">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
};

export default InfoCard;
