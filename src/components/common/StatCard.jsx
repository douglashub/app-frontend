import React from 'react'
import { ArrowUpIcon, UsersIcon, TruckIcon, MapIcon } from '@heroicons/react/24/outline'

export default function StatCard({ title, value, icon, color }) {
  const Icon = {
    students: UsersIcon,
    buses: TruckIcon,
    routes: MapIcon,
    default: ArrowUpIcon
  }[icon] || ArrowUpIcon

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>
      </div>
    </div>
  )
}