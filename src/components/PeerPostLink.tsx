import { MouseEvent, useState,useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import styled from 'styled-components'
import {Button, FormControl, Input, InputLabel,Container,ButtonGroup,Dialog, List, Card} from '@mui/material'
import { addPost } from "../slices/postSlice";
import PEER_NET from "../PEER_NET";





const PeerPostLink = (props:any)=>{
    const [isOpened,setIsOpened] = props.openState;
    const dispatch = useDispatch();
    const [newTitle,setNewTitle]=useState('');
    const [newLink,setNewLink]=useState('');
    const [newImage,setNewImage]=useState('');
    const [newText,setNewText]=useState('');
    const clear_post = ()=>{

        setNewImage('');
        setNewLink('');
        setNewText('');
        setNewTitle('');
    }
    const onProceed = () => {
        console.log("Proceed clicked");
        console.log(newText,newTitle,newImage,newLink);
        const post = {
            title:newTitle,
            link:newLink,
            image:newImage,
            text:newText,
            vote:1,
            source:PEER_NET.id
        }
        dispatch(addPost({post,source:post.source}))
        PEER_NET.notify(post,PEER_NET.id);
        onClose();
    };
    const onClose=()=>{
        setIsOpened(false);
        clear_post();
    }
    return(
    <Dialog 
        title="Add link"
        open={isOpened}
        onClose={onClose}
        sx={{
            display:"flex",
            flexFlow:"column nowrap",
            
        }}    
        >
            <Card variant="outlined"
                sx={{display:"flex",
                flexFlow:"column nowrap",
                paddingInline:"7rem",
                paddingBlock:"5rem"

            }}>

            <FormControl variant="standard"
              sx={{paddingBlock:"2rem"}}
          >
            
            <InputLabel htmlFor="content-title">title</InputLabel>

            <Input 
            fullWidth={true}
                id="content-title" 
                value={newTitle} 
                onChange={(e)=>setNewTitle(e.target.value)} />
            </FormControl>

            <FormControl variant="standard"
                          sx={{paddingBlock:"2rem"}}

            >

            <InputLabel htmlFor="content-link">link</InputLabel>
            <Input id="content-link" value={newLink} onChange={(e)=>setNewLink(e.target.value)} />
            </FormControl>
            <FormControl variant="standard"
                          sx={{paddingBlock:"2rem"}}
                          >

            <InputLabel htmlFor="content-image-URL">image-URL</InputLabel>
            <Input id="content-image-URL" value={newImage} onChange={(e)=>setNewImage(e.target.value)} />
            </FormControl>
            <FormControl variant="standard"
                          sx={{paddingBlock:"2rem"}}
                          >

            <InputLabel htmlFor="content-text">text</InputLabel>
            <Input id="content-text" value={newText} onChange={(e)=>setNewText(e.target.value)} />
            </FormControl>

            <ButtonGroup
                sx={{
                    display:"flex",
                    justifyContent:"center",
                    paddingBlock:"2rem"
                }}
                >

            <Button onClick={onProceed}>submit</Button>
            <Button onClick={()=>onClose()}>close</Button>
            </ButtonGroup>
                </Card>

        </Dialog>
)}
export default PeerPostLink;
