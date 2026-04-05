import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
import api from '../../api';

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    serviceNumber: string | null;
    rank: string | null;
    fullName: string | null;
    unit: string | null;
    role: string | null;
    checkpointId: string | null;
    checkpointName: string | null;
    token: string | null;
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
    token: string;
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

const storedToken = Cookies.get('cvas_token') ?? null;
const storedUser = getStoredUser();

const initialState: AuthState = {
    isAuthenticated: Boolean(storedToken && storedUser),
    isLoading: false,
    error: null,
    serviceNumber: storedUser?.serviceNumber ?? null,
    rank: storedUser?.rank ?? null,
    fullName: storedUser?.fullName ?? storedUser?.name ?? null,
    unit: storedUser?.unit ?? null,
    role: storedUser?.role ?? null,
    checkpointId: storedUser?.checkpoint ?? storedUser?.checkpointId ?? null,
    checkpointName: storedUser?.checkpointName ?? null,
    token: storedToken,
};

export const registerUser = createAsyncThunk<
    RegisterResponse,
    RegisterPayload,
    { rejectValue: string }
>(
    'auth/registerUser',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post<RegisterResponse>('/auth/register', payload);
            console.log(response)
            if (response.data?.success) {
                return response.data;
            }

            return rejectWithValue(response.data?.message ?? 'Registration failed.');
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Registration failed.'));
        }
    }
);

export const loginUser = createAsyncThunk<
    LoginResponse,
    LoginPayload,
    { rejectValue: string }
>(
    'auth/loginUser',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post<LoginResponse>('/auth/login', payload);

            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, 'Invalid credentials.'));
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            Cookies.remove('cvas_token');
            localStorage.removeItem('cvas_user');

            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
            state.serviceNumber = null;
            state.rank = null;
            state.fullName = null;
            state.unit = null;
            state.role = null;
            state.checkpointId = null;
            state.checkpointName = null;
            state.token = null;
        },
        clearAuthError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                const { serviceNumber, rank, name, role } = action.payload;

                state.isLoading = false;
                state.error = null;
                state.serviceNumber = serviceNumber;
                state.rank = rank;
                state.fullName = name;
                state.role = role;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload ?? 'Registration failed.';
            })
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                const { token, user } = action.payload;

                Cookies.set('cvas_token', token, {
                    expires: 7,
                    secure: true,
                    sameSite: 'strict',
                });
                localStorage.setItem('cvas_user', JSON.stringify(user));

                state.isAuthenticated = true;
                state.isLoading = false;
                state.error = null;
                state.serviceNumber = user.serviceNumber ?? null;
                state.rank = user.rank ?? null;
                state.fullName = user.fullName ?? user.name ?? null;
                state.unit = user.unit ?? null;
                state.role = user.role ?? null;
                state.checkpointId = user.checkpoint ?? user.checkpointId ?? null;
                state.checkpointName = user.checkpointName ?? null;
                state.token = token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload ?? 'Invalid credentials.';
            });
    },
});

export const { logout, clearAuthError } = authSlice.actions;

export default authSlice.reducer;
