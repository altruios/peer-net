import { useDispatch } from "react-redux";
import { useState } from "react";
import { updatePostVote } from "../slices/postSlice";
function LinkCard(props:any) {
const p = props.props;
const data = p.link;
const [isOpen,setIsOpen]= useState(false);
const dispatch = useDispatch();
return (<div className='Link-Card'
> 
            <button 
            className="upvoteBtn"
            onClick={() =>{
                console.log(data,"is changing");
                dispatch(updatePostVote({link:data.link,vote:1}))
            }}>
                ↑
            </button>


            <div className={`Link-Card-Content ${p.type}`}
                onClick={()=>setIsOpen(!isOpen)}
                >
                <div className="card-body">
                    <h5 className="card-title">{data?.title||data.link}</h5>
                    <p className="card-text">{data.text||data?.link}</p>
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
                dispatch(updatePostVote({link:data.link,vote:1}))
                    
            }}>
                ↓
            </button>


        </div>

            
        
)
        
}
export default LinkCard
