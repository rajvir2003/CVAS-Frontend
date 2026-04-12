import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Users, Search, Plus, UserMinus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchCurrentUserCheckpoint, updateCheckpointWorker } from '../../store/slice/checkpointSlice';
import { fetchWorkers } from '../../store/slice/authSlice';

const ManageWorkers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentCheckpoint, isCurrentCheckpointLoading, isWorkerActionLoading, error } = useSelector(
    (state: RootState) => state.checkpoint
  );
  const { workers, workersNextCursor, isWorkersLoading, isWorkersLoadingMore } = useSelector(
    (state: RootState) => state.auth
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [addWorkerSearchTerm, setAddWorkerSearchTerm] = useState('');
  const [addWorkerError, setAddWorkerError] = useState<string | null>(null);
  const [addWorkerSuccess, setAddWorkerSuccess] = useState<string | null>(null);
  const addWorkerLoadMoreRef = useRef<HTMLDivElement | null>(null);

  const checkpointLoadError = !currentCheckpoint ? error : null;

  useEffect(() => {
    if (!currentCheckpoint && !isCurrentCheckpointLoading) {
      dispatch(fetchCurrentUserCheckpoint());
    }
  }, [dispatch, currentCheckpoint, isCurrentCheckpointLoading]);

  const filteredWorkers = useMemo(
    () =>
      (currentCheckpoint?.users ?? []).filter(
        (worker) =>
          worker.role !== 'CHECKPOINT ADMIN' &&
          (worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            worker.serviceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [currentCheckpoint?.users, searchTerm]
  );

  const assignedServiceNumbers = useMemo(
    () => new Set((currentCheckpoint?.users ?? []).map((worker) => worker.serviceNumber)),
    [currentCheckpoint?.users]
  );

  const filteredAvailableWorkers = useMemo(
    () =>
      workers.filter(
        (worker) =>
          !worker.isDeleted &&
          !assignedServiceNumbers.has(worker.serviceNumber) &&
          (
            worker.name.toLowerCase().includes(addWorkerSearchTerm.toLowerCase()) ||
            worker.serviceNumber.toLowerCase().includes(addWorkerSearchTerm.toLowerCase()) ||
            worker.rank.toLowerCase().includes(addWorkerSearchTerm.toLowerCase())
          )
      ),
    [workers, addWorkerSearchTerm, assignedServiceNumbers]
  );

  const handleAddWorker = async (serviceNumber: string) => {
    setAddWorkerError(null);
    setAddWorkerSuccess(null);

    try {
      const response = await dispatch(
        updateCheckpointWorker({
          serviceNumber,
          action: 'assign',
        })
      ).unwrap();

      setAddWorkerSuccess(response.message ?? 'Worker assigned successfully.');
    } catch (err) {
      setAddWorkerError(typeof err === 'string' ? err : 'Failed to assign worker.');
    }
  };

  const handleRemoveWorker = (serviceNumber: string) => {
    dispatch(
      updateCheckpointWorker({
        serviceNumber,
        action: 'remove',
      })
    );
  };

  const loadMoreWorkers = useCallback(() => {
    if (!showAddWorkerModal || isWorkersLoading || isWorkersLoadingMore || !workersNextCursor) {
      return;
    }

    dispatch(fetchWorkers({ cursor: workersNextCursor }));
  }, [showAddWorkerModal, isWorkersLoading, isWorkersLoadingMore, workersNextCursor, dispatch]);

  useEffect(() => {
    const target = addWorkerLoadMoreRef.current;

    if (!target || !showAddWorkerModal) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          loadMoreWorkers();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [showAddWorkerModal, loadMoreWorkers]);

  const openAddWorkerModal = () => {
    setAddWorkerSearchTerm('');
    setAddWorkerError(null);
    setAddWorkerSuccess(null);
    setShowAddWorkerModal(true);

    if (workers.length === 0 && !isWorkersLoading) {
      dispatch(fetchWorkers());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Workers</h1>
            <p className="text-gray-400">Workers at your assigned checkpoint</p>
          </div>
        </div>
        <button
          onClick={openAddWorkerModal}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
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
                <th className="text-left py-3 px-4 font-medium text-gray-400">Rank</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isCurrentCheckpointLoading && (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-gray-300">
                    Loading workers...
                  </td>
                </tr>
              )}

              {!isCurrentCheckpointLoading && checkpointLoadError && (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-red-300">
                    {checkpointLoadError}
                  </td>
                </tr>
              )}

              {!isCurrentCheckpointLoading && !checkpointLoadError && filteredWorkers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-gray-300">
                    No workers found for this checkpoint.
                  </td>
                </tr>
              )}

              {!isCurrentCheckpointLoading &&
                !checkpointLoadError &&
                filteredWorkers.map((worker) => (
                  <tr key={worker._id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-4 font-medium text-white">{worker.serviceNumber}</td>
                    <td className="py-3 px-4 text-gray-300">{worker.name}</td>
                    <td className="py-3 px-4 text-gray-300">{worker.rank}</td>
                    <td className="py-3 px-4 text-gray-300">{worker.role}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleRemoveWorker(worker.serviceNumber)}
                        disabled={isWorkerActionLoading}
                        className="text-red-400 hover:text-red-300 p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove worker"
                        aria-label={`Remove ${worker.name}`}
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddWorkerModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Add Worker</h3>
              <p className="text-sm text-gray-400 mt-1">Search and add workers from the available list</p>
            </div>

            <div className="p-4">
              {addWorkerSuccess && (
                <div className="mb-4 bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded">
                  {addWorkerSuccess}
                </div>
              )}

              {addWorkerError && (
                <div className="mb-4 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
                  {addWorkerError}
                </div>
              )}

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={addWorkerSearchTerm}
                  onChange={(e) => setAddWorkerSearchTerm(e.target.value)}
                  placeholder="Search by name, service number, or rank"
                  className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="max-h-72 overflow-y-auto pr-1 space-y-2">
                {isWorkersLoading && workers.length === 0 && (
                  <div className="text-sm text-gray-400 py-4 text-center">Loading available workers...</div>
                )}

                {!isWorkersLoading && filteredAvailableWorkers.length === 0 && (
                  <div className="text-sm text-gray-400 py-4 text-center">No matching workers found.</div>
                )}

                {filteredAvailableWorkers.map((worker) => (
                  <div
                    key={worker._id}
                    className="bg-gray-700/60 border border-gray-600 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{worker.rank} {worker.name}</p>
                      <p className="text-xs text-gray-400">{worker.serviceNumber} • {worker.unit}</p>
                    </div>
                    <button
                      onClick={() => handleAddWorker(worker.serviceNumber)}
                      disabled={isWorkerActionLoading}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isWorkerActionLoading ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                ))}

                <div ref={addWorkerLoadMoreRef} className="h-2" />

                {isWorkersLoadingMore && (
                  <div className="text-xs text-gray-400 text-center py-2">Loading more workers...</div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setShowAddWorkerModal(false)}
                className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageWorkers;