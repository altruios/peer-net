import {Peer, PeerErrorType} from 'peerjs';
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
    }
    init(init_host:string){
        const peer:any = {peer:init_host,connected:false,score:0}
        const condition:boolean = init_host!==this.id; 
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
        console.log("conn",conn,"yes?");
        conn.on("open",()=>{
            console.log("connected to peer!",conn.peer);

            this.updatePeers([conn],id);
            this.updateConnStatus(conn,true);
            this.ConSends(conn);
            this.ConReceives(conn,id);
        })
        conn.on("connection",(e:any)=>{
            console.log("connection heard from",conn.peer,e);
            if(conn.peer.startsWith('peer-'))  {
                this.updateConnStatus(conn,true);
                this.ConReceives(conn,conn.peer);
                this.send_peers(conn);
            }
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
        console.log(this.pool.current,"updating conn status");
        if(state==false){
            this.disconnect(conn.peer);
            return;
        }
        const found = this.pool.current.find((x:any)=>x.peer==conn.peer);
        if(!found) this.pool.current.push(conn);
        else{console.log("already found, skipping updating",conn.peer,"to ",true)}
        console.log(this.pool);
    }
    send_peers_to_peer(conn:any){
        const active = store.getState().peers;
        const peers = active.filter(x=>x.score!=-1);
        console.warn("sending peers:",peers, "to peer",conn.peer);
        conn.send({key:"peers",peers})
    }
    ConReceives(conn:any,id:string){
            const blocked = store.getState().peers.filter(x=>x.score==-1);
            if(blocked.find(x=>x.peer==conn.peer)){
                console.log("blocking connection of peer",id);
                conn.disconnect();
                return;
            }
            conn.on('data',async(data:any)=>{
                console.log("raw data",data);
                if(data.key=="hello"){
                    console.log("I hear you!");
                }
                if(data.key=="update_peers"||data.key=="peers"){
                    console.log("peers called from",id);
                    console.log("data is:", data);
                    for(const peer of data.peers){
                        this.updatePeers([peer],id);
                    }
                }
                if(data.key=="feed"){
             //       console.log("feed called from",id);
                    const new_feed = this.filterSeenFeed(data.feed);
                    const flat_feed = new_feed.map(x=>({...x,vote:0}));
                    this.updateFeed(flat_feed,id);
                }
                if(data.key=="get_feed"){
           //         console.log("get_feed called from",id);

                    const feed = store.getState().posts.filter(x=>x.vote>0);
                    console.log(feed,"is feed");
                   conn.send({key:"feed",feed});
                }
                if(data.key=="get_peers"){ 
                    console.log("get_peers called from",id);
                    this.send_peers_to_peer(conn);
                    this.update_peer_network(conn);
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
    update_peer_network(conn:any){
        const peers:any= store.getState().peers;
        for(const c of this.pool.current){
            if(c.peer!==conn.peer){
                c.send({key:"update_peers",peers})
            }
        }
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
        this.send_peers_to_peer(conn);
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
      //  console.log(this.peer,conn); 
        const feed = store.getState().posts.filter(x=>x.vote>0);
        conn.send({key:"feed",feed});

    }
    get_feed(conn:any){
      //  console.log(this.peer,conn); 
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
                console.log("connecting",t,"to that peer in init peer")
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
                if(this.is_blocked(conn)){
                    this.updateConnStatus(conn,false);
                    this.disconnect(conn);
                }
                this.ConReceives(conn,conn.peer);
                if(conn.peer.startsWith('peer-')) this.updatePeers([conn],conn.peer);
                this.send_peers(conn);
            })
                
        })
    }
    is_blocked(conn:any){
        return store.getState().peers.find(x=>x.peer==conn.peer);
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
    disconnect(peer:any){
        console.log("attempting to disconnect",peer);
        console.log(this.pool.current);
        const found = this.pool.current.find((x:any)=>x.peer==peer.peer);
        console.log("found",found)
        if(found){
            found.close();
            this.pool=this.pool.filter((x:any)=>x.peer==peer.peer);
            console.log("successfully disconnected");
        }
    }
    get_peers_of(peer:any){
        this._get_of(peer,(conn:any)=>{
            conn.send({key:"get_peers"})
        })
    }
    _get_of(peer:any,callback:any){
        const conn = this.pool.current.find((x:any)=>x.peer==peer.peer);
        if(conn){
            callback(conn);
        }else{
            console.log("peer,",peer);
            console.error("peer not in pool");
            console.log(this.pool.current.map((x:any)=>x.peer));
            console.log("\n\n\n");
        }
    }
    get_feed_from(peer:any){
        this._get_of(peer,(conn:any)=>{
            conn.send({key:"get_feed"});
        })
    }

}
export default PeerNet
