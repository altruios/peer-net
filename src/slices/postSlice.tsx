import { createSlice } from '@reduxjs/toolkit';
export const postSlice = createSlice({
    name: "posts",
    initialState: [
        { title: "",text:"",imgUrl:"",link:"",tags:"",vote:0,source:""}
    ],
    reducers: {
        addPost: (state, action) => {
         //   console.log(action.payload,"post added")
            const found = state.find(x=>x.link==action.payload.link);
            if(found) return state;
            state=[...state,action.payload.post];

            return state;
        },
        removeDuplicatePosts(state,action){
        //    console.log("removing duplicate posts")
            return state.reduce((acc:any[],item:any)=>{
                if(!acc.find((x:any)=>x.link==item.link&&x.source==item.source)){
                    acc.push(item);
                }
                return acc;
            },[])
        },
        clearPosts:(state,action)=>{
            return []
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
    //        console.log("update feed");
            const feed = action.payload.feed;
            const unique = feed.filter((x:any)=>!state.some(y=>y.link==x.link&&y.source==x.source))
            const next:any[]=[...state,...unique]
            return next;

        },
        hydrateVotedContent:(state,action)=>{
            return action.payload.reduce((acc:any[],item:any)=>{
                if(!acc.find((x:any)=>x.link==item.link)){
                    acc.push(item);
                }
                return acc;
            },[])
        },
    },
});
export const { addPost, clearPosts,removePost,updatePostVote,updateFeed,hydrateVotedContent,removeDuplicatePosts } = postSlice.actions;
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
    return state.posts.filter((x:any)=>x.vote==0);
}
export default postSlice.reducer;
