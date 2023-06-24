import { selectSavedPeers,selectAvoidPeers,selectUnScoredPeers } from "../slices/peerSlice";
import PeerCard from "./PeerCard";
import { useSelector } from "react-redux";
import PeerList from "./PeerList";
import { useState } from "react";
import NewPeerFinder from "./NewPeerFinder";
import { Tab,Tabs,Box, Card } from "@mui/material";
function PeerCards() {
    const [tabIndex,setTabIndex]=useState(1)
    const handleTabChange = (e:any, tabIndex:number) => {
        console.log(tabIndex);
        setTabIndex(tabIndex);
      };
    const savedPeers = useSelector(selectSavedPeers);
    const AvoidPeers = useSelector(selectAvoidPeers);
    const unScoredPeers = useSelector(selectUnScoredPeers);
    const [showAvoid,setShowAvoid]=useState(false);
return (
    <Card variant="outlined"> 
    <Box sx={{
        padding:"1rem",
        border:".1rem solid",
        marginBottom:"3rem",
        position:"sticky"
    }}>

            <NewPeerFinder />
    </Box>
            <Tabs 

    value={tabIndex} 
    onChange={handleTabChange} 
    aria-label="basic tabs example"
    >
   
    <Tab 
        style={{marginInline:"10%"}}
    label="saved peers"/>
    
    <Tab 
        style={{marginInline:"10%"}}
    label="peers" />
    
    <Tab 
        style={{marginInline:"10%"}}
    label="blocked peers"
    />
      </Tabs>
{tabIndex==0&&(<Box sx={{ p: 3 }} >
    <PeerList props={{list:savedPeers,name:"Saved"}} />                 

</Box>)}
{tabIndex==1&&(<Box sx={{ p: 3 }} >
    <PeerList props={{list:unScoredPeers,name:"UnScored"}} />
</Box>)}
{tabIndex==2&&(<Box sx={{ p: 3 }} >
    <PeerList props={{list:AvoidPeers,name:"Avoid"}} />
</Box>)}
        
        
        
        
        
        
        
        
        
        
        
        
        
        </Card>
)
        
}
export default PeerCards
