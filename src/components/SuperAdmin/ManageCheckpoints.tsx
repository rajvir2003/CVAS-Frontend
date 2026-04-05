import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Shield, Search, Edit, UserX } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchCheckpoints, updateCheckpointAdmin } from '../../store/slice/checkpointSlice';
import { fetchCheckpointAdmins } from '../../store/slice/authSlice';

const ManageCheckpoints: React.FC = () => {
  const CHECKPOINT_CACHE_TTL_MS = 60_000;
  const dispatch = useDispatch<AppDispatch>();
  const { checkpoints, nextCursor, isLoading, isLoadingMore, isAdminActionLoading, lastFetchedAt, error } =
    useSelector((state: RootState) => state.checkpoint);
  const {
    checkpointAdmins,
    checkpointAdminsNextCursor,
    isCheckpointAdminsLoading,
    isCheckpointAdminsLoadingMore,
  } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<{ _id: string; name: string } | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const adminLoadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isCacheFresh =
      typeof lastFetchedAt === 'number' && Date.now() - lastFetchedAt < CHECKPOINT_CACHE_TTL_MS;

    if (checkpoints.length === 0 || !isCacheFresh) {
      dispatch(fetchCheckpoints());
    }
  }, [dispatch, checkpoints.length, lastFetchedAt]);

  const loadMoreCheckpoints = useCallback(() => {
    if (isLoading || isLoadingMore || !nextCursor) {
      return;
    }

    dispatch(fetchCheckpoints({ cursor: nextCursor }));
  }, [dispatch, isLoading, isLoadingMore, nextCursor]);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          loadMoreCheckpoints();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [loadMoreCheckpoints]);

  const filteredCheckpoints = useMemo(
    () =>
      checkpoints.filter((checkpoint) =>
        checkpoint.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [checkpoints, searchTerm]
  );

  const assignedAdminServiceNumbers = useMemo(
    () =>
      new Set(
        checkpoints
          .map((checkpoint) => checkpoint.admin_id?.serviceNumber)
          .filter((serviceNumber): serviceNumber is string => Boolean(serviceNumber))
      ),
    [checkpoints]
  );

  const filteredCheckpointAdmins = useMemo(
    () =>
      checkpointAdmins.filter((admin) => {
        const query = adminSearchTerm.toLowerCase();
        return (
          !admin.isDeleted &&
          !admin.checkpoint &&
          !assignedAdminServiceNumbers.has(admin.serviceNumber) &&
          (
            admin.name.toLowerCase().includes(query) ||
            admin.serviceNumber.toLowerCase().includes(query) ||
            admin.rank.toLowerCase().includes(query)
          )
        );
      }),
    [checkpointAdmins, adminSearchTerm, assignedAdminServiceNumbers]
  );

  const loadMoreCheckpointAdmins = useCallback(() => {
    if (
      !showAdminModal ||
      isCheckpointAdminsLoading ||
      isCheckpointAdminsLoadingMore ||
      !checkpointAdminsNextCursor
    ) {
      return;
    }

    dispatch(fetchCheckpointAdmins({ cursor: checkpointAdminsNextCursor }));
  }, [
    showAdminModal,
    isCheckpointAdminsLoading,
    isCheckpointAdminsLoadingMore,
    checkpointAdminsNextCursor,
    dispatch,
  ]);

  useEffect(() => {
    const target = adminLoadMoreRef.current;

    if (!target || !showAdminModal) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          loadMoreCheckpointAdmins();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [showAdminModal, loadMoreCheckpointAdmins]);

  const handleOpenAssignAdminModal = (checkpointId: string, checkpointName: string) => {
    setSelectedCheckpoint({ _id: checkpointId, name: checkpointName });
    setAdminSearchTerm('');
    setShowAdminModal(true);

    if (checkpointAdmins.length === 0 && !isCheckpointAdminsLoading) {
      dispatch(fetchCheckpointAdmins());
    }
  };

  const handleCloseAssignAdminModal = () => {
    setShowAdminModal(false);
    setSelectedCheckpoint(null);
  };

  const handleSelectCheckpointAdmin = async (serviceNumber: string) => {
    if (!selectedCheckpoint) {
      return;
    }

    try {
      await dispatch(
        updateCheckpointAdmin({
          checkpointId: selectedCheckpoint._id,
          serviceNumber,
          action: 'assign',
        })
      ).unwrap();

      handleCloseAssignAdminModal();
    } catch {
      // error is managed in Redux state
    }
  };

  const handleRemoveAdmin = (checkpointId: string, serviceNumber: string) => {
    dispatch(
      updateCheckpointAdmin({
        checkpointId,
        serviceNumber,
        action: 'remove',
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Checkpoints</h1>
            <p className="text-gray-400">Checkpoint list from the server</p>
          </div>
        </div>
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
                <th className="text-left py-3 px-4 font-medium text-gray-400">Users</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Created</th>
                <th className="text-left py-3 px-4 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-gray-300">
                    Loading checkpoints...
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-red-300">
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && filteredCheckpoints.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-gray-300">
                    No checkpoints found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                filteredCheckpoints.map((checkpoint) => (
                <tr key={checkpoint._id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-4 font-medium text-white">{checkpoint.name}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        checkpoint.isDeleted
                          ? 'bg-red-900 text-red-200'
                          : 'bg-green-900 text-green-200'
                      }`}
                    >
                      {checkpoint.isDeleted ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {checkpoint.admin_id ? (
                      <div className="space-y-1">
                        <p className="text-xs text-white">
                          {checkpoint.admin_id.rank} {checkpoint.admin_id.name}
                        </p>
                      </div>
                    ) : (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{checkpoint.users.length}</td>
                  <td className="py-3 px-4 text-gray-300">{new Date(checkpoint.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    {checkpoint.admin_id ? (
                      <button
                        onClick={() =>
                          handleRemoveAdmin(checkpoint._id, checkpoint.admin_id?.serviceNumber ?? '')
                        }
                        disabled={isAdminActionLoading}
                        className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                        title="Remove admin"
                        aria-label={`Remove admin from ${checkpoint.name}`}
                      >
                        <UserX className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenAssignAdminModal(checkpoint._id, checkpoint.name)}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
                        title="Add admin"
                        aria-label={`Add admin to ${checkpoint.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div ref={loadMoreRef} className="h-2" />

          {isLoadingMore && (
            <div className="py-4 text-center text-sm text-gray-400">
              Loading more checkpoints...
            </div>
          )}

          {!isLoading && !isLoadingMore && !nextCursor && checkpoints.length > 0 && (
            <div className="py-4 text-center text-xs text-gray-500">
              You have reached the end of the checkpoint list.
            </div>
          )}
        </div>
      </div>

      {showAdminModal && selectedCheckpoint && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Assign Checkpoint Admin</h3>
              <p className="text-sm text-gray-400 mt-1">Checkpoint: {selectedCheckpoint.name}</p>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={adminSearchTerm}
                  onChange={(e) => setAdminSearchTerm(e.target.value)}
                  placeholder="Search admin by name, service number, or rank"
                  className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
                {isCheckpointAdminsLoading && checkpointAdmins.length === 0 && (
                  <div className="text-sm text-gray-400 py-4 text-center">Loading checkpoint admins...</div>
                )}

                {!isCheckpointAdminsLoading && filteredCheckpointAdmins.length === 0 && (
                  <div className="text-sm text-gray-400 py-4 text-center">No matching checkpoint admins found.</div>
                )}

                {filteredCheckpointAdmins.map((admin) => (
                  <div
                    key={admin._id}
                    className="bg-gray-700/60 border border-gray-600 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{admin.rank} {admin.name}</p>
                      <p className="text-xs text-gray-400">{admin.serviceNumber}</p>
                    </div>
                    <button
                      onClick={() => handleSelectCheckpointAdmin(admin.serviceNumber)}
                      disabled={isAdminActionLoading}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAdminActionLoading ? 'Assigning...' : 'Select'}
                    </button>
                  </div>
                ))}

                <div ref={adminLoadMoreRef} className="h-2" />

                {isCheckpointAdminsLoadingMore && (
                  <div className="text-xs text-gray-400 text-center py-2">Loading more admins...</div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={handleCloseAssignAdminModal}
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

export default ManageCheckpoints;