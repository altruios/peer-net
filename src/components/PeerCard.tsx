import { useDispatch } from "react-redux";
import { updateScoreOfPeer } from "../slices/peerSlice";

function PeerCard(props:any) {
    const peer = props.props.peer;
    console.log("peer",peer);
    const dispatch = useDispatch();

    return (<div className={`Peer-Card ${peer?.peerConnection?.connectionState}`}> 
            
                <button 
                className="Keep-Btn"
                onClick={() =>{
                    dispatch(updateScoreOfPeer({peer,score:1}));
                }}>
                    save
                </button>
                <span 
                className="Peer-text">
                    {peer.peer};
                </span>
                <button 
                className="Remove-Btn"
    
                onClick={() =>{                  
                
                    dispatch(updateScoreOfPeer({peer,score:-1}));
                }}>
                    remove
                </button>
    
            </div>
    
                
            
    )
            
    }
    export default PeerCard
    