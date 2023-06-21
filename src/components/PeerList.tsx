import PeerCard from "./PeerCard";
function PeerList(props:any) {
    const list = props.props.list;
    const name = props.props.name;    
return (<div className={`${name} Peers`}> 
       
        
        {list?.map(
            (peer:any,i:number)=>
                <PeerCard
                    key={`${peer?.id}}${i}`} 
                    peer={peer}/>)} 
        
        </div>
)
        
}
export default PeerList
