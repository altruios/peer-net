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
import PeerCards from './components/PeerCards';
import PeerPostLink from './components/PeerPostLink';
import PEER_NET from './PEER_NET';
import { removePost, 
    removeDuplicatePosts,
    selectSavedPosts, 
    selectToVotePosts, 
    hydrateVotedContent, 
    selectFilteredPosts} from './slices/postSlice';


function App() {
    const [showDownVotes,setShowDownVotes]=useState<boolean>(false);
    const [hovered_link,setHoveredLink] = useState('');
    const [isOpened, setIsOpened] = useState(false);
    const [isLoaded,setIsLoaded]=useState(false);
    const [isConnected,setIsConnected]=useState(false);
    const connections = useRef([]);
    const getFeed=(peers:any[])=>{
      //  console.log("this triggers",connections.current,PEER_NET.pool.current,peers);
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
    const dispatch = useDispatch();
    const cleanData = ()=>{
    //    console.log("data",peers)
        dispatch(removePeer({peer:""}))
        dispatch(removePost({link:""}))
        dispatch(removeDuplicatePosts({}))
        const rawJson = localStorage.getItem('peer-net/data')||'{}'
        const data = JSON.parse(rawJson);
        dispatch(hydratePeers(data.peers?.filter((x:any)=>x.score>0)));
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
        isLoaded?PEER_NET.connect(peers):null;
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
        localStorage.setItem('peer-net/data',JSON.stringify({upVotes,downVotes,peers}));
    },[upVotes,downVotes,peers])


    const handleHover = (link:string)=>{
        setHoveredLink(link);
    }
    return (
        <div className="main">
 
            <h1>peer net</h1>
            <h3>{PEER_NET?.id}</h3>
        <div>{connections.current.map((x:any)=><div>{x.peer}</div>)}</div>
            <div>
            <button onClick={() => setIsOpened(true)}>new post</button>

                <PeerPostLink openState={[isOpened,setIsOpened]}/>
                show down voted items:
                <input type="checkbox" checked={showDownVotes} onChange={(e)=>setShowDownVotes(e.target.checked)}></input>
                <button className='btn' onClick={()=>{getFeed(connections.current)}}>get feed</button>
            </div>
            <div className='main-container'>
            <LinkCards 
                className="upVotes"

                props={{
                    feed:upVotes?.map((x:any)=>({link:x,type:"up"})),
                    name:"upVotes",
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
            {showDownVotes?
            <LinkCards 
            className="downVotes"
            props={{
                feed:downVotes?.map((x:any)=>({link:x,type:"down"})),
                name:"downVotes",
                handleHover,
                hovered_link
            }}
            />
            :null}
            </div>
        <PeerCards props={{peers}}/>
        </div>
    )
}

export default App
