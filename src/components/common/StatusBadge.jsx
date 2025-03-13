import React from 'react'

export default function StatusBadge({ status }) {
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    canceled: 'bg-red-100 text-red-800',
    pending: 'bg-purple-100 text-purple-800'
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}