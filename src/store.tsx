import { configureStore,getDefaultMiddleware } from '@reduxjs/toolkit';
import peerSlice from './slices/peerSlice';
import postSlice from './slices/postSlice';
export default configureStore({
  reducer: {
    peers:peerSlice,
    posts:postSlice
},
middleware: getDefaultMiddleware(),
});
