import { useState } from "react";
function LinkCard(props:any) {
const p = props.props;
const data = p.link;
const [isOpen,setIsOpen]= useState(false);
return (<div className='Link-Card'
> 
            <button 
            className="upvoteBtn"
            onClick={() =>{
                p.handle_vote(1,data);
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
                  p?.handle_vote(-1,data);
            }}>
                ↓
            </button>


        </div>

            
        
)
        
}
export default LinkCard
