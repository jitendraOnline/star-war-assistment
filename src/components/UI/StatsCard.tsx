import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  className = '',
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-900 border-blue-200',
    green: 'bg-green-50 text-green-900 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    red: 'bg-red-50 text-red-900 border-red-200',
    purple: 'bg-purple-50 text-purple-900 border-purple-200',
    gray: 'bg-gray-50 text-gray-900 border-gray-200',
  };

  const valueColorClasses = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    yellow: 'text-yellow-700',
    red: 'text-red-700',
    purple: 'text-purple-700',
    gray: 'text-gray-700',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-1">{title}</h3>
          <p className={`text-lg sm:text-xl font-bold ${valueColorClasses[color]}`}>{value}</p>
        </div>
        {icon && <div className="ml-3 flex-shrink-0">{icon}</div>}
      </div>
    </div>
  );
};
