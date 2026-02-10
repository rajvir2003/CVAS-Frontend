import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Truck, Activity, CheckCircle, XCircle, Plus } from 'lucide-react';

const SuperAdminDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Vehicles',
      value: '1,247',
      icon: Truck,
      color: 'bg-green-500'
    },
    {
      title: 'Active Checkpoints',
      value: '12',
      icon: Shield,
      color: 'bg-blue-500'
    },
    {
      title: 'Checkpoint Admins',
      value: '15',
      icon: Users,
      color: 'bg-yellow-500'
    },
    {
      title: 'Total Workers',
      value: '89',
      icon: Activity,
      color: 'bg-purple-500'
    }
  ];

  const recentActivity = [
    { id: 1, action: 'New Checkpoint Created', detail: 'Delta Checkpoint', time: '2 hours ago' },
    { id: 2, action: 'Admin Assigned', detail: 'Captain Smith → Bravo Checkpoint', time: '4 hours ago' },
    { id: 3, action: 'Vehicle Registered', detail: 'ABC-1234 at Alpha Checkpoint', time: '6 hours ago' },
    { id: 4, action: 'Worker Added', detail: 'Pvt. Johnson → Charlie Checkpoint', time: '8 hours ago' },
  ];

  const checkpointStatus = [
    { name: 'Alpha Checkpoint', status: 'Active', admin: 'Lt. Sarah Smith', vehicles: 284 },
    { name: 'Bravo Checkpoint', status: 'Active', admin: 'Capt. Mike Johnson', vehicles: 193 },
    { name: 'Charlie Checkpoint', status: 'Active', admin: 'Maj. Emily Davis', vehicles: 156 },
    { name: 'Delta Checkpoint', status: 'Inactive', admin: 'Not Assigned', vehicles: 0 },
  ];

  const vehiclesByClass = [
    { class: 'Less than 9 ton', count: 423, percentage: 34 },
    { class: '9 ton', count: 337, percentage: 27 },
    { class: '18 ton', count: 299, percentage: 24 },
    { class: '24 ton', count: 188, percentage: 15 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
          <p className="text-gray-400">System Overview and Management</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/manage-checkpoints"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Shield className="h-5 w-5" />
            <span>Manage Checkpoints</span>
          </Link>
          <Link
            to="/all-vehicles"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Truck className="h-5 w-5" />
            <span>All Vehicles</span>
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
          <h3 className="text-lg font-semibold text-white mb-4">Recent System Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-white">{activity.action}</p>
                  <p className="text-sm text-gray-400">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Vehicle Distribution by Class</h3>
          <div className="space-y-4">
            {vehiclesByClass.map((item, index) => (
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
        <h3 className="text-lg font-semibold text-white mb-4">Checkpoint Status Overview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 px-4 font-medium text-gray-400">Checkpoint</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Admin</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Vehicles</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {checkpointStatus.map((checkpoint, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-4 font-medium text-white">{checkpoint.name}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      checkpoint.status === 'Active' 
                        ? 'bg-green-900 text-green-200' 
                        : 'bg-red-900 text-red-200'
                    }`}>
                      {checkpoint.status === 'Active' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {checkpoint.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{checkpoint.admin}</td>
                  <td className="py-3 px-4 text-gray-400">{checkpoint.vehicles}</td>
                  <td className="py-3 px-4">
                    <Link 
                      to="/manage-checkpoints"
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;