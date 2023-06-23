import { useDispatch } from "react-redux";
import { updateScoreOfPeer, updateStateOfPeer } from "../slices/peerSlice";
import PEER_NET from "../PEER_NET";
import { Button, ButtonGroup, Card, CardContent, Typography } from "@mui/material";
import { CardHeader } from "@mui/material";
function PeerCard(props:any) {
    const peer = props.peer;
    const dispatch = useDispatch();
    console.log(peer,peer.peer);
        const peerScore =Number(peer.score)||0;
    return (<Card variant="outlined"> 
            <CardHeader 
            align="center"
            title={peer.peer}>
            </CardHeader>
            <CardContent
            style={{
                display:"flex",
                justifyContent:"center"
            }}
            >
                <ButtonGroup
                style={{
                    display:"flex",
                    justifyContent:"space-between",
                }}
                >

                <Button 
                onClick={() =>{
                    const score:number = peerScore==1?0:1;
                    
                    dispatch(updateScoreOfPeer({peer,score}));
                }}>
                    {!peerScore?"save":"forget"}
                </Button>
      
                <Button     
                onClick={() =>{          
                    
                    PEER_NET.get_feed_from(peer);
                }}>
                   request feed
                </Button>


                <Button                 
                onClick={() =>{                  
                    PEER_NET.get_peers_of(peer);
                }}>
                request peers
                </Button>





                <Button                 
                onClick={() =>{                  
                    const score:any = peerScore==-1?0:-1
                    console.log("score==",score,score==-1);
                    dispatch(updateScoreOfPeer({peer,score}));
                    dispatch(updateStateOfPeer({peer,connected:false}))
                    score==-1?
                    PEER_NET.disconnect(peer):PEER_NET.connect_to(peer);
                }}>
                    {peerScore>-1?"avoid":"re-allow"}
                </Button>
            </ButtonGroup>
        </CardContent>
    
    </Card>
    
                
            
    )
            
    }
    export default PeerCard
    