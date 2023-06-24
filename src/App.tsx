import { useState,useEffect,useRef } from 'react'
import { useSelector,useDispatch } from 'react-redux';
import Button from '@mui/material/Button';
import { Typography ,AppBar,Container,
    Card,CardActions,CardContent,CardMedia,
    CssBaseline,Grid,Toolbar,
    Tabs,Tab,Box, Badge, ButtonGroup} from '@mui/material';
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

    const [tabIndex,setTabIndex]=useState(1)
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
    const  cleanData = async()=>{
    //    console.log("data",peers)
        dispatch(removePeer({peer:""}))
        dispatch(removePost({link:""}))
        dispatch(removeDuplicatePosts({}))
        const rawJson = localStorage.getItem('peer-net/data')||'{}'
        const data = await JSON.parse(rawJson);
        dispatch(hydratePeers(data.peers));
        console.log(data,":data");
        console.log("peers are from clean data!",data?.peers);
        const uv=(data?.upVotes)?data.upVotes:[];
        const dv=(data?.downVotes)?data.downVotes:[];
        dispatch(hydrateVotedContent([...uv,...dv]))
    }   
    useEffect(()=>{cleanData()}, []);
    
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
        const receipt = localStorage.getItem("peer-net/data");
        console.log(receipt,"is result of save")
    },[upVotes,downVotes,peers.map((x:any)=>x.score)])

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
<div style={{
            height:"100%",
            width:"100%"
}}>
    <CssBaseline />
    <PeerPostLink openState={[isOpened,setIsOpened]} />
    <AppBar position='sticky' sx={{  
        paddingTop:"5vh",
        height:"10vh",
        textAlign:"center",
        justifyContent: 'center', 
        width:"fill"}}>
        <Typography variant='h2'>peer net</Typography>
        <Typography variant="h6">{PEER_NET?.id}</Typography>
        <Tabs 
            value={tabIndex} 
            onChange={handleTabChange} 
            textColor='secondary'
            aria-label="basic tabs example"
        >
            <Tab 
                style={{marginInline:"10%"}}
                label="saved"/> 
            <Tab 
                style={{marginInline:"10%"}}
                label={<Badge 
                    badgeContent={feed.length} 
                color="secondary">
                    feed
            </Badge>}  />

            <Tab 
                style={{marginInline:"10%"}}
                label="avoid"
                />
            <Tab
                    style={{marginInline:"10%"}}
                    label="peers"
            />
        </Tabs>
    </AppBar>
    <div style={{
        width:"100%"
    }}>
        <Box sx={{
                p:3,
                height:"70vh",
                overflowY:"scroll",
                width:"99%",
                marginBlock:"5vh"
            }}>

        {tabIndex==0&&(<LinkCards {...getFeedProps(upVotes,"upVotes","up")} />)}
        {tabIndex==1&&(<LinkCards {...getFeedProps(feed,"feed","")} />)}
        {tabIndex==2&&(<LinkCards {...getFeedProps(downVotes,"downVotes","down")} />)}
        {tabIndex==3&&( <PeerCards />)}

        </Box>
    </div>
    <AppBar position='relative' sx={{height:"10vh", bottom:0,textAlign:"center",justifyContent: 'space-between',flexFlow:"row nowrap" }}>
        <Button variant="contained" color="secondary" onClick={() => setIsOpened(true)}>new post</Button>
        <Button variant="contained" color="secondary" onClick={()=>{getFeed(connections.current)}}>get feed</Button>
    </AppBar>
</div>
    )
}

export default App
