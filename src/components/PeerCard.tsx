import { useDispatch } from "react-redux";
import { updateScoreOfPeer, updateStateOfPeer } from "../slices/peerSlice";
import PEER_NET from "../PEER_NET";

function PeerCard(props:any) {
    const peer = props.peer;
    const dispatch = useDispatch();
    const peerScore =Number(peer.score)||0;
    return (<div className={`Peer-Card ${peer?.connected?"up":"down"}`}> 
            
                <button 
                className="Keep-Btn"
                onClick={() =>{
                    const score:number = peerScore==1?0:1;

                    dispatch(updateScoreOfPeer({peer,score}));
                }}>
                    {!peerScore?"save":"forget"}
                </button>
                <span 
                className="Peer-text">
                    {peer.peer};
                </span>
                <button 
                className="Btn"
    
                onClick={() =>{          

                    PEER_NET.get_feed_from(peer);
                }}>
                   get feed from peer
                </button>


                <button 
                className="Btn"
    
                onClick={() =>{                  
                    PEER_NET.get_peers_of(peer);
                }}>
                get peers
                </button>





                <button 
                className="Remove-Btn"
    
                onClick={() =>{                  
                    const score:any = peerScore==-1?0:-1
                    console.log("score==",score,score==-1);
                    dispatch(updateScoreOfPeer({peer,score}));
                    dispatch(updateStateOfPeer({peer,connected:false}))
                    score==-1?
                    PEER_NET.disconnect(peer):PEER_NET.connect_to(peer);
                }}>
                    {peerScore>-1?"avoid":"re-allow"}
                </button>
    
            </div>
    
                
            
    )
            
    }
    export default PeerCard
    