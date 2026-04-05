import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../api';

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    isCheckpointAdminsLoading: boolean;
    isCheckpointAdminsLoadingMore: boolean;
    error: string | null;
    errorMessages: string[];
    serviceNumber: string | null;
    rank: string | null;
    fullName: string | null;
    unit: string | null;
    role: string | null;
    checkpointId: string | null;
    checkpointName: string | null;
    token: string | null;
    checkpointAdmins: CheckpointAdmin[];
    checkpointAdminsNextCursor: string | null;
}

interface RegisterPayload {
    serviceNumber: string;
    rank: string;
    name: string;
    unit: string;
    password: string;
    role: string;
}

interface LoginPayload {
    serviceNumber: string;
    password: string;
}

interface AuthUser {
    serviceNumber?: string;
    fullName?: string;
    name?: string;
    rank?: string;
    unit?: string;
    role?: string;
    checkpoint?: string;
    checkpointId?: string;
    checkpointName?: string;
}

interface LoginResponse {
    success: boolean;
    message: string;
    token?: string;
    user: AuthUser;
}

interface RegisterResponse {
    success: boolean;
    message: string;
    serviceNumber: string;
    rank: string;
    name: string;
    role: string;
}

interface CheckpointAdmin {
    _id: string;
    serviceNumber: string;
    rank: string;
    checkpoint: string | null;
    name: string;
    unit: string;
    isDeleted: boolean;
    role: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface FetchCheckpointAdminsParams {
    cursor?: string | null;
    limit?: number;
}

interface FetchCheckpointAdminsResponse {
    success: boolean;
    message: string;
    adminList: CheckpointAdmin[];
    nextCursor: string | null;
}

const extractErrorMessages = (error: unknown, fallback: string): string[] => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as
            | {
                  message?: string | string[];
                  error?: string;
                  errors?: Array<{ message?: string; msg?: string } | string>;
                  validationErrors?: Array<{ field?: string; message?: string }>;
              }
            | undefined;

        if (typeof data === 'string') {
            return [data];
        }

        if (Array.isArray(data?.message)) {
            const messages = data.message.filter((item) => Boolean(item?.trim()));

            if (messages.length > 0) {
                return messages;
            }
        }

        if (typeof data?.message === 'string' && data.message.trim()) {
            return [data.message];
        }

        if (typeof data?.error === 'string' && data.error.trim()) {
            if (Array.isArray(data.validationErrors) && data.validationErrors.length > 0) {
                const validationMessages = data.validationErrors
                    .map((item) => item.message ?? '')
                    .filter((item) => item.trim().length > 0);

                if (validationMessages.length > 0) {
                    return validationMessages;
                }
            }

            return [data.error];
        }

        if (Array.isArray(data?.errors) && data.errors.length > 0) {
            const combined = data.errors
                .map((item) => {
                    if (typeof item === 'string') {
                        return item;
                    }

                    return item.message ?? item.msg ?? '';
                })
                .filter((item) => Boolean(item));

            if (combined.length > 0) {
                return combined;
            }
        }

        if (error.message) {
            return [error.message];
        }
    }

    if (error instanceof Error && error.message) {
        return [error.message];
    }

    return [fallback];
};

const getStoredUser = (): AuthUser | null => {
    const raw = localStorage.getItem('cvas_user');
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        localStorage.removeItem('cvas_user');
        return null;
    }
};

const storedUser = getStoredUser();

const initialState: AuthState = {
    isAuthenticated: Boolean(storedUser),
    isLoading: false,
    isCheckpointAdminsLoading: false,
    isCheckpointAdminsLoadingMore: false,
    error: null,
    errorMessages: [],
    serviceNumber: storedUser?.serviceNumber ?? null,
    rank: storedUser?.rank ?? null,
    fullName: storedUser?.fullName ?? storedUser?.name ?? null,
    unit: storedUser?.unit ?? null,
    role: storedUser?.role ?? null,
    checkpointId: storedUser?.checkpoint ?? storedUser?.checkpointId ?? null,
    checkpointName: storedUser?.checkpointName ?? null,
    token: null,
    checkpointAdmins: [],
    checkpointAdminsNextCursor: null,
};

export const registerUser = createAsyncThunk<
    RegisterResponse,
    RegisterPayload,
    { rejectValue: string[] }
>(
    'auth/registerUser',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post<RegisterResponse>('/auth/register', payload);
            if (response.data?.success) {
                return response.data;
            }

            return rejectWithValue([response.data?.message ?? 'Registration failed.']);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessages(error, 'Registration failed.'));
        }
    }
);

export const loginUser = createAsyncThunk<
    LoginResponse,
    LoginPayload,
    { rejectValue: string[] }
>(
    'auth/loginUser',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post<LoginResponse>('/auth/login', payload);

            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessages(error, 'Invalid credentials.'));
        }
    }
);

export const fetchCheckpointAdmins = createAsyncThunk<
    FetchCheckpointAdminsResponse,
    FetchCheckpointAdminsParams | undefined,
    { rejectValue: string[] }
>(
    'auth/fetchCheckpointAdmins',
    async (params, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams();

            if (params?.cursor) {
                query.append('cursor', params.cursor);
            }

            if (typeof params?.limit === 'number') {
                query.append('limit', String(params.limit));
            }

            const response = await api.get<FetchCheckpointAdminsResponse>(
                `/auth/checkpoint-admins${query.toString() ? `?${query.toString()}` : ''}`
            );

            if (response.data?.success) {
                return response.data;
            }

            return rejectWithValue([response.data?.message ?? 'Failed to fetch checkpoint admins.']);
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessages(error, 'Failed to fetch checkpoint admins.'));
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('cvas_user');

            state.isAuthenticated = false;
            state.isLoading = false;
            state.isCheckpointAdminsLoading = false;
            state.isCheckpointAdminsLoadingMore = false;
            state.error = null;
            state.errorMessages = [];
            state.serviceNumber = null;
            state.rank = null;
            state.fullName = null;
            state.unit = null;
            state.role = null;
            state.checkpointId = null;
            state.checkpointName = null;
            state.token = null;
            state.checkpointAdmins = [];
            state.checkpointAdminsNextCursor = null;
        },
        clearAuthError: (state) => {
            state.error = null;
            state.errorMessages = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.errorMessages = [];
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                const { serviceNumber, rank, name, role } = action.payload;

                state.isLoading = false;
                state.error = null;
                state.errorMessages = [];
                state.serviceNumber = serviceNumber;
                state.rank = rank;
                state.fullName = name;
                state.role = role;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.errorMessages = action.payload ?? ['Registration failed.'];
                state.error = state.errorMessages[0] ?? 'Registration failed.';
            })
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.errorMessages = [];
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                const { token, user } = action.payload;
                localStorage.setItem('cvas_user', JSON.stringify(user));

                state.isAuthenticated = true;
                state.isLoading = false;
                state.error = null;
                state.errorMessages = [];
                state.serviceNumber = user.serviceNumber ?? null;
                state.rank = user.rank ?? null;
                state.fullName = user.fullName ?? user.name ?? null;
                state.unit = user.unit ?? null;
                state.role = user.role ?? null;
                state.checkpointId = user.checkpoint ?? user.checkpointId ?? null;
                state.checkpointName = user.checkpointName ?? null;
                state.token = token ?? null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.errorMessages = action.payload ?? ['Invalid credentials.'];
                state.error = state.errorMessages[0] ?? 'Invalid credentials.';
            })
            .addCase(fetchCheckpointAdmins.pending, (state, action) => {
                const isLoadMore = Boolean(action.meta.arg?.cursor);

                if (isLoadMore) {
                    state.isCheckpointAdminsLoadingMore = true;
                } else {
                    state.isCheckpointAdminsLoading = true;
                }

                state.error = null;
                state.errorMessages = [];
            })
            .addCase(fetchCheckpointAdmins.fulfilled, (state, action) => {
                const isLoadMore = Boolean(action.meta.arg?.cursor);

                state.isCheckpointAdminsLoading = false;
                state.isCheckpointAdminsLoadingMore = false;
                state.error = null;
                state.errorMessages = [];

                if (isLoadMore) {
                    const existingIds = new Set(state.checkpointAdmins.map((admin) => admin._id));
                    const incoming = action.payload.adminList.filter(
                        (admin) => !existingIds.has(admin._id)
                    );

                    state.checkpointAdmins = [...state.checkpointAdmins, ...incoming];
                } else {
                    state.checkpointAdmins = action.payload.adminList;
                }

                state.checkpointAdminsNextCursor = action.payload.nextCursor;
            })
            .addCase(fetchCheckpointAdmins.rejected, (state, action) => {
                state.isCheckpointAdminsLoading = false;
                state.isCheckpointAdminsLoadingMore = false;
                state.errorMessages = action.payload ?? ['Failed to fetch checkpoint admins.'];
                state.error = state.errorMessages[0] ?? 'Failed to fetch checkpoint admins.';
            });
    },
});

export const { logout, clearAuthError } = authSlice.actions;

export default authSlice.reducer;
