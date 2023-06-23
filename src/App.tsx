import { useState,useEffect,useRef } from 'react'
import { useSelector,useDispatch } from 'react-redux';
import Button from '@mui/material/Button';
import { Typography ,AppBar,Container,
    Card,CardActions,CardContent,CardMedia,
    CssBaseline,Grid,Toolbar,
    Tabs,Tab,Box} from '@mui/material';
    import TabPanel from '@mui/lab/TabPanel';

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
    const [newPeerConnectionText,setNewPeerConnectionText]=useState('')
    const handle_newPeerText=(peer:string)=>{
        setNewPeerConnectionText(peer);
    }
    const handle_newPeerSubmit=(peer:string)=>{
        console.log("e",peer);
        try{
            PEER_NET.connect_to_peer(`peer-${peer}`)
        }catch(e:any){
            console.log(e,"failed to get new peer");
        }

    }
    const [tabIndex,setTabIndex]=useState(0)
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

    const handleTabChange = (e:any, tabIndex:number) => {
        console.log(tabIndex);
        setTabIndex(tabIndex);
      };

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

const getFeedProps = (feed:any[],name:string,type:string)=>{
    return {
        className:name,
        props:{
            feed:feed?.map((x:any)=>({link:x,type})),
            name
        }
    }
}
    return (
        <>
        <CssBaseline />
        <AppBar position='relative' sx={{ textAlign:"center",justifyContent: 'center' }}>
            <Typography variant='h1'>peer net</Typography>
            <Toolbar>
                <Typography variant="h6">
                    
                    {PEER_NET?.id}
                    </Typography>
            
                <Button variant="contained" onClick={() => setIsOpened(true)}>new post</Button>
                <Button variant="contained" onClick={()=>{getFeed(connections.current)}}>get feed</Button>
            <div className="main-title-options">
                <Button variant="outlined" onClick={() => nuke()}>erase json data</Button>
                <Typography variant="h5">

                    peer-
                    <input onChange={(e)=>handle_newPeerText(e.target.value)} value={newPeerConnectionText}></input>
                </Typography>
                
                    <Button variant="contained" onClick={()=>handle_newPeerSubmit(newPeerConnectionText)}>connect to specific peer</Button>
            </div>
                </Toolbar>
        </AppBar>
        <main>
            <Container>
            <PeerPostLink openState={[isOpened,setIsOpened]} />
  <Tabs value={tabIndex} onChange={handleTabChange} aria-label="basic tabs example">
    <Tab label="saved"  />
    <Tab label="feed"  />
    <Tab label="avoid"  />
  </Tabs>
{tabIndex==0&&(<Box sx={{ p: 3 }} >
<LinkCards {...getFeedProps(upVotes,"upVotes","up")} 
                
                
            />
</Box>)}
{tabIndex==1&&(<Box sx={{ p: 3 }} >
<LinkCards  {...getFeedProps(feed,"feed","")}/>
</Box>)}
{tabIndex==2&&(<Box sx={{ p: 3 }} >
<LinkCards {...getFeedProps(downVotes,"downVotes","down")} />
</Box>)}

 


            <div className='main-container'>
       
            </div>
        <PeerCards />
            </Container>
        </main>
    </>
    )
}

export default App
