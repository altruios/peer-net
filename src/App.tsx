import './App.css'
import { useState,useEffect,useRef } from 'react'
import { useSelector,useDispatch } from 'react-redux';
import { 
    removePeer,
    selectActivePeers,
    selectPeers,
    updateScoreOfPeer,
    hydratePeers
} from './slices/peerSlice';
import LinkCards from './components/LinkCards';
import PeerConnector from './components/PeerConnector';
import PeerPostLink from './components/PeerPostLink';
import PEERNET from './PEERNET';
import { removePost, selectSavedPosts, selectToVotePosts, updatePostVote,hydrateVotedContent } from './slices/postSlice';


function App() {
    const [show_downvotes,setShowDownvotes]=useState<boolean>(false);
    const [hovered_link,setHoveredLink] = useState('');
    const [isOpened, setIsOpened] = useState(false);
    const [isLoaded,setIsLoaded]=useState(false);
    const [isConnected,setIsConnected]=useState(false);
    const connections = useRef([]);
    const getFeed=(peers:any[])=>{
        console.log("this triggers",connections.current,PEERNET.pool.current);
        PEERNET.get_feeds(peers)
    }

    const upvotes = useSelector(selectSavedPosts);
    const downvotes = useSelector(selectSavedPosts);
    const feed = useSelector(selectToVotePosts);
    const peers = useSelector(selectPeers);
    const onlinePeers = useSelector(selectActivePeers)
    const dispatch = useDispatch();
    const cleanData = ()=>{
        console.log("data",peers)
        dispatch(removePeer({peer:""}))
        dispatch(removePost({link:""}))
        const rawJson = localStorage.getItem('peer-net/data')||'{}'
        const data = JSON.parse(rawJson);
        dispatch(hydratePeers(data.peers))
        dispatch(hydrateVotedContent([...data.upvotes,...data.downvotes]))
    }   
    useEffect(cleanData, []);
    
    useEffect(()=>{
        const tv = peers.length>0&&(peers[0].peer!=="")&&!isLoaded;
        console.log("tv",tv);
        tv?setIsLoaded(true):null;
    }, [isLoaded]);
    
    useEffect(()=>{
        console.log("online",onlinePeers)
        const tv=onlinePeers.length>0&&isLoaded&&!isConnected;
        console.log(tv,"is res");
        tv?setIsConnected(true):null;
    }, [isConnected,isLoaded]);
    
    useEffect(()=>{
        console.log(peers.length,"must be >0")
        console.log("isloaded",isLoaded)
        PEERNET.setPool(connections);
        isLoaded?PEERNET.connect(peers):null;
    }, [isLoaded]);
    

    useEffect(()=>{
        console.log(onlinePeers.length,"must be >0")
        console.log("is connnected",isConnected);
        if(isConnected){
            console.log("connections current",connections.current)
            PEERNET.get_feeds(connections.current)
        };
    }, [isConnected]);



    useEffect(()=>{
        console.log("storing data in:");
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
                <button className='btn' onClick={()=>{getFeed(connections.current)}}>get feed</button>
            </div>
            <div className='main-container'>
            <LinkCards 
                className="upvotes"

                props={{
                    feed:upvotes?.map((x:any)=>({link:x,type:"up"})),
                    name:"upvotes",
                    handleHover:setHoveredLink,
                    hovered_link
                }}
                    />
            <LinkCards 
                className="feed"
                
                props={
                    {
                    feed:feed.map((x:any)=>({
                        link:x, type:""})),
                    name:"feed",
                    handleHover,
                    hovered_link
                    }
                } 
            />
            {show_downvotes?
            <LinkCards 
            className="Downvotes"
            props={{
                feed:downvotes?.map((x:any)=>({link:x,type:"down"})),
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
