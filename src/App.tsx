import React, { useState,useEffect } from 'react'
import './App.css'
import LinkCards from './components/LinkCards';
import PeerNet from './peer';
import PeerConnector from './components/PeerConnector';
import DialogModal from './components/PeerPostLink';



function App() {
    const [rawJson,setRawJson] = useState(localStorage.getItem('peer-net/data')||'{}')
    const [upvotes,setupvotes] = useState<any[]>([]);
    const [downvotes,setDownvotes] = useState<any[]>([]);
    const [peers,setPeers] = useState<any[]>([])
    const [savedPeers,setSavedPeers] = useState<any[]>([])
    const [blockPeers,setBlockedPeers] = useState<any[]>([])
    const [__PEER_ID,set__PEER_ID] = useState<string>('');
    const [show_downvotes,setShowDownvotes]=useState<boolean>(false);
    const [feed,updateFeed]= useState([]);
    const [dataloaded,setDataLoaded]= useState(false);
    const [PEERNET,setPeerNet]:any = useState({});
    const [hovered_link,setHoveredLink] = useState('');
    const [isOpened, setIsOpened] = useState(false);
    const [newTitle,setNewTitle]=useState('');
    const [newLink,setNewLink]=useState('');
    const [newImage,setNewImage]=useState('');
    const [newText,setNewText]=useState('');
    const getFeed=()=>{
        console.log("this triggers");
        PEERNET.get_feed()
    }
    const clear_post = ()=>{

        setNewImage('');
        setNewLink('');
        setNewText('');
        setNewTitle('');
    }
    const onProceed = () => {
        console.log("Proceed clicked");
        console.log(newText,newTitle,newImage,newLink);
        const post = {
            title:newTitle,
            link:newLink,
            image:newImage,
            text:newText
        }
        setupvotes(prev=>{
            prev.push(post)
            return prev;
        })
        clear_post();
        PEERNET.notify(post);
      };
    const onClose=()=>{
        setIsOpened(false);
        clear_post();
    }
    useEffect(()=>{
        const data = JSON.parse(rawJson);
        setupvotes(data.upvotes);
        setDownvotes(data.downvotes);
        console.log("upvotes",data.upvotes);
        const p = new PeerNet(data.upvotes,data.__PEER_ID,updateFeed,setPeers);
        set__PEER_ID(p.id);
        setPeerNet(p);
        setSavedPeers(data.savedPeers||[]);
        setBlockedPeers(data.blockPeers||[]);
        console.log("data",data.upvotes,upvotes);
        setDataLoaded(true);
    },[])
    useEffect(()=>{
        if(dataloaded){
        console.log("connected after data loaded")
        PEERNET.connect();
        setPeers(PEERNET.getPeers([]));
    }
    },[dataloaded])
    useEffect(()=>{
        try{
        console.log(PEERNET);
        if(PEERNET?.linkFeed!==undefined) PEERNET?.linkFeed(upvotes);
        }catch(e){

            console.log(e);
        }
    },[upvotes,PEERNET])
    useEffect(()=>{
        setRawJson(JSON.stringify({upvotes,downvotes,savedPeers,peers,blockPeers,__PEER_ID}));
    },[upvotes,downvotes,savedPeers,peers,blockPeers,__PEER_ID])
    useEffect(() => {
        localStorage.setItem('peer-net/data', rawJson);
    }, [rawJson]);
    const handlePeerChange = (peer:any,flag:boolean)=>{
        flag?
        setSavedPeers((prev)=>{
            const next = Array.from(new Set([...prev,peer]))
            return next;
        }):
        setSavedPeers((prev)=>{
            prev.filter(x=>x!==peer)
            return prev;
        })
        
    }
    const handle_vote_change = (value:number,link_obj:any)=>{
        const link:string = link_obj.link;
        if(value>0){
            const found = upvotes?.find(x=>x.link===link);
            if(found){
                setupvotes(upvotes.filter(x=>x.link!==link));
                setDownvotes(downvotes?.filter(x=>x.link!==link));
            }else{
                setupvotes((prev)=>{
                    prev.push(link_obj);
                    return prev});
                setDownvotes(downvotes?.filter(x=>x.link!==link));
            }
        }
        if(value<0){
            const found = downvotes?.find(x=>x.link===link);
            if(found){
                setDownvotes(downvotes.filter(x=>x.link!==link));
                setupvotes(upvotes?.filter(x=>x.link!==link));
            }else{
                setDownvotes(prev=>{
                    prev.push(link_obj);
                    return prev});
                setupvotes(upvotes?.filter(x=>x.link!==link));
            }
        }
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

                <DialogModal 
                title="Add link"
                isOpened={isOpened}
                onProceed={onProceed}
                onClose={onClose}>
                    <div className="newForm">

                   <div className="inputDiv">
                    <label> title</label>
                    <input className='newTitle' value={newTitle} onChange={(e)=>setNewTitle(e.target.value)}></input>
                    </div> 
                    <div className="inputDiv">
                    <label> link</label>
                    <input className="newLink" value={newLink} onChange={(e)=>setNewLink(e.target.value)}></input>
                    </div> 
                    <div className="inputDiv">
                    <label> image-URL</label>
                    <input className="newImage" value={newImage} onChange={(e)=>setNewImage(e.target.value)}></input>
                    </div> 
                    <div className="inputDiv">
                    <label> text</label>
                    <textarea className="newText" value={newText} onChange={(e)=>setNewText(e.target.value)}></textarea>
                    </div> 

                    </div>
                </DialogModal>
                show downvoted items:
                <input type="checkbox" checked={show_downvotes} onChange={(e)=>setShowDownvotes(e.target.checked)}></input>
                <button className='btn' onClick={getFeed}>get feed</button>
            </div>
            <div className='main-container'>
            <LinkCards 
                className="upvotes"

                props={{
                    feed:upvotes?.map(x=>({link:x,type:"up"})),
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
                    .filter(x=>!upvotes?.includes(x.link)&&
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
                feed:downvotes?.map(x=>({link:x,type:"down"})),
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
