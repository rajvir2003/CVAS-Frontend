import React, { useEffect, useMemo, useState } from 'react';
import { Truck, Filter, Download, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { listVehicles } from '../../store/slice/vehicleSlice';

const AllVehicles: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles, isListing, isFetchingMore, listError, nextCursor, hasMore } = useSelector(
    (state: RootState) => state.vehicle
  );

  const [filters, setFilters] = useState({
    loadClass: '',
    loadType: '',
    checkpoint: '',
    sortBy: 'createdAt'
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(listVehicles({ limit: 20 }));
  }, [dispatch]);

  const loadClasses = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.loadClass))).sort(),
    [vehicles]
  );

  const loadTypes = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.loadType))).sort(),
    [vehicles]
  );

  const checkpoints = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.checkpointId))).sort(),
    [vehicles]
  );

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  const filteredVehicles = vehicles
    .filter(vehicle => {
      if (filters.loadClass && vehicle.loadClass !== filters.loadClass) return false;
      if (filters.loadType && vehicle.loadType !== filters.loadType) return false;
      if (filters.checkpoint && vehicle.checkpointId !== filters.checkpoint) return false;
      if (searchTerm && !vehicle.regNo.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'loadClass':
          return a.loadClass.localeCompare(b.loadClass);
        case 'loadType':
          return a.loadType.localeCompare(b.loadType);
        case 'checkpointId':
          return a.checkpointId.localeCompare(b.checkpointId);
        default:
          return 0;
      }
    });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLoadMore = () => {
    if (!hasMore || !nextCursor || isFetchingMore) {
      return;
    }

    dispatch(listVehicles({ cursor: nextCursor, limit: 20, append: true }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Truck className="h-8 w-8 text-green-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">All Vehicles</h1>
            <p className="text-gray-400">View vehicles from all checkpoints</p>
          </div>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors" type="button">
          <Download className="h-5 w-5" />
          <span>Export</span>
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        {listError && (
          <div className="mb-4 rounded-md border border-red-700 bg-red-900/40 px-4 py-3 text-sm text-red-200">
            {listError}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-300">Filters:</span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by registration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filters.checkpoint}
            onChange={(e) => handleFilterChange('checkpoint', e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Checkpoints</option>
            {checkpoints.map(checkpoint => (
              <option key={checkpoint} value={checkpoint}>{checkpoint}</option>
            ))}
          </select>

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
            <option value="createdAt">Sort by Date</option>
            <option value="loadClass">Sort by Load Class</option>
            <option value="loadType">Sort by Load Type</option>
            <option value="checkpointId">Sort by Checkpoint</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 px-4 font-medium text-gray-400">Registration No</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Load Class</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Load Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Checkpoint</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Registered By</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Date Acquired</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle._id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-4 font-medium text-white">{vehicle.regNo}</td>
                  <td className="py-3 px-4 text-gray-300">{vehicle.loadClass}</td>
                  <td className="py-3 px-4 text-gray-300">{vehicle.loadType}</td>
                  <td className="py-3 px-4 text-gray-300">{vehicle.checkpointId}</td>
                  <td className="py-3 px-4 text-gray-300">{vehicle.user}</td>
                  <td className="py-3 px-4 text-gray-300">{formatDate(vehicle.createdAt)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      !vehicle.delete 
                        ? 'bg-green-900 text-green-200' 
                        : 'bg-red-900 text-red-200'
                    }`}>
                      {!vehicle.delete ? 'active' : 'inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {!isListing && filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-400">
                    No vehicles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isListing && (
          <div className="mt-4 text-sm text-gray-400">Loading vehicles...</div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-400">
          <div className="flex flex-col space-y-1">
            <span>Showing {filteredVehicles.length} of {vehicles.length} vehicles</span>
            <span>Total vehicles across all checkpoints: {vehicles.length}</span>
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isFetchingMore}
              className="rounded-md border border-gray-600 px-3 py-1 text-gray-200 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFetchingMore ? 'Loading more...' : 'Load More'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllVehicles;