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

interface VehicleState {
  isCreating: boolean;
  message: string | null;
  error: string | null;
}

const initialState: VehicleState = {
  isCreating: false,
  message: null,
  error: null,
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

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {
    clearVehicleState: (state) => {
      state.error = null;
      state.message = null;
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
      });
  },
});

export const { clearVehicleState } = vehicleSlice.actions;

export default vehicleSlice.reducer;
