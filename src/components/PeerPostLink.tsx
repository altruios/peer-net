import { MouseEvent, useState,useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import styled from 'styled-components'
import { addPost } from "../slices/postSlice";
import PEERNET from "../PEERNET";
const Container = styled.dialog`
  width: 40%;
  border-radius: 8px;
  border: 1px solid #888;
    color:#00fa00;
    background-color: rgba(164, 46, 67, 0.607);
  ::backdrop {
  }
`;

const Buttons = styled.div`
  display: flex;
  border:solid;
  border-radius:4rem;
  justify-content:center;
  gap: 10rem;
`;

const isClickInsideRectangle = (e: MouseEvent, element: HTMLElement) => {
  const r = element.getBoundingClientRect();

  return (
    e.clientX > r.left &&
    e.clientX < r.right &&
    e.clientY > r.top &&
    e.clientY < r.bottom
  );
};

type Props = {
  title: string;
  isOpened: boolean;
  onProceed: () => void;
  onClose: () => void;
  children: React.ReactNode;
};

const DialogModal = ({
  title,
  isOpened,
  onProceed,
  onClose,
  children,
}: Props) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpened) {
      ref.current?.showModal();
      document.body.classList.add("modal-open"); // prevent bg scroll
    } else {
      ref.current?.close();
      document.body.classList.remove("modal-open");
    }
  }, [isOpened]);

  const proceedAndClose = () => {
    onProceed();
    onClose();
  };

  return (
    <Container
      ref={ref}
      onCancel={onClose}
      onClick={(e:any) =>
        ref.current && !isClickInsideRectangle(e, ref.current) && onClose()
      }
    >
      <h3>{title}</h3>

      {children}

      <Buttons>
        <button className="Keep-Btn" onClick={proceedAndClose}>Proceed</button>
        <button className="Remove-Btn" onClick={onClose}>Close</button>
      </Buttons>
    </Container>
  );
};

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
        }
        dispatch(addPost({post,source:PEERNET.id}))
        PEERNET.notify(post,PEERNET.id);
        onClose();
    };
    const onClose=()=>{
        setIsOpened(false);
        clear_post();
    }
    return(
    <DialogModal 
        title="Add link"
        isOpened={isOpened}
        onProceed={onProceed}
        onClose={onClose}>
            <div className="newForm">

            <div className="inputDiv">
            <label> title</label>
            <input className='newTitle' value={newTitle} onChange={(e)=>setNewTitle(e.target.value)}></input>
            </div> 
            <div className="inputDiv">
            <label> link</label>
            <input className="newLink" value={newLink} onChange={(e)=>setNewLink(e.target.value)}></input>
            </div> 
            <div className="inputDiv">
            <label> image-URL</label>
            <input className="newImage" value={newImage} onChange={(e)=>setNewImage(e.target.value)}></input>
            </div> 
            <div className="inputDiv">
            <label> text</label>
            <textarea className="newText" value={newText} onChange={(e)=>setNewText(e.target.value)}></textarea>
            </div> 

            </div>
        </DialogModal>
)}
export default PeerPostLink;
