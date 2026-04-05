import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice"
import checkpointReducer from "./slice/checkpointSlice"
export const store = configureStore({
    reducer : {
        auth : authReducer,
        checkpoint : checkpointReducer
    },
    devTools : import.meta.env.MODE != 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch