import './App.css'
import { useState,useEffect,useRef } from 'react'
import { useSelector,useDispatch } from 'react-redux';
import { 
    removePeer,
    selectActivePeers,
    selectPeers,
    hydratePeers,
    selectNotBlockedPeers,
    clearPeers
} from './slices/peerSlice';
import LinkCards from './components/LinkCards';
import PeerCards from './components/PeerCards';
import PeerPostLink from './components/PeerPostLink';
import PEER_NET from './PEER_NET';
import { removePost, 
    removeDuplicatePosts,
    selectSavedPosts, 
    selectToVotePosts, 
    hydrateVotedContent, 
    selectFilteredPosts,
    clearPosts
} from './slices/postSlice';


function App() {
    const [showDownVotes,setShowDownVotes]=useState<boolean>(false);
    const [showUpVotes,setShowUpVotes]=useState<boolean>(false);
    const [isOpened, setIsOpened] = useState(false);
    const [isLoaded,setIsLoaded]=useState(false);
    const [isConnected,setIsConnected]=useState(false);
    const connections = useRef([]);
    const getFeed=(peers:any[])=>{
    console.log("this triggers",connections.current,PEER_NET.pool.current,peers);
        connections.current.length>0?
        PEER_NET.get_feeds(peers)
        :
        PEER_NET.connect(peers);
    }

    const upVotes = useSelector(selectSavedPosts);
    const downVotes = useSelector(selectFilteredPosts);
    const feed = useSelector(selectToVotePosts);
    const peers = useSelector(selectPeers);
    const onlinePeers = useSelector(selectActivePeers)
    const notBlockedPeers = useSelector(selectNotBlockedPeers);
    const dispatch = useDispatch();
    const cleanData = ()=>{
    //    console.log("data",peers)
        dispatch(removePeer({peer:""}))
        dispatch(removePost({link:""}))
        dispatch(removeDuplicatePosts({}))
        const rawJson = localStorage.getItem('peer-net/data')||'{}'
        const data = JSON.parse(rawJson);
        dispatch(hydratePeers(data.peers));
        const uv=(data?.upVotes)?data.upVotes:[];
        const dv=(data?.downVotes)?data.downVotes:[];
        dispatch(hydrateVotedContent([...uv,...dv]))
    }   
    useEffect(cleanData, []);
    
    useEffect(()=>{
        const tv = peers.length>0&&(peers[0].peer!=="")&&!isLoaded;
    //    console.log("tv",tv);
        tv?setIsLoaded(true):null;
    }, [isLoaded]);
    
    useEffect(()=>{
     //   console.log("online",onlinePeers)
        const tv=onlinePeers.length>0&&isLoaded&&!isConnected;
    //    console.log(tv,"is res");
        tv?setIsConnected(true):null;
    }, [isConnected,isLoaded]);
    
    useEffect(()=>{
   //     console.log(peers.length,"must be >0")
    //    console.log("isLoaded",isLoaded)
        PEER_NET.setPool(connections);
        isLoaded?PEER_NET.connect(notBlockedPeers):null;
    }, [isLoaded]);
    

    useEffect(()=>{
   //     console.log(onlinePeers.length,"must be >0")
   //     console.log("is connected",isConnected);
        if(isConnected){
            console.log("connections current",connections.current)
            PEER_NET.get_feeds(connections.current)
        };
    }, [isConnected]);

    

    useEffect(()=>{
   //     console.log("storing data in:");
   //todo fix storage so peers are saved only if upvoted or downvoted, and classify them as such.
   // also add a limit to count of peers stored for storage reasons, find a good sane default
        const peersSave = peers.filter((x:any)=>x.score!=undefined&&x.score!=null&&x.score!=0)
   const saveObj = JSON.stringify({upVotes,downVotes,peers:peersSave});     
   localStorage.setItem('peer-net/data',saveObj)
   console.log("saveobj,",saveObj);
    },[upVotes,downVotes,peers])

const nuke = ()=>{
    dispatch(clearPosts());
    dispatch(clearPeers());
}
    return (
        <div className="main">
 
            <h1>peer net</h1>
            <h1>node:{PEER_NET?.id}</h1>
        <div>
        <button onClick={() => setIsOpened(true)}>new post</button>
        <button onClick={() => nuke()}>erase json data</button>

            <PeerPostLink openState={[isOpened,setIsOpened]} />
            show up voted items:
            <input type="checkbox" checked={showUpVotes} onChange={(e)=>setShowUpVotes(e.target.checked)}></input>
            show down voted items:

            <input type="checkbox" checked={showDownVotes} onChange={(e)=>setShowDownVotes(e.target.checked)}></input>
            <button className='btn' onClick={()=>{getFeed(connections.current)}}>get feed</button>
        </div>
            <div className='main-container'>
            {
                showUpVotes?<LinkCards 
                
                className="upVotes"
                
                props={{
                    feed:upVotes?.map((x:any)=>({link:x,type:"up"})),
                    name:"upVotes",
                }}
                />
                :null
            }
            <LinkCards 
                className="feed"
                
                props={
                    {
                    feed:feed.map((x:any)=>({
                        link:x, type:""})),
                    name:"feed",
                    }
                } 
            />
            {showDownVotes?
            <LinkCards 
            className="downVotes"
            props={{
                feed:downVotes?.map((x:any)=>({link:x,type:"down"})),
                name:"downVotes",
            }}
            />
            :null}
            </div>
        <PeerCards />
        </div>
    )
}

export default App
