import {Peer} from 'peerjs';
import { useSelector } from 'react-redux';
import Get_Shuffled from './utils/shuffle';
import {updateFeed} from './slices/postSlice';
import {updateConnOfPeer,selectPeerByID, updateStateOfPeer, addPeer,addNewPeers } from './slices/peerSlice';
import store from './store';
function CreatePeer(id:string, callback:any){
    let peer = new Peer(id);
    peer.on("open",callback)
    return peer;
}
class PeerNet{
    peer:any;
    id:string;
    dispatch:any=store.dispatch;
    constructor(saved_id:string){
        this.id = import.meta.env.VITE_PEERID||saved_id||`peer-${crypto.randomUUID()}`;
        console.log(this.id,"is id")
        this.peer=null;
    }

    filterSeenFeed(feed:any[]){
        const filterlist = store.getState().posts.filter(x=>x.vote!=0);
        return feed.filter((x:any)=>!filterlist.some((y:any)=>y.link===x.link));
    }
    updateFeed(feed:any[],source:string){
        console.log("feed data from",source);
        const new_feed = this.filterSeenFeed(feed);
        this.dispatch(updateFeed({feed:new_feed}));
    }
    updatePeers(peers:any[],source:string){
        console.log("peers data from ",source,peers);
        const newPeers=peers.map(x=>{
            return{
                peer:x?.peer,
                connected:true,
                conn:x,
                score:x?.score
            }
        });
        peers.forEach((peer:any)=>{
            console.log("updating peers, ,",peer)
        })
        this.dispatch(addNewPeers({peers:newPeers}))
    }
    init(init_host:string){
        if(init_host!=this.id)this.dispatch(addPeer({peer:init_host,connected:false, conn:null,score:0}));
    }
    connect_to_peer(id:string){
        const conn = this.peer.connect(id);
        console.log(id,"is id of connection")
        conn.on("open",()=>{
            console.log("connected to peer");
            this.updatePeers([conn],id);
            this.ConSends(conn);
            this.ConReceives(conn,id);
        })
        conn.on("error",(e:any)=>{
            console.log(e,"is error")
            this.updateConnStatus(conn,false);
        })
        conn.on("close",(e:any)=>{
            console.log("e,",e,"closed");
            this.updateConnStatus(conn,false);

        });   
        conn.on("disconnect",(e:any)=>{
            console.log("e,",e,"disconnected");
            this.updateConnStatus(conn,false);

        });
    }
    updateConnStatus(conn:any,state:boolean){
        const peer = useSelector(selectPeerByID(conn.peer));
        this.dispatch(updateConnOfPeer({peer:peer.peer,conn}));
        this.dispatch(updateStateOfPeer({peer:peer.peer,state}));
    }
    ConReceives(conn:any,id:string){
            conn.on('data',async(data:any)=>{
                this.dispatch(updateConnOfPeer({peer:conn.peer,conn}))
                if(data.key=="peers"){
                    console.log("peers data from",id);
                    this.updatePeers(data.peers,id)
                }
                if(data.key=="feed"){
                    console.log("feed data from",id);
                    const new_feed = this.filterSeenFeed(data.feed);
                    this.updateFeed(new_feed,id);
                }
                if(data.key=="get_feed"){
                    const feed = store.getState().posts.filter(x=>x.vote>0);
                   conn.send({key:"feed",feed});
                }
                if(data.key=="get_peers"){

                    const active = store.getState().peers.filter(x=>x.state)
                    const peers = Get_Shuffled(active,100);
                    conn.send({key:"peers",peers});
                }
                if(data.key=="notify"){
                    console.log("notification heard")
                    if(await this.isNew(data.post)){
                        this.push_to_feed(data);
                        this.notify(data)
                    }
                }
        })
    }
    async isNew(post:any){
        const rawJson = localStorage.getItem('peer-net/data')||'{upvotes:[{"link":""}]}';
        const data = JSON.parse(rawJson);
        return data.upvotes.every((x:any)=>x.link!=post.link)&&
        data.downvotes.every((x:any)=>x.link!=post.link)&&
        data.feed.every((x:any)=>x.link!=post.link)
    }
    push_to_feed(data:any){
        this.updateFeed([data.post],data.source)
    }
    ConSends(conn:any){
        console.log("sending ")
        this.get_peers(conn);
        this.get_feed(conn);
    }
    get_peers(conn:any){
        conn.send({key:"get_peers"});

    }
    get_feeds(peers:any[]){
        for(const p of peers){
            console.log("is p!@#!@#!@#!@#",p);
            this.get_feed(p.conn);
        }
    }
    get_feed(conn:any){
        console.log(this.peer); 
        conn.send({key:"get_feed"});
    }
    connect(){
        console.log("start");
        const peers = store.getState().peers.filter(x=>x.state)
        if(peers.length==0) this.init((import.meta.env.VITE_PEER0||""));
        let peer:any = CreatePeer(this.id,()=>{
            this.peer=peer;
            try{
                if(peers.length==0) throw "skipping peer connect as no peers are present"
                for(const t of peers){
                    console.log("connecting")
                    this.connect_to_peer(t.peer);
                }   
            }catch(e){
                console.log(e);
                console.log("boot node mode detected")
            }
                peer.on('connection',(conn:any)=>{
                    this.updateConnStatus(conn,true)
                    console.log("connection heard");

                    this.ConReceives(conn,conn.peer);
                    if(conn.peer.startsWith('peer-')) this.updatePeers([conn],conn.peer);
                })
        
            })
        
        
    } 
    notify(post:any){
        const active = store.getState().peers.filter(x=>x.state)
        console.log("notification sending")

        for(const t of active){
            const conn = this.peer.connect(t.peer);
                conn.on("connection",(conn:any)=>{
                    conn.send({key:"notify",post,source:this.id})
                })
            
        }
    }

}
export default PeerNet
