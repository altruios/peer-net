import { selectSavedPeers,selectAvoidPeers,selectUnScoredPeers } from "../slices/peerSlice";
import PeerCard from "./PeerCard";
import { useSelector } from "react-redux";
import PeerList from "./PeerList";
import { useState } from "react";
function PeerCards() {
    
    const savedPeers = useSelector(selectSavedPeers);
    const AvoidPeers = useSelector(selectAvoidPeers);
    const unScoredPeers = useSelector(selectUnScoredPeers);
    const [showAvoid,setShowAvoid]=useState(false);
return (
    <div className="PeerCards"> 
        <h2>Peer Connector</h2>
        <div>
            <button onClick={()=>{setShowAvoid(!showAvoid)}}> show avoided peers</button>
        </div>
        <div className="horizontal-flex">        
            <div className="vertical-flex">
                <div> Saved Peers</div>
                <PeerList props={{list:savedPeers,name:"Saved"}} />
            </div>
                 
            <div className="vertical-flex">
                <div> Peers</div>
            <PeerList props={{list:unScoredPeers,name:"UnScored"}} />
                 </div>
                 {showAvoid?
            <div className="vertical-flex">
                <div> avoided Peers</div>
            <PeerList props={{list:AvoidPeers,name:"Avoid"}} />
        </div>
        :<></>}
        </div>
        </div>
)
        
}
export default PeerCards
