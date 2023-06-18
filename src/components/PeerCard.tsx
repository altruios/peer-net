function PeerCard(props:any) {
    const peer = props.props.peer;
    const handleChange = props.props.handleChange;
    
    return (<div className={`Peer-Card`}> 
            
                <button 
                className="Keep-Btn"
                onClick={() =>{
                    handleChange(peer,true);
                }}>
                    save
                </button>
                <span 
                className="Peer-text">
                    {peer};
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
    