import {Peer} from 'peerjs';
import Get_Shuffled from './utils/shuffle';
import {updateFeed} from './slices/postSlice';
import {updateStateOfPeer, addPeer,addNewPeers } from './slices/peerSlice';
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
    pool:any;
    constructor(){
        this.id = import.meta.env.VITE_PEERID||`peer-${crypto.randomUUID()}`;
        console.log(this.id,"is id")
        this.peer=null;
    }
    setPool(ref:any){
        this.pool=ref;
    }

    filterSeenFeed(feed:any[]){
        const filterlist = store.getState().posts;
        return feed.filter((x:any)=>!filterlist.some((y:any)=>y.link===x.link)).map((x:any)=>({...x,vote:0}));
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
                score:x?.score
            }
        });
        peers.forEach((peer:any)=>{
            console.log("updating peers, ,",peer)
        })
        this.dispatch(addNewPeers({peers:newPeers,id:this.id}))
        const uniques = this.pool.current.filter((x:any)=>!peers.some(conn=>conn.peer=x.peer));
        for(const u of uniques){
            this.pool.current.push(u);
        }
    }
    init(init_host:string){
        const peer:any = {peer:init_host,connected:false,score:0}
        const condition:boolean = init_host!==this.id; 
        console.log("peer",peer,condition);
        if(condition){
            this.dispatch(addPeer(peer));
            return [peer]
        }
        return []
    }
    setPeer(value:any){
        this.peer=value;
    }
    connect_to_peer(id:string){
        console.log("this is:",id,"is id of connection")
        const conn = this.peer.connect(id);
        conn.on("open",()=>{
            console.log("connected to peer");
            this.peer._socket._socket.send("json data");

            this.updatePeers([conn],id);
            this.updateConnStatus(conn,true);
            this.ConSends(conn);
            this.ConReceives(conn,id);
        })
        conn.on("connection",(e:any)=>{
            console.log("connection heard from",conn.peer);
            this.updateConnStatus(conn,true)
            this.ConReceives(conn,conn.peer);
            if(conn.peer.startsWith('peer-')) this.updatePeers([conn],conn.peer);
            this.send_peers(conn);
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
        console.log("conn",conn,"status",state);
        this.dispatch(updateStateOfPeer({peer:conn.peer,connected:state}));
        console.log(this.pool.current);
        const found = this.pool.current.find((x:any)=>x.peer==conn.peer);
        if(!found) this.pool.current.push(conn);
        
        console.log(this.pool);
    }
    send_peers_to_peer(conn:any){
        const active = store.getState().peers;
        console.log("sending peers to peer",conn.peer);
        conn.send({key:"peers",peers:active})
    }
    ConReceives(conn:any,id:string){
            conn.on('data',async(data:any)=>{
                console.log("raw data",data);
                if(data.key=="hello"){
                    console.log("I hear you!");
                }
                if(data.key=="peers"){
                    console.log("peers called from",id);
                    console.log("data is:", data);
                    this.updatePeers(data.peers,id)
                }
                if(data.key=="feed"){
                    console.log("feed called from",id);
                    const new_feed = this.filterSeenFeed(data.feed);
                    const flat_feed = new_feed.map(x=>({...x,vote:0}));
                    this.updateFeed(flat_feed,id);
                }
                if(data.key=="get_feed"){
                    console.log("get_feed called from",id);

                    const feed = store.getState().posts.filter(x=>x.vote>0);
                   conn.send({key:"feed",feed});
                }
                if(data.key=="get_peers"){ 
                    console.log("get_peers called from",id);
                    this.send_peers_to_peer(conn);
                }
                if(data.key=="notify"){
                    console.log("notification called from",id)
                    if(await this.isNew(data.post)){
                        this.push_to_feed(data.post,data.source);
                        this.notify(data.post,data.source)
                    }
                }
        })
    }
    async isNew(post:any){
        const posts = store.getState().posts;
        return posts.every((x:any)=>x.link!=post.link)
    }
    push_to_feed(post:any,source:string){
        this.updateFeed([post],source)
    }
    ConSends(conn:any){
        console.log("sending ")
        this.get_peers(conn);
        this.get_feed(conn);
        this.show_feed(conn);
    }
    send_peers(c:any){
        const active = store.getState().peers;
        for(const conn of this.pool.current.filter((x:any)=>x.peer==c.peer)){
            conn.send({key:"peers",peers:active});

        }
    }
    get_peers(conn:any){
        conn.send({key:"get_peers"})
}
    get_feeds(conns:any[]){
        for(const c of conns){
            console.log("is p!@#!@#!@#!@#",c);
            this.get_feed(c);
        }
    }
    show_feed(conn:any){
        console.log(this.peer,conn); 
        const feed = store.getState().posts.filter(x=>x.vote>0);
        conn.send({key:"feed",feed});

    }
    get_feed(conn:any){
        console.log(this.peer,conn); 
        conn.send({key:"get_feed"});
    }
    async _initPeer(peers:any[]){
        let success = true;
        let peer:any = CreatePeer(this.id,()=>{
            this.setPeer(peer);
            console.log("peer created and heard!!!!")
            console.log("peers, length",peers.length,peers.length==0);
            
            try{
            if(peers.length==0){ 
                console.log("no peers");
                throw ("skipping peer connect as no peers are present")
            }
            for(const t of peers){
                console.log("connecting",t,"to that")
                this.connect_to_peer(t.peer);
            }   
            }catch(e){
                console.log(e);
                console.log(peers);
                console.log("boot node mode detected")
            }
            peer.on('connection',(conn:any)=>{
                console.log("connection heard from",conn.peer);
                this.updateConnStatus(conn,true)
                this.ConReceives(conn,conn.peer);
                if(conn.peer.startsWith('peer-')) this.updatePeers([conn],conn.peer);
                this.send_peers(conn);
            })
                
        })
    }

    connect(peers:any[]){
        console.log("start",peers);
        if(peers.length==0) peers=this.init((import.meta.env.VITE_PEER0||""));
        console.log(peers.length,peers);
        this._initPeer(peers);
        
        
    } 
    notify(post:any,source:string){
        for(const conn of this.pool.current){
            conn.send({key:"notify",post,source})
        }
    }

}
export default PeerNet
