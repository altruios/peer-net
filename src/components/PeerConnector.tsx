import PeerCard from "./PeerCard";
function PeerConnector(props:any) {
    const p = props.props;
    const peers = p?.peers;
return (<div className="PeerCards"> 
        <h2>Peer Connector</h2>
        {peers?.map(
            (peer:any,i:number)=>
                <PeerCard
                    key={`${peer?.id}}${i}`} 
                    props={{peer}}/>)} 
        </div>
)
        
}
export default PeerConnector
