import React, { useState } from 'react';
import { Shield, Plus, Edit, Trash2, Search, UserCheck, UserX } from 'lucide-react';

interface Checkpoint {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  admin: string;
  adminId: string;
  vehicles: number;
  workers: number;
  createdDate: string;
}

const ManageCheckpoints: React.FC = () => {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([
    {
      id: '1',
      name: 'Alpha Checkpoint',
      status: 'active',
      admin: 'Lt. Sarah Smith',
      adminId: '2',
      vehicles: 284,
      workers: 8,
      createdDate: '2024-01-01'
    },
    {
      id: '2',
      name: 'Bravo Checkpoint',
      status: 'active',
      admin: 'Capt. Mike Johnson',
      adminId: '3',
      vehicles: 193,
      workers: 6,
      createdDate: '2024-01-05'
    },
    {
      id: '3',
      name: 'Charlie Checkpoint',
      status: 'active',
      admin: 'Maj. Emily Davis',
      adminId: '4',
      vehicles: 156,
      workers: 5,
      createdDate: '2024-01-10'
    },
    {
      id: '4',
      name: 'Delta Checkpoint',
      status: 'inactive',
      admin: 'Not Assigned',
      adminId: '',
      vehicles: 0,
      workers: 0,
      createdDate: '2024-01-15'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
  const [newCheckpointName, setNewCheckpointName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddCheckpoint = () => {
    if (newCheckpointName.trim()) {
      const newCheckpoint: Checkpoint = {
        id: Date.now().toString(),
        name: newCheckpointName,
        status: 'inactive',
        admin: 'Not Assigned',
        adminId: '',
        vehicles: 0,
        workers: 0,
        createdDate: new Date().toISOString().split('T')[0]
      };
      setCheckpoints([...checkpoints, newCheckpoint]);
      setNewCheckpointName('');
      setShowAddModal(false);
    }
  };

  const handleEditCheckpoint = (checkpoint: Checkpoint) => {
    setSelectedCheckpoint(checkpoint);
    setShowEditModal(true);
  };

  const handleRemoveAdmin = (checkpointId: string) => {
    if (window.confirm('Are you sure you want to remove the admin from this checkpoint?')) {
      setCheckpoints(checkpoints.map(cp => 
        cp.id === checkpointId 
          ? { ...cp, admin: 'Not Assigned', adminId: '', status: 'inactive' }
          : cp
      ));
    }
  };

  const handleToggleStatus = (checkpointId: string) => {
    setCheckpoints(checkpoints.map(cp => 
      cp.id === checkpointId 
        ? { ...cp, status: cp.status === 'active' ? 'inactive' : 'active' }
        : cp
    ));
  };

  const filteredCheckpoints = checkpoints.filter(checkpoint =>
    checkpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkpoint.admin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Checkpoints</h1>
            <p className="text-gray-400">Create and manage security checkpoints</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Checkpoint</span>
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search checkpoints..."
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
                <th className="text-left py-3 px-4 font-medium text-gray-400">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Admin</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Vehicles</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Workers</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Created</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCheckpoints.map((checkpoint) => (
                <tr key={checkpoint.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-4 font-medium text-white">{checkpoint.name}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleStatus(checkpoint.id)}
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        checkpoint.status === 'active' 
                          ? 'bg-green-900 text-green-200 hover:bg-green-800' 
                          : 'bg-red-900 text-red-200 hover:bg-red-800'
                      }`}
                    >
                      {checkpoint.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{checkpoint.admin}</td>
                  <td className="py-3 px-4 text-gray-300">{checkpoint.vehicles}</td>
                  <td className="py-3 px-4 text-gray-300">{checkpoint.workers}</td>
                  <td className="py-3 px-4 text-gray-300">{checkpoint.createdDate}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCheckpoint(checkpoint)}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {checkpoint.adminId && (
                        <button
                          onClick={() => handleRemoveAdmin(checkpoint.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Checkpoint Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Checkpoint</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Checkpoint Name
                </label>
                <input
                  type="text"
                  value={newCheckpointName}
                  onChange={(e) => setNewCheckpointName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter checkpoint name..."
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
                  onClick={handleAddCheckpoint}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Checkpoint Modal */}
      {showEditModal && selectedCheckpoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Checkpoint</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Assign Admin (Search by name or service number)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search for admin..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Assign admin logic here
                    setShowEditModal(false);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCheckpoints;