import React, { useState } from 'react';
import { FileText, Filter, Download, Calendar } from 'lucide-react';

interface Vehicle {
  id: string;
  regnNo: string;
  loadClass: string;
  loadType: string;
  registeredBy: string;
  dateAcquired: string;
  status: 'active' | 'inactive';
}

const VehicleLogs: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      regnNo: 'ABC1234',
      loadClass: '9 ton',
      loadType: 'Industrial',
      registeredBy: 'Sgt. Johnson',
      dateAcquired: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      regnNo: 'DEF5678',
      loadClass: '18 ton',
      loadType: 'Agricultural',
      registeredBy: 'Cpl. Williams',
      dateAcquired: '2024-01-14',
      status: 'active'
    },
    {
      id: '3',
      regnNo: 'GHI9012',
      loadClass: 'Less than 9 ton',
      loadType: 'Packages',
      registeredBy: 'Sgt. Johnson',
      dateAcquired: '2024-01-13',
      status: 'active'
    },
    {
      id: '4',
      regnNo: 'JKL3456',
      loadClass: '24 ton',
      loadType: 'Industrial',
      registeredBy: 'Pvt. Davis',
      dateAcquired: '2024-01-12',
      status: 'inactive'
    }
  ]);

  const [filters, setFilters] = useState({
    loadClass: '',
    loadType: '',
    sortBy: 'dateAcquired'
  });

  const loadClasses = ['Less than 9 ton', '9 ton', '18 ton', '24 ton'];
  const loadTypes = ['Packages', 'Industrial', 'Agricultural', 'Other'];

  const filteredVehicles = vehicles
    .filter(vehicle => {
      if (filters.loadClass && vehicle.loadClass !== filters.loadClass) return false;
      if (filters.loadType && vehicle.loadType !== filters.loadType) return false;
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'dateAcquired':
          return new Date(b.dateAcquired).getTime() - new Date(a.dateAcquired).getTime();
        case 'loadClass':
          return a.loadClass.localeCompare(b.loadClass);
        case 'loadType':
          return a.loadType.localeCompare(b.loadType);
        default:
          return 0;
      }
    });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-green-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Vehicle Logs</h1>
            <p className="text-gray-400">View all vehicles registered at your checkpoint</p>
          </div>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Download className="h-5 w-5" />
          <span>Export</span>
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-300">Filters:</span>
          </div>
          
          <select
            value={filters.loadClass}
            onChange={(e) => handleFilterChange('loadClass', e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Load Classes</option>
            {loadClasses.map(loadClass => (
              <option key={loadClass} value={loadClass}>{loadClass}</option>
            ))}
          </select>

          <select
            value={filters.loadType}
            onChange={(e) => handleFilterChange('loadType', e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Load Types</option>
            {loadTypes.map(loadType => (
              <option key={loadType} value={loadType}>{loadType}</option>
            ))}
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="dateAcquired">Sort by Date</option>
            <option value="loadClass">Sort by Load Class</option>
            <option value="loadType">Sort by Load Type</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 px-4 font-medium text-gray-400">Registration No</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Load Class</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Load Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Registered By</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Date Acquired</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-4 font-medium text-white">{vehicle.regnNo}</td>
                  <td className="py-3 px-4 text-gray-300">{vehicle.loadClass}</td>
                  <td className="py-3 px-4 text-gray-300">{vehicle.loadType}</td>
                  <td className="py-3 px-4 text-gray-300">{vehicle.registeredBy}</td>
                  <td className="py-3 px-4 text-gray-300">{vehicle.dateAcquired}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.status === 'active' 
                        ? 'bg-green-900 text-green-200' 
                        : 'bg-red-900 text-red-200'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          Showing {filteredVehicles.length} of {vehicles.length} vehicles
        </div>
      </div>
    </div>
  );
};

export default VehicleLogs;