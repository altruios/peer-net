import { useDispatch } from "react-redux";
import { useState } from "react";
import { updatePostVote } from "../slices/postSlice";
import PEER_NET from "../PEER_NET";
function LinkCard(props:any) {
const p = props.props;
const data = p.link;
const [isOpen,setIsOpen]= useState(false);
const dispatch = useDispatch();
console.log("link card data",data);
return (<div className='Link-Card'
> 
            <button 
            className="upvoteBtn"
            onClick={() =>{
                console.log(data,"is changing");
                const vote = data?.vote!==1?1:0;
                dispatch(updatePostVote({link:data.link,vote}))
                if(vote==1){
                    const post = {
                        title:data?.title,
                        text:data?.text,
                        link:data?.link,
                        source:data?.source,
                        image:data?.image
                    }
                    PEER_NET.notify(post,data?.source);
                }
                
            }}>
                ↑
            </button>


            <div className={`Link-Card-Content ${p.type}`}
                onClick={()=>setIsOpen(!isOpen)}
                >
                    <p className="card-title">{data?.title||data.link}</p>
                <div className="card-body">
                    <p className="card-text">{data.text||data?.link}</p>
                    <p className="card-source">{data.source}</p>
                </div>
                {isOpen?
                    data?.image?
                        <a href={data?.link}>
                            <img src={data?.image} className="card-img" alt="" /> 
                        </a>
                        :
                        <a href={data?.link}>{data?.link}</a>
                    :<></>
                }
            </div>

            <button 
            className="downvoteBtn"
            onClick={() =>{
                dispatch(updatePostVote({link:data.link,vote:data?.vote!==-1?-1:0}))
                    
            }}>
                ↓
            </button>
        </div>
)
        
}
export default LinkCard
