import { Typography,CardMedia, Grid,Card, CardHeader, CardContent, CardActionArea, CardActions, Link } from '@mui/material';

import { useDispatch } from "react-redux";
import { useState } from "react";
import { updatePostVote } from "../slices/postSlice";
import PEER_NET from "../PEER_NET";
import { Button } from "@mui/material";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
function LinkCard(props: any) {
    const p = props.props;
    const data = p.link;
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    console.log("link card data", data);
    return (<Card
    variant='outlined'
    style={{
        border:"solid",
        borderRadius:"3rem",
        margin:".1rem"
    }}
    >
        <CardHeader title={data?.title || data.link} align="center" />
        <CardContent 
                    >
        <Typography variant="body2" color="text.secondary"align="center" style={{lineHeight:"3rem"}}>

            {data.text || data?.link}
        </Typography>
        <Link 
            style = {{display:"flex",justifyContent:"center",lineHeight:"3.5rem"}}
            href={data?.link}
            underline="hover">

            {data?.link}
        </Link>
            <CardMedia
            component="img"
            image={data.image}
            alt={"no image"}
            
            style={{border:".1rem inset",maxHeight:"10vh",textAlign:"center"
       
        }}

            />
            <CardActions
                        style={{alignItems:"center",justifyContent: "space-between", display: "flex"}}

            >

                <Button
                    className="Green"
                    onClick={() => {
                        console.log(data, "is changing");
                        const vote = data?.vote !== 1 ? 1 : 0;
                        dispatch(updatePostVote({ link: data.link, vote }))
                        if (vote == 1) {
                            const post = {
                                title: data?.title,
                                text: data?.text,
                                link: data?.link,
                                source: data?.source,
                                image: data?.image
                            }
                            PEER_NET.notify(post, data?.source);
                        }

                    }} >
                    <ThumbUpOffAltIcon />
                </Button>
                <Button
                    onClick={() => {
                        dispatch(updatePostVote({ link: data.link, vote: data?.vote !== -1 ? -1 : 0 }))

                    }}>
                </Button><ThumbDownOffAltIcon />
            </CardActions>
                                <Typography variant="body2" color="text.secondary" align="right">
                        
                        
                        {data.source}
                                    </Typography>

        </CardContent>
    </Card>
    )

}
export default LinkCard
