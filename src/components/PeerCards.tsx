import PeerCard from "./PeerCard";
function PeerCards(props:any) {
    const p = props.props;
    const feed = p?.feed;
    const handle_vote = p?.handleVote;

return (<div className="PeerCards"> 
        <h2>{p.name}</h2>
        {feed?.map(
            (link:any,i:number)=>
                <PeerCard 
                    key={`${link.link}}${i}`} 
                    props={{link:link.link,handle_vote,type:link.up+link.down}}/>)} 
        </div>
)
        
}
export default PeerCards
