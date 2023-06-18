import React, { useState,useEffect } from 'react'
import './App.css'
import LinkCards from './components/LinkCards';
import PeerNet from './peer';
import PeerConnector from './components/PeerConnector';



function App() {
    const [rawJson,setRawJson] = useState(localStorage.getItem('peer-net/data')||'{}')
    const [upvotes,setupvotes] = useState<any[]>([]);
    const [downvotes,setDownvotes] = useState<any[]>([]);
    const [connectedPeers,setPeers] = useState<any[]>([])
    const [savedPeers,setSavedPeers] = useState<any[]>([])
    const [blockPeers,setBlockedPeers] = useState<any[]>([])
    const [__PEER_ID,set__PEER_ID] = useState<string>('');
    const [show_downvotes,setShowDownvotes]=useState<boolean>(false);
    const [feed,updateFeed]= useState([]);
    const [PEERNET,setPeerNet]:Array<any> = useState({});
    const [hovered_link,setHoveredLink] = useState('');
    useEffect(()=>{
        const data = JSON.parse(rawJson);
        setupvotes(data.upvotes||[]);
        setDownvotes(data.downvotes||[]);
        const p = new PeerNet(upvotes,data.__PEER_ID,updateFeed,setPeers);
        set__PEER_ID(p.id);
        setPeerNet(p);
        p.connect();
        setPeers(p.getPeers([]));
        setSavedPeers(data.savedPeers||[]);
        setBlockedPeers(data.blockPeers||[])
    },[])
    useEffect(()=>{
        setRawJson(JSON.stringify({upvotes,downvotes,savedPeers,connectedPeers,blockPeers,__PEER_ID}));
    },[upvotes,downvotes,savedPeers,connectedPeers,blockPeers,__PEER_ID])
    useEffect(() => {
        localStorage.setItem('peer-net/data', rawJson);
    }, [rawJson]);
    const handlePeerChange = (peerID:string,flag:boolean)=>{
        flag?
        setSavedPeers((prev)=>{
            const next = Array.from(new Set([...prev,peerID]))
            return next;
        }):
        setSavedPeers((prev)=>{
            prev.filter(x=>x!==peerID)
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
            <div>show downvoted items:
                <input type="checkbox" checked={show_downvotes} onChange={(e)=>setShowDownvotes(e.target.checked)}></input>
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
        <PeerConnector props={{peers:connectedPeers,handleChange:handlePeerChange}}/>
        </div>
    )
}

export default App
