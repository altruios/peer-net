import PEER_NET from "../PEER_NET";
import { useState } from "react";
import { Typography,Button, Box } from "@mui/material"



function NewPeerFinder(props:any){
    const [newPeerConnectionText,setNewPeerConnectionText]=useState('')
    const handle_newPeerText=(peer:string)=>{
        setNewPeerConnectionText(peer);
    }
    const handle_newPeerSubmit=(peer:string)=>{
        console.log("e",peer);
        try{
            PEER_NET.connect_to_peer(`peer-${peer}`)
        }catch(e:any){
            console.log(e,"failed to get new peer");
        }

    }
 return(
 <Box
 sx={{

    alignContent:"center",
    display:"flex",
    flexFlow:"row nowrap",
    justifyContent:"space-evenly"
 }}
 >
 <Typography variant="h5">

peer-
<input onChange={(e)=>handle_newPeerText(e.target.value)} value={newPeerConnectionText}></input>
</Typography>

<Button variant="contained" onClick={()=>handle_newPeerSubmit(newPeerConnectionText)}>connect to specific peer</Button>
 </Box>
)
}

export default NewPeerFinder
