import LinkCard from "./LinkCard";

function LinkCards(props:any) {
    const p = props.props;
    const feed = p?.feed;
return (<div className="LinkCards"> 
        <h2>{p.name}</h2>
        {feed?.map(
            (link:any,i:number)=>
                <LinkCard 
                    key={`${link.link}}${i}`} 
                    props={{link:link.link,type:link.type}}/>)} 
        </div>
)
        
}
export default LinkCards
