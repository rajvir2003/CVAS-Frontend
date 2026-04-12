import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../api';

interface CreateVehiclePayload {
  loadClass: string;
  loadType: string;
  regNo: string;
  remarks: string;
  image: File;
}

interface CreateVehicleResponse {
  success: boolean;
  message: string;
}

export interface Vehicle {
  _id: string;
  user: string;
  loadClass: string;
  loadType: string;
  regNo: string;
  imageUri: string;
  imageName: string;
  remarks: string;
  delete: boolean;
  checkpointId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ListVehiclesPayload {
  cursor?: string | null;
  limit?: number;
  append?: boolean;
}

interface ListVehiclesResponse {
  success: boolean;
  message: string;
  data: Vehicle[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface ListVehiclesResult {
  success: boolean;
  message: string;
  data: Vehicle[];
  nextCursor: string | null;
  hasMore: boolean;
  append: boolean;
}

interface VehicleState {
  isCreating: boolean;
  message: string | null;
  error: string | null;
  vehicles: Vehicle[];
  isListing: boolean;
  isFetchingMore: boolean;
  listMessage: string | null;
  listError: string | null;
  nextCursor: string | null;
  hasMore: boolean;
}

const initialState: VehicleState = {
  isCreating: false,
  message: null,
  error: null,
  vehicles: [],
  isListing: false,
  isFetchingMore: false,
  listMessage: null,
  listError: null,
  nextCursor: null,
  hasMore: false,
};

const mergeVehicles = (existing: Vehicle[], incoming: Vehicle[]): Vehicle[] => {
  const byId = new Map<string, Vehicle>();

  for (const vehicle of existing) {
    byId.set(vehicle._id, vehicle);
  }

  for (const vehicle of incoming) {
    byId.set(vehicle._id, vehicle);
  }

  return Array.from(byId.values());
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string | string[];
          error?: string;
          validationErrors?: Array<{ field?: string; message?: string }>;
          errors?: Array<{ message?: string; msg?: string } | string>;
        }
      | undefined;

    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data?.message)) {
      const combined = data.message.filter(Boolean).join(', ');
      if (combined) {
        return combined;
      }
    }

    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }

    if (typeof data?.error === 'string' && data.error.trim()) {
      return data.error;
    }

    if (Array.isArray(data?.validationErrors) && data.validationErrors.length > 0) {
      const combined = data.validationErrors
        .map((item) => item.message ?? '')
        .filter((item) => item.trim().length > 0)
        .join(', ');

      if (combined) {
        return combined;
      }
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

export const createVehicle = createAsyncThunk<
  CreateVehicleResponse,
  CreateVehiclePayload,
  { rejectValue: string }
>('vehicle/createVehicle', async (payload, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('loadClass', payload.loadClass);
    formData.append('loadType', payload.loadType);
    formData.append('regNo', payload.regNo);
    formData.append('remarks', payload.remarks);
    formData.append('image', payload.image);

    console.log('createVehicle request payload:', {
      loadClass: payload.loadClass,
      loadType: payload.loadType,
      regNo: payload.regNo,
      remarks: payload.remarks,
      imageName: payload.image?.name,
      imageType: payload.image?.type,
    });

    const response = await api.post<CreateVehicleResponse>('/vehicle/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('createVehicle success response:', response.data);

    if (response.data?.success) {
      return response.data;
    }

    return rejectWithValue(response.data?.message ?? 'Failed to create vehicle entry.');
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('createVehicle error response:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    } else {
      console.error('createVehicle error response:', error);
    }

    return rejectWithValue(extractErrorMessage(error, 'Failed to create vehicle entry.'));
  }
});

export const listVehicles = createAsyncThunk<
  ListVehiclesResult,
  ListVehiclesPayload | undefined,
  { rejectValue: string; state: { auth: { checkpointId: string | null; role: string | null } } }
>('vehicle/listVehicles', async (payload, { rejectWithValue, getState }) => {
  try {
    const state = getState();
    const checkpointId = state.auth.checkpointId;
    const role = state.auth.role;

    const cursor = payload?.cursor ?? undefined;
    const limit = payload?.limit;
    const append = Boolean(payload?.append);

    const params: Record<string, string | number> = {};

    if (cursor) {
      params.cursor = cursor;
    }

    if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
      params.limit = limit;
    }

    // For checkpoint admins and workers, filter by their checkpoint
    if (checkpointId && role && role !== 'SUPER ADMIN') {
      params.checkpointId = checkpointId;
    }

    console.log('listVehicles request - params:', params, '- role:', role, '- checkpointId:', checkpointId);

    const response = await api.get<ListVehiclesResponse>('/vehicle/', {
      params,
    });

    console.log('listVehicles success response:', response.data);

    if (response.data?.success) {
      return {
        ...response.data,
        append,
      };
    }

    console.error('listVehicles response not successful:', response.data);
    return rejectWithValue(response.data?.message ?? 'Failed to fetch vehicles.');
  } catch (error: unknown) {
    console.error('listVehicles error:', error);
    if (axios.isAxiosError(error)) {
      console.error('listVehicles axios error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }
    return rejectWithValue(extractErrorMessage(error, 'Failed to fetch vehicles.'));
  }
});

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {
    clearVehicleState: (state) => {
      state.error = null;
      state.message = null;
    },
    resetVehicleList: (state) => {
      state.vehicles = [];
      state.nextCursor = null;
      state.hasMore = false;
      state.listError = null;
      state.listMessage = null;
      state.isListing = false;
      state.isFetchingMore = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createVehicle.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.isCreating = false;
        state.error = null;
        state.message = action.payload.message;
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload ?? 'Failed to create vehicle entry.';
      })
      .addCase(listVehicles.pending, (state, action) => {
        const append = Boolean(action.meta.arg?.append);

        state.listError = null;
        state.listMessage = null;
        state.isListing = !append;
        state.isFetchingMore = append;

        if (!append) {
          state.vehicles = [];
          state.nextCursor = null;
          state.hasMore = false;
        }
      })
      .addCase(listVehicles.fulfilled, (state, action) => {
        const { append, data, message, nextCursor, hasMore } = action.payload;

        state.isListing = false;
        state.isFetchingMore = false;
        state.listError = null;
        state.listMessage = message;
        state.nextCursor = nextCursor;
        state.hasMore = hasMore;
        state.vehicles = append ? mergeVehicles(state.vehicles, data) : data;
      })
      .addCase(listVehicles.rejected, (state, action) => {
        state.isListing = false;
        state.isFetchingMore = false;
        state.listError = action.payload ?? 'Failed to fetch vehicles.';
      });
  },
});

export const { clearVehicleState, resetVehicleList } = vehicleSlice.actions;

export default vehicleSlice.reducer;
