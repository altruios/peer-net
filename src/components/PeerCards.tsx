import PeerCard from "./PeerCard";
function PeerCards(props:any) {
    const p = props.props;
    const feed = p?.feed;

return (<div className="PeerCards"> 
        <h2>{p.name}</h2>
        {feed?.map(
            (link:any,i:number)=>
                <PeerCard 
                    key={`${link.link}}${i}`} 
                    props={{link:link.link,type:link.up+link.down}}/>)} 
        </div>
)
        
}
export default PeerCards
