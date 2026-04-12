import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, FileText, Activity, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Vehicles Registered Today',
      value: '12',
      icon: Truck,
      color: 'bg-green-500'
    },
    {
      title: 'Total Vehicles',
      value: '156',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Status',
      value: 'Online',
      icon: Activity,
      color: 'bg-yellow-500'
    },
    {
      title: 'Checkpoint',
      value: user?.checkpointName || 'Unassigned',
      icon: User,
      color: 'bg-purple-500'
    }
  ];

  const recentActivity = [
    { id: 1, action: 'Vehicle Registered', detail: 'ABC-1234 - 9 ton', time: '2 hours ago' },
    { id: 2, action: 'Vehicle Registered', detail: 'DEF-5678 - 18 ton', time: '4 hours ago' },
    { id: 3, action: 'Vehicle Registered', detail: 'GHI-9012 - Less than 9 ton', time: '6 hours ago' },
    { id: 4, action: 'Vehicle Registered', detail: 'JKL-3456 - 24 ton', time: '8 hours ago' },
  ];

  if (!user?.checkpoint) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg">
            <User className="h-14 w-14 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">No Checkpoint Assigned</h2>
            <p className="text-gray-400 mb-6">
              No checkpoint assigned yet. Please contact the higher authority.
            </p>
            <div className="text-sm text-gray-500">
              <p>Your Details:</p>
              <p className="font-medium text-white">{user?.name}</p>
              <p>{user?.serviceNumber}</p>
              <p>{user?.unit}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Worker Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-400">Welcome back, {user?.name}</p>
        </div>
        <Link
          to="/vehicle-entry"
          className="w-full sm:w-auto justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Truck className="h-5 w-5" />
          <span>Register Vehicle</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-white break-words">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-white">{activity.action}</p>
                  <p className="text-sm text-gray-400">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-500 self-start sm:self-auto">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/vehicle-entry"
              className="flex items-center space-x-3 p-3 bg-green-900 hover:bg-green-800 rounded-lg transition-colors"
            >
              <Truck className="h-5 w-5 text-green-400" />
              <span className="text-green-200 font-medium">Register New Vehicle</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center space-x-3 p-3 bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <User className="h-5 w-5 text-blue-400" />
              <span className="text-blue-200 font-medium">View Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;