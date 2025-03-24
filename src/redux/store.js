import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore,persistReducer } from "redux-persist";
import localStorage from "redux-persist/es/storage";
import storage from "redux-persist/lib/storage"
import authReducer from "./slices/authSlice";

const rootReducer = combineReducers({
  auth: authReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
  debug: true, // Enable debug logging for redux-persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

const persistor = persistStore(store, null, () => {
  console.log("Persistor: State after rehydration:", store.getState());
});

export { store, persistor };