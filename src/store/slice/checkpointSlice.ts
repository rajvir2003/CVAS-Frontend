import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../api';

export interface Checkpoint {
	_id: string;
	name: string;
	isDeleted: boolean;
	users: string[];
	createdAt: string;
	updatedAt: string;
	__v: number;
	admin_id?: {
		_id: string;
		serviceNumber: string;
		name: string;
		rank: string;
		role: string;
	} | null;
}

interface GetCheckpointsResponse {
	success: boolean;
	message: string;
	checkpoints: Checkpoint[];
	nextCursor: string | null;
}

interface CreateCheckpointPayload {
	name: string;
}

interface CreateCheckpointResponse {
	success: boolean;
	message: string;
	checkpoint: Checkpoint;
}

interface CheckpointUser {
	_id: string;
	serviceNumber: string;
	name: string;
	rank: string;
	role: string;
	checkpoint: string;
}

interface CurrentCheckpoint {
	_id: string;
	name: string;
	isDeleted: boolean;
	users: CheckpointUser[];
	createdAt: string;
	updatedAt: string;
	__v: number;
	admin_id?: string | null;
}

interface GetCurrentCheckpointResponse {
	success: boolean;
	message: string;
	checkpoint: CurrentCheckpoint;
}

interface FetchCheckpointsParams {
	cursor?: string | null;
	limit?: number;
}

type CheckpointAdminAction = 'assign' | 'remove';
type CheckpointWorkerAction = 'assign' | 'remove';

interface CheckpointAdminUser {
	_id: string;
	serviceNumber: string;
	name: string;
	rank: string;
	role: string;
	checkpoint: string;
	__v: number;
}

interface UpdateCheckpointAdminPayload {
	checkpointId: string;
	serviceNumber: string;
	action: CheckpointAdminAction;
}

interface UpdateCheckpointAdminResponse {
	success: boolean;
	message: string;
	checkpoint_admin: CheckpointAdminUser | null;
}

interface UpdateCheckpointWorkerPayload {
	serviceNumber: string;
	action: CheckpointWorkerAction;
}

interface UpdateCheckpointWorkerResponse {
	success: boolean;
	message: string;
	worker: CheckpointUser | null;
}

interface CheckpointState {
	checkpoints: Checkpoint[];
	currentCheckpoint: CurrentCheckpoint | null;
	nextCursor: string | null;
	message: string | null;
	isLoading: boolean;
	isLoadingMore: boolean;
	isAdminActionLoading: boolean;
	isWorkerActionLoading: boolean;
	isCurrentCheckpointLoading: boolean;
	lastFetchedAt: number | null;
	error: string | null;
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as
			| {
				  message?: string | string[];
				  error?: string;
				  errors?: Array<{ message?: string; msg?: string } | string>;
			  }
			| undefined;

		if (typeof data === 'string') {
			return data;
		}

		if (Array.isArray(data?.message)) {
			return data.message.join(', ');
		}

		if (typeof data?.message === 'string' && data.message.trim()) {
			return data.message;
		}

		if (typeof data?.error === 'string' && data.error.trim()) {
			return data.error;
		}

		if (Array.isArray(data?.errors) && data.errors.length > 0) {
			const combined = data.errors
				.map((item) => {
					if (typeof item === 'string') {
						return item;
					}

					return item.message ?? item.msg ?? '';
				})
				.filter(Boolean)
				.join(', ');

			if (combined) {
				return combined;
			}
		}

		if (error.message) {
			return error.message;
		}
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return fallback;
};

const initialState: CheckpointState = {
	checkpoints: [],
	currentCheckpoint: null,
	nextCursor: null,
	message: null,
	isLoading: false,
	isLoadingMore: false,
	isAdminActionLoading: false,
	isWorkerActionLoading: false,
	isCurrentCheckpointLoading: false,
	lastFetchedAt: null,
	error: null,
};

export const fetchCheckpoints = createAsyncThunk<
	GetCheckpointsResponse,
	FetchCheckpointsParams | undefined,
	{ rejectValue: string }
>('checkpoint/fetchCheckpoints', async (params, { rejectWithValue }) => {
	try {
		const query = new URLSearchParams();

		if (params?.cursor) {
			query.append('cursor', params.cursor);
		}

		if (typeof params?.limit === 'number') {
			query.append('limit', String(params.limit));
		}

		const response = await api.get<GetCheckpointsResponse>(
			`/checkpoints${query.toString() ? `?${query.toString()}` : ''}`
		);

		if (response.data?.success) {
			return response.data;
		}

		return rejectWithValue(response.data?.message ?? 'Failed to fetch checkpoints.');
	} catch (error: unknown) {
		return rejectWithValue(extractErrorMessage(error, 'Failed to fetch checkpoints.'));
	}
});

export const createCheckpoint = createAsyncThunk<
	CreateCheckpointResponse,
	CreateCheckpointPayload,
	{ rejectValue: string }
>('checkpoint/createCheckpoint', async (payload, { rejectWithValue }) => {
	try {
		const response = await api.post<CreateCheckpointResponse>('/checkpoints/create', {
			name: payload.name,
		});

		if (response.data?.success) {
			return response.data;
		}

		return rejectWithValue(response.data?.message ?? 'Failed to create checkpoint.');
	} catch (error: unknown) {
		return rejectWithValue(extractErrorMessage(error, 'Failed to create checkpoint.'));
	}
});

export const updateCheckpointAdmin = createAsyncThunk<
	UpdateCheckpointAdminResponse,
	UpdateCheckpointAdminPayload,
	{ rejectValue: string }
>('checkpoint/updateCheckpointAdmin', async (payload, { rejectWithValue }) => {
	try {
		const response = await api.patch<UpdateCheckpointAdminResponse>(
			`/checkpoints/${payload.checkpointId}/admin`,
			{
				serviceNumber: payload.serviceNumber,
				action: payload.action,
			}
		);

		if (response.data?.success) {
			return response.data;
		}

		return rejectWithValue(response.data?.message ?? 'Failed to update checkpoint admin.');
	} catch (error: unknown) {
		return rejectWithValue(extractErrorMessage(error, 'Failed to update checkpoint admin.'));
	}
});

export const updateCheckpointWorker = createAsyncThunk<
	UpdateCheckpointWorkerResponse,
	UpdateCheckpointWorkerPayload,
	{ rejectValue: string; state: { auth: { checkpointId: string | null } } }
>('checkpoint/updateCheckpointWorker', async (payload, { getState, rejectWithValue }) => {
	const checkpointId = getState().auth.checkpointId;

	if (!checkpointId) {
		console.error('updateCheckpointWorker rejected response:', {
			message: 'No checkpoint is assigned to the current user.',
		});
		return rejectWithValue('No checkpoint is assigned to the current user.');
	}

	try {
		const response = await api.patch<UpdateCheckpointWorkerResponse>(
			`/checkpoints/${checkpointId}/workers`,
			{
				serviceNumber: payload.serviceNumber,
				action: payload.action,
			}
		);

		if (response.data?.success) {
			return response.data;
		}

		console.error('updateCheckpointWorker rejected response:', response.data);

		return rejectWithValue(response.data?.message ?? 'Failed to update checkpoint worker.');
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			console.error('updateCheckpointWorker rejected response:', {
				status: error.response?.status,
				data: error.response?.data,
				headers: error.response?.headers,
				error,
			});
		} else {
			console.error('updateCheckpointWorker rejected response:', error);
		}

		return rejectWithValue(extractErrorMessage(error, 'Failed to update checkpoint worker.'));
	}
});

export const fetchCurrentUserCheckpoint = createAsyncThunk<
	GetCurrentCheckpointResponse,
	void,
	{ rejectValue: string; state: { auth: { checkpointId: string | null } } }
>('checkpoint/fetchCurrentUserCheckpoint', async (_, { getState, rejectWithValue }) => {
	const checkpointId = getState().auth.checkpointId;

	if (!checkpointId) {
		return rejectWithValue('No checkpoint is assigned to the current user.');
	}

	try {
		const response = await api.get<GetCurrentCheckpointResponse>(`/checkpoints`);

		if (response.data?.success) {
			return response.data;
		}

		return rejectWithValue(response.data?.message ?? 'Failed to fetch checkpoint details.');
	} catch (error: unknown) {
		return rejectWithValue(extractErrorMessage(error, 'Failed to fetch checkpoint details.'));
	}
});

const checkpointSlice = createSlice({
	name: 'checkpoint',
	initialState,
	reducers: {
		clearCheckpointError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(createCheckpoint.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(createCheckpoint.fulfilled, (state, action) => {
				state.isLoading = false;
				state.error = null;
				state.message = action.payload.message;

				const exists = state.checkpoints.some(
					(checkpoint) => checkpoint._id === action.payload.checkpoint._id
				);

				if (!exists) {
					state.checkpoints = [action.payload.checkpoint, ...state.checkpoints];
				}
			})
			.addCase(createCheckpoint.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload ?? 'Failed to create checkpoint.';
			})
			.addCase(fetchCheckpoints.pending, (state, action) => {
				const isLoadMore = Boolean(action.meta.arg?.cursor);

				if (isLoadMore) {
					state.isLoadingMore = true;
				} else {
					state.isLoading = true;
				}

				state.error = null;
			})
			.addCase(fetchCheckpoints.fulfilled, (state, action) => {
				const isLoadMore = Boolean(action.meta.arg?.cursor);

				state.isLoading = false;
				state.isLoadingMore = false;
				state.error = null;
				state.message = action.payload.message;

				if (isLoadMore) {
					const existingIds = new Set(state.checkpoints.map((checkpoint) => checkpoint._id));
					const incoming = action.payload.checkpoints.filter(
						(checkpoint) => !existingIds.has(checkpoint._id)
					);

					state.checkpoints = [...state.checkpoints, ...incoming];
				} else {
					state.checkpoints = action.payload.checkpoints;
				}

				state.nextCursor = action.payload.nextCursor;
				state.lastFetchedAt = Date.now();
			})
			.addCase(fetchCheckpoints.rejected, (state, action) => {
				state.isLoading = false;
				state.isLoadingMore = false;
				state.error = action.payload ?? 'Failed to fetch checkpoints.';
			})
			.addCase(updateCheckpointAdmin.pending, (state) => {
				state.isAdminActionLoading = true;
				state.error = null;
			})
			.addCase(updateCheckpointAdmin.fulfilled, (state, action) => {
				state.isAdminActionLoading = false;
				state.error = null;
				state.message = action.payload.message;

				const checkpointId = action.meta.arg.checkpointId;
				const actionType = action.meta.arg.action;

				state.checkpoints = state.checkpoints.map((checkpoint) => {
					if (checkpoint._id !== checkpointId) {
						return checkpoint;
					}

					if (actionType === 'remove') {
						return { ...checkpoint, admin_id: null };
					}

					if (action.payload.checkpoint_admin) {
						const { _id, serviceNumber, name, rank, role } = action.payload.checkpoint_admin;

						return {
							...checkpoint,
							admin_id: {
								_id,
								serviceNumber,
								name,
								rank,
								role,
							},
						};
					}

					return checkpoint;
				});
			})
			.addCase(updateCheckpointAdmin.rejected, (state, action) => {
				state.isAdminActionLoading = false;
				state.error = action.payload ?? 'Failed to update checkpoint admin.';
			})
			.addCase(updateCheckpointWorker.pending, (state) => {
				state.isWorkerActionLoading = true;
				state.error = null;
			})
			.addCase(updateCheckpointWorker.fulfilled, (state, action) => {
				state.isWorkerActionLoading = false;
				state.error = null;
				state.message = action.payload.message;

				if (!state.currentCheckpoint) {
					return;
				}

				if (action.meta.arg.action === 'remove') {
					state.currentCheckpoint.users = state.currentCheckpoint.users.filter(
						(user) => user.serviceNumber !== action.meta.arg.serviceNumber
					);
					return;
				}

				if (action.payload.worker) {
					const exists = state.currentCheckpoint.users.some(
						(user) => user._id === action.payload.worker?._id
					);

					if (!exists) {
						state.currentCheckpoint.users.push(action.payload.worker);
					}
				}
			})
			.addCase(updateCheckpointWorker.rejected, (state, action) => {
				state.isWorkerActionLoading = false;
				state.error = action.payload ?? 'Failed to update checkpoint worker.';
			})
			.addCase(fetchCurrentUserCheckpoint.pending, (state) => {
				state.isCurrentCheckpointLoading = true;
				state.error = null;
			})
			.addCase(fetchCurrentUserCheckpoint.fulfilled, (state, action) => {
				state.isCurrentCheckpointLoading = false;
				state.error = null;
				state.message = action.payload.message;
				state.currentCheckpoint = action.payload.checkpoint;
			})
			.addCase(fetchCurrentUserCheckpoint.rejected, (state, action) => {
				state.isCurrentCheckpointLoading = false;
				state.error = action.payload ?? 'Failed to fetch checkpoint details.';
			});
	},
});

export const { clearCheckpointError } = checkpointSlice.actions;

export default checkpointSlice.reducer;
