import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice"
import checkpointReducer from "./slice/checkpointSlice"
import vehicleReducer from "./slice/vehicleSlice"
export const store = configureStore({
    reducer : {
        auth : authReducer,
        checkpoint : checkpointReducer,
        vehicle : vehicleReducer
    },
    devTools : import.meta.env.MODE != 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch