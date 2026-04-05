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

interface FetchCheckpointsParams {
	cursor?: string | null;
	limit?: number;
}

type CheckpointAdminAction = 'assign' | 'remove';

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

interface CheckpointState {
	checkpoints: Checkpoint[];
	nextCursor: string | null;
	message: string | null;
	isLoading: boolean;
	isLoadingMore: boolean;
	isAdminActionLoading: boolean;
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
	nextCursor: null,
	message: null,
	isLoading: false,
	isLoadingMore: false,
	isAdminActionLoading: false,
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
			});
	},
});

export const { clearCheckpointError } = checkpointSlice.actions;

export default checkpointSlice.reducer;
