import { Stack } from "@mui/material";
import LinkCard from "./LinkCard";
function LinkCards(props:any) {
    const p = props.props;
    const feed = p?.feed;
return (<Stack
    overflow="hidden"
> 


        {feed?.length>0?feed.map(
            (link:any,i:number)=>
            <LinkCard 
            key={`${link.link}}${i}`} 
            props={{link:link.link,type:link.type}}/>)
        :<div className="Link-Card">no items in this feed</div>
        } 
            </Stack>
)
        
}
export default LinkCards
