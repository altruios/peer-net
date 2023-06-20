import { createSlice } from '@reduxjs/toolkit';
export const appSlice = createSlice({
    name: "app",
    initialState: 
        { 
            mode: "dark",
            id:import.meta.env.VITE_PEERID||`peer-${crypto.randomUUID()}`,
        }
    ,
    reducers: {
        
        changeMode:(state,action)=>{
            state.mode=action.payload =="dark"?"light":"dark";
            return state 
        },
    }
});
export const { changeMode } = appSlice.actions;
export const selectMode = (state: any) => {
    return state.app.mode;
}
export const selectID = (state: any) => {
    return state.app.id
}

export default appSlice.reducer;
