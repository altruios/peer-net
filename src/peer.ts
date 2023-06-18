import {Peer} from 'peerjs';
import Get_Shuffled from './utils/shuffle';

function CreatePeer(id:string, callback:any){
    let peer = new Peer(id);
    peer.on("open",callback)
    return peer;
}
class PeerNet{
    peer:any;
    id:string;
    feed:any[];
    table:any[];
    setFeed:any;
    setPeers:any;
    constructor(feed:any[],saved_id:string, setFeed:any,setPeers:any){
        this.id = import.meta.env.VITE_PEERID||saved_id||`peer-${crypto.randomUUID()}`;
        console.log(this.id,"is id")
        this.table = [];
        this.feed=feed;
        console.log(this.feed);
        this.peer=null;
        this.setFeed=setFeed;
        this.setPeers=setPeers;
    }
    linkFeed(feed:any[]){
        this.feed=feed;
    }
    filterFeed(feed:any[]){
        const raw = localStorage.getItem("peer-net/data")||'';
        const parsed = JSON.parse(raw)
        const filterlist = [...parsed.upvotes,...parsed.downvotes];
        return feed.filter((x:any)=>!filterlist.some((y:any)=>y.link===x.link));
    }
    updateFeed(feed:any[],source:string){
        console.log("feed data from",source);
        const new_feed = this.filterFeed(feed);
        this.setFeed((prev:any)=> {
            const next:any[]= Array.from(new Set([...prev,...new_feed]))
            this.feed=next;
            return next;
        })
        console.log(this.feed);
    }
    updatePeers(peers:any[],source:string){
        console.log("peers data from ",source,peers);
        const newPeers=peers.map(x=>(
            {peer:x?.peer,
            connected:x?.peerConnection?.connectionStatus
        })
        )
        this.setPeers((prev:any)=>{
            const next = newPeers.filter(x=>prev.peer!=x.peer);
            console.log("next is",next,newPeers);
            this.table=next;
            return next;
        })
    }
    connectNewPeer(p:any){
        console.log("new peer heard");
        const peer = {peer:p,connected:true}
        this.setPeers((prev:any)=>{
            const next= Array.from(new Set([...prev,peer])).filter(x=>x.peer!==this.id&&x.peer);
            this.table=next;
            return next;
        })
    }
    init(init_host:string){
        if(init_host!=this.id)this.table.push({peer:init_host,connected:true});
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
        })
        conn.on("close",(e:any)=>{
            console.log("e,",e,"closed");
        });   
        conn.on("disconnect",(e:any)=>{
            console.log("e,",e,"disconnected");
        });
    }
    ConReceives(conn:any,id:string){

            conn.on('data',async(data:any)=>{
                if(data.key=="peers"){
                    console.log("peers data from",id);
                    this.updatePeers(data.peers,id)
                    console.log("count of peers",this.table.length)
                }
                if(data.key=="feed"){
                    console.log("feed data from",id);
                    const new_feed = this.filterFeed(data.feed);
                    this.updateFeed(new_feed,id);
                }
                if(data.key=="get_feed"){
                console.log("get feed called")
                conn.send({key:"feed",feed:this.feed});
                }
                if(data.key=="get_peers"){
                const peers = Get_Shuffled(this.table,100);
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

        conn.send({key:"get_peers"})
        conn.send({key:"get_feed"});
    }
    connect(){
        console.log("start");
        if(this.table.length==0)this.init((import.meta.env.VITE_PEER0||""));
        console.log("peers:",this.table.length);
        let peer:any = CreatePeer(this.id,()=>{
            this.peer=peer;
            try{
                for(const t of this.table){
                    console.log("connecting")
                    this.connect_to_peer(t.peer);
                }   
            }catch(e){
                console.log(e);
                console.log("con heard in boot node")
            }
                peer.on('connection',(conn:any)=>{
                    console.log("connection heard");
                    this.ConReceives(conn,conn.peer);
                    if(conn.peer.startsWith('peer-')) this.updatePeers([conn],conn.peer);
                    console.log("this table",this.table);
                })
        
            })
        
        
    } 
    getPeers(saved_table:string[]){
        return saved_table.length>0?saved_table:this.table;
    }
    clearPeers(setPeers:any){
        this.table=[];
        setPeers([]);
    }
    notify(post:any){
        console.log("notification sending")

        for(const t of this.table){
            const conn = this.peer.connect(t.peer);
                conn.on("connection",(conn:any)=>{
                    conn.send({key:"notify",post,source:this.id})
                })
            
        }
    }

}
export default PeerNet
