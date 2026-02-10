import React, { useState } from 'react';
import { Users, Plus, Trash2, Search, UserPlus } from 'lucide-react';

interface Worker {
  id: string;
  serviceNumber: string;
  fullName: string;
  unit: string;
  email: string;
  status: 'active' | 'inactive';
  assignedDate: string;
}

const ManageWorkers: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: '1',
      serviceNumber: 'SN003',
      fullName: 'Sergeant Mike Johnson',
      unit: '12-Infantry',
      email: 'mike.johnson@military.gov',
      status: 'active',
      assignedDate: '2024-01-15'
    },
    {
      id: '2',
      serviceNumber: 'SN004',
      fullName: 'Corporal David Williams',
      unit: '22-Artillery',
      email: 'david.williams@military.gov',
      status: 'active',
      assignedDate: '2024-01-20'
    },
    {
      id: '3',
      serviceNumber: 'SN005',
      fullName: 'Private First Class Lisa Davis',
      unit: '15-Engineers',
      email: 'lisa.davis@military.gov',
      status: 'inactive',
      assignedDate: '2024-01-10'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRemoveWorker = (workerId: string) => {
    if (window.confirm('Are you sure you want to remove this worker?')) {
      setWorkers(workers.filter(worker => worker.id !== workerId));
    }
  };

  const filteredWorkers = workers.filter(worker =>
    worker.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.serviceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Workers</h1>
            <p className="text-gray-400">Assign and manage workers at your checkpoint</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Worker</span>
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or service number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 px-4 font-medium text-gray-400">Service Number</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Unit</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Assigned Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((worker) => (
                <tr key={worker.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-4 font-medium text-white">{worker.serviceNumber}</td>
                  <td className="py-3 px-4 text-gray-300">{worker.fullName}</td>
                  <td className="py-3 px-4 text-gray-300">{worker.unit}</td>
                  <td className="py-3 px-4 text-gray-300">{worker.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      worker.status === 'active' 
                        ? 'bg-green-900 text-green-200' 
                        : 'bg-red-900 text-red-200'
                    }`}>
                      {worker.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{worker.assignedDate}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleRemoveWorker(worker.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Add Worker</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Search by Name or Service Number
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter name or service number..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Add worker logic here
                    setShowAddModal(false);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Add Worker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageWorkers;