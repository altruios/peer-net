import { configureStore,getDefaultMiddleware } from '@reduxjs/toolkit';
import peerSlice from './slices/peerSlice';
import postSlice from './slices/postSlice';
import appSlice from './slices/appSlice';
export default configureStore({
  reducer: {
      peers:peerSlice,
      
      posts:postSlice,
      app:appSlice,
},
middleware: getDefaultMiddleware(),
});
