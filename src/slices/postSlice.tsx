import { createSlice } from '@reduxjs/toolkit';
export const postSlice = createSlice({
    name: "posts",
    initialState: [
        { title: "",text:"",imgUrl:"",link:"",tags:"",vote:0}
    ],
    reducers: {
        addPost: (state, action) => {
            state.push(action.payload.post);

            return state;
        },
        removePost: (state, action) => {
            return state.filter(x => x.link !== action.payload.link);
        },
        updatePostVote: (state, action) => {
            const found = state.find(x => x.link == action.payload.link);
            if (found) {
                found.vote = action.payload.vote;
            }
            return state;
        },
        updateFeed:(state, action)=>{
            const feed = action.payload.feed;
            
            const next:any[]= Array.from(new Set([...state,...feed]))
            return next;

        }
    },
});
export const { addPost, removePost,updatePostVote,updateFeed } = postSlice.actions;
export const selectPosts = (state: any) => {
    return state.posts;
}
export const selectSavedPosts = (state: any) => {
    return state.posts.filter((x:any)=>x.vote>0);
}
export const selectFilteredPosts = (state: any) => {
    return state.posts.filter((x:any)=>x.vote<0);
}
export const selectToVotePosts = (state: any) => {
    return state.posts.filter((x:any)=>x.vote!=0);
}
export default postSlice.reducer;
