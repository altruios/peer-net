import { createSlice } from '@reduxjs/toolkit';
export const peerSlice = createSlice({
    name: "peers",
    initialState: [
        { peer: import.meta.env.VITE_PEER0, state: false , score:1}
    ],
    reducers: {
        addPeer: (state, action) => {
            state.push(action.payload);
            return state;
        },
        addNewPeers:(state, action)=>{
            const peers = action.payload.peers;
            const uniques = peers.filter((x:any)=>!state.some(conn=>conn.peer=x.peer));
            console.log("adding new peers",peers,uniques);
            return [...state,...uniques];
        },
        removePeer: (state, action) => {
            console.log("peer heard",action.payload);
            return state.filter(x => x.peer !== action.payload.peer);
        },
        updateStateOfPeer: (state, action) => {
            const found = state.find(x => x.peer == action.payload.peer);
            if (found) {
                found.state = action.payload.state;
            }
            return state;
        },
        updateScoreOfPeer:(state,action)=>{
            const found = state.find(x => x.peer == action.payload.peer);
            if (found) {
                found.score = action.payload.score;
            }
            return state;
        },
        hydratePeers:(state,action)=>{
            const peers = action.payload;
            const selfID = import.meta.env.VITE_PEERID; 
            const uniques = peers?.filter((x:any)=>!state.some(conn=>conn.peer==x.peer&&selfID!==conn.peer));

            return uniques
        },
    },
});
export const { addPeer, removePeer,updateStateOfPeer,updateScoreOfPeer,addNewPeers,hydratePeers} = peerSlice.actions;
export const selectPeers = (state: any) => {
    return state.peers;
}
export const selectActivePeers = (state: any) => {
    return state.peers.filter((x:any)=>x.state);
}
export const selectPeersWithConn = (state: any) => {
    return state.peers.filter((x:any)=>x.conn);
}
export const selectPeerByID = (key:any)=>(state:any)=>{
    return state.peers.filter(((x:any)=>x.peer==key))
}
export default peerSlice.reducer;
