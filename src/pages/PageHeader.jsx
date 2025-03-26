import React from 'react';

export default function PageHeader({ 
  title, 
  description,
  actionButton = null 
}) {
  return (
    <div className="bg-blue-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 md:p-6 mb-4 md:mb-6 rounded-lg shadow-sm">
        <div className="w-full md:flex-1 space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold break-words leading-tight">{title}</h1>
            {description && <p className="text-gray-600 text-base md:text-lg break-words leading-relaxed">{description}</p>}
        </div>
        {actionButton && (
          <div className="w-full md:w-auto flex justify-start md:justify-end">
            {actionButton}
          </div>
        )}
    </div>
  );
}