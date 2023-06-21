import { createSlice } from '@reduxjs/toolkit';
import store from '../store';
export const peerSlice = createSlice({
    name: "peers",
    initialState: [
        { peer: import.meta.env.VITE_PEER0, connected: false , score:1}
    ],
    reducers: {
        addPeer: (state, action) => {
            state.push(action.payload);
            console.log("peer added in addPeer")
            return state;
        },
        addNewPeers:(state, action)=>{
            const peers = action.payload.peers;
            const uniques = peers.filter((x:any)=>!state.some(conn=>conn.peer==x.peer));
            const notSelf = uniques.filter((x:any)=>x.peer!=action.payload.id);
           console.log("adding new peers",notSelf);
            return [...state,...notSelf];
        },
        removePeer: (state, action) => {
            console.log("peer heard",action.payload);
            return state.filter(x => x.peer !== action.payload.peer);
        },
        updateStateOfPeer: (state, action) => {
            const found = state.find(x => x.peer == action.payload.peer);
            if (found) {
                found.connected = action.payload.connected;
            }
            return state;
        },
        updateScoreOfPeer:(state,action)=>{
            const found = state.find(x => x.peer == action.payload.peer.peer);
            console.log("score update");
            console.log(action.payload.peer,":is peer");
            if (found) {
                console.log("found",found)
                found.score = action.payload.score;
                
            }
            return state;
        },
        clearPeers:()=>{
            return [];
        },
        hydratePeers:(state,action)=>{
            const peers = action.payload;
            const selfID = import.meta.env.VITE_PEERID; 
            const uniques = peers?.filter((x:any)=>!state.some(conn=>conn.peer==x.peer&&selfID!==conn.peer));

            return uniques
        },
    },
});
export const { addPeer,clearPeers, removePeer,updateStateOfPeer,updateScoreOfPeer,addNewPeers,hydratePeers} = peerSlice.actions;
export const selectPeers = (state: any) => {
    return state.peers;
}

export const selectActivePeers = (state: any) => {
    return state.peers.filter((x:any)=>x.state);
}
export const selectPeersWithConn = (state: any) => {
    return state.peers.filter((x:any)=>x.conn);
}
export const selectUnScoredPeers = (state: any) => {
    return state.peers.filter((x:any)=>x.score==null||x.score==0||x.score==undefined);
}
export const selectScoredPeers = (state: any) => {
    return state.peers.filter((x:any)=>!(x.score==null||x.score==0||x.score==undefined));
}
export const selectSavedPeers = (state: any) => {
    return state.peers.filter((x:any)=>x.score==1);
}
export const selectAvoidPeers = (state: any) => {
    return state.peers.filter((x:any)=>x.score==-1);
}
export const selectPeerByID = (key:any)=>(state:any)=>{
    return state.peers.filter(((x:any)=>x.peer==key))
}
export const selectNotBlockedPeers = (state:any)=>{
    return state.peers.filter((x:any)=>x.score!=-1);
}
export default peerSlice.reducer;
