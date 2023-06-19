import './App.css'
import { useState,useEffect } from 'react'
import { useSelector,useDispatch } from 'react-redux';
import { 
    removePeer,
    selectActivePeers,
    selectPeers,
    updateScoreOfPeer 
} from './slices/peerSlice';
import LinkCards from './components/LinkCards';
import PeerConnector from './components/PeerConnector';
import PeerPostLink from './components/PeerPostLink';
import PEERNET from './PEERNET';
import { removePost, selectSavedPosts, selectToVotePosts, updatePostVote } from './slices/postSlice';


function App() {
    const [show_downvotes,setShowDownvotes]=useState<boolean>(false);
    const [hovered_link,setHoveredLink] = useState('');
    const [isOpened, setIsOpened] = useState(false);

    const getFeed=()=>{
        const peers = useSelector(selectActivePeers)
        console.log("this triggers");
        PEERNET.get_feeds(peers)
    }

    const upvotes = useSelector(selectSavedPosts);
    const downvotes = useSelector(selectSavedPosts);
    const feed = useSelector(selectToVotePosts);
    const peers = useSelector(selectPeers);
    const dispatch = useDispatch();
    const cleanData = ()=>{
        console.log("data",peers)
        dispatch(removePeer({peer:""}))
        dispatch(removePost({link:""}))
    }   
    useEffect(cleanData, []);
    
    useEffect(()=>{
        localStorage.setItem('peer-net/data',JSON.stringify({upvotes,downvotes,peers}));
    },[upvotes,downvotes,peers])

    const handlePeerChange = (peer:any,flag:boolean)=>{
        updateScoreOfPeer({peer,score:flag?1:0});
        
    }
    const handle_vote_change = (vote:number,link_obj:any)=>{
        const dispatch = useDispatch()
        const link:string = link_obj.link;
        dispatch(updatePostVote({link,vote}))
    }
    const handleHover = (link:string)=>{
        setHoveredLink(link);
    }
    return (
        <div className="main">
 
            <h1>peer net</h1>
            <h3>{PEERNET?.id}</h3>

            <div>
            <button onClick={() => setIsOpened(true)}>new post</button>

                <PeerPostLink openState={[isOpened,setIsOpened]}/>
                show downvoted items:
                <input type="checkbox" checked={show_downvotes} onChange={(e)=>setShowDownvotes(e.target.checked)}></input>
                <button className='btn' onClick={getFeed}>get feed</button>
            </div>
            <div className='main-container'>
            <LinkCards 
                className="upvotes"

                props={{
                    feed:upvotes?.map((x:any)=>({link:x,type:"up"})),
                    handleVote:handle_vote_change,
                    name:"upvotes",
                    handleHover:setHoveredLink,
                    hovered_link
                }}
                    />
            <LinkCards 
                className="feed"
                
                props={
                    {feed:feed.map((x:string)=>{
                        return {
                        link:x, type:""
                        }
                        })
                    .filter((x:any)=>!upvotes?.includes(x.link)&&
                        !downvotes?.includes(x.link)),
                handleVote:handle_vote_change,
                name:"feed",
                handleHover,
                hovered_link
                }} />
            {show_downvotes?
            <LinkCards 
            className="Downvotes"
            props={{
                feed:downvotes?.map((x:any)=>({link:x,type:"down"})),
                handleVote:handle_vote_change,
                name:"downvotes",
                handleHover,
                hovered_link
            }}
            />
            :null}
            </div>
        <PeerConnector props={{peers,handleChange:handlePeerChange}}/>
        </div>
    )
}

export default App
