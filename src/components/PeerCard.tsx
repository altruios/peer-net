function PeerCard(props:any) {
    const peer = props.props.peer;
    const handleChange = props.props.handleChange;
    console.log("peer",peer);

    return (<div className={`Peer-Card ${peer?.peerConnection?.connectionState}`}> 
            
                <button 
                className="Keep-Btn"
                onClick={() =>{
                    handleChange(peer,true);
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
                
                    handleChange(peer,false);
                }}>
                    remove
                </button>
    
            </div>
    
                
            
    )
            
    }
    export default PeerCard
    