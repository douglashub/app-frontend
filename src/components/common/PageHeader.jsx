import React from 'react';

export default function PageHeader({ 
  title, 
  description,
  actionButton = null 
}) {
  return (
    <div className="bg-blue-50 flex flex-col sm:flex-row 2xl:flex-row justify-between items-start sm:items-center xl:items-center gap-4 mb-4 sm:mb-6 xl:mb-8 2xl:mb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl xl:text-4xl 2xl:text-5xl font-bold">{title}</h1>
        {description && <p className="text-gray-600 mt-1 sm:mt-1.5 xl:mt-2 text-sm sm:text-base xl:text-lg 2xl:text-xl">{description}</p>}
      </div>
      
      {actionButton && (
        <div className="self-stretch sm:self-auto">
          {actionButton}
        </div>
      )}
    </div>
  );
}