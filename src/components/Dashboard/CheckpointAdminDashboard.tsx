import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Truck, FileText, Activity, Shield, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CheckpointAdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Vehicles',
      value: '284',
      icon: Truck,
      color: 'bg-green-500'
    },
    {
      title: 'Active Workers',
      value: '8',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Today\'s Entries',
      value: '23',
      icon: FileText,
      color: 'bg-yellow-500'
    },
    {
      title: 'Checkpoint Status',
      value: 'Active',
      icon: Shield,
      color: 'bg-purple-500'
    }
  ];

  const recentActivity = [
    { id: 1, action: 'Vehicle Registered', worker: 'Sgt. Johnson', detail: 'ABC-1234', time: '30 min ago' },
    { id: 2, action: 'Worker Added', worker: 'Admin', detail: 'Pvt. Williams', time: '2 hours ago' },
    { id: 3, action: 'Vehicle Registered', worker: 'Cpl. Davis', detail: 'DEF-5678', time: '3 hours ago' },
    { id: 4, action: 'Vehicle Registered', worker: 'Sgt. Johnson', detail: 'GHI-9012', time: '4 hours ago' },
  ];

  const loadClassDistribution = [
    { class: 'Less than 9 ton', count: 98, percentage: 34 },
    { class: '9 ton', count: 76, percentage: 27 },
    { class: '18 ton', count: 67, percentage: 24 },
    { class: '24 ton', count: 43, percentage: 15 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Checkpoint Admin Dashboard</h1>
          <p className="text-gray-400">Managing {user?.checkpoint || 'Checkpoint'}</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/manage-workers"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Users className="h-5 w-5" />
            <span>Manage Workers</span>
          </Link>
          <Link
            to="/vehicle-logs"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FileText className="h-5 w-5" />
            <span>View Logs</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-white">{activity.action}</p>
                  <p className="text-sm text-gray-400">{activity.worker} • {activity.detail}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Load Class Distribution</h3>
          <div className="space-y-4">
            {loadClassDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">{item.class}</span>
                    <span className="text-sm text-gray-500">{item.count} vehicles</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/manage-workers"
            className="flex items-center space-x-3 p-4 bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors"
          >
            <Users className="h-6 w-6 text-blue-400" />
            <div>
              <p className="font-medium text-blue-200">Manage Workers</p>
              <p className="text-sm text-blue-400">Add or remove workers</p>
            </div>
          </Link>
          <Link
            to="/vehicle-logs"
            className="flex items-center space-x-3 p-4 bg-green-900 hover:bg-green-800 rounded-lg transition-colors"
          >
            <FileText className="h-6 w-6 text-green-400" />
            <div>
              <p className="font-medium text-green-200">Vehicle Logs</p>
              <p className="text-sm text-green-400">View all vehicle entries</p>
            </div>
          </Link>
          <Link
            to="/profile"
            className="flex items-center space-x-3 p-4 bg-purple-900 hover:bg-purple-800 rounded-lg transition-colors"
          >
            <Shield className="h-6 w-6 text-purple-400" />
            <div>
              <p className="font-medium text-purple-200">Profile</p>
              <p className="text-sm text-purple-400">View your details</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckpointAdminDashboard;