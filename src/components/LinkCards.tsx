import LinkCard from "./LinkCard";

function LinkCards(props:any) {
    const p = props.props;
    const feed = p?.feed;
    const handle_vote = p?.handleVote;
return (<div className="LinkCards"> 
        <h2>{p.name}</h2>
        {feed?.map(
            (link:any,i:number)=>
                <LinkCard 
                    key={`${link.link}}${i}`} 
                    props={{link:link.link,handle_vote,type:link.type}}/>)} 
        </div>
)
        
}
export default LinkCards
