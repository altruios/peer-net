import {Peer} from 'peerjs';
import Get_Shuffled from './utils/shuffle';

function CreatePeer(id:string, callback:any){
    let peer = new Peer(id);
    peer.on("open",callback)
    return peer;
}
class PeerNet{
    peer:any;
    pool:any[];
    id:string;
    feed:string[];
    table:string[];
    updateFeed:any;
    updatePeers:any;
    constructor(feed:string[],saved_id:string, updateFeed:any,updatePeers:any){
        this.id = saved_id?saved_id:`peer-${crypto.randomUUID()}`
        this.table = [];
        this.pool=[];
        this.feed=feed;
        this.peer=null;
        this.updateFeed=updateFeed;
        this.updatePeers=updatePeers;
    }
    filterFeed(feed:any[]){
        const raw = localStorage.getItem("peer-net/data")||'';
        const parsed = JSON.parse(raw)
        const filterlist = [...parsed.upvotes,...parsed.downvotes];
        return feed.filter((x:any)=>!filterlist.some((y:any)=>y.link===x.link));
    }
    init(init_host:string){
        this.table.push(init_host);
    }
    async connect(){
        if(this.table.length==0)this.init((import.meta.env.VITE_PEER0||""));
        let peer:any = CreatePeer(this.id,()=>{
            this.peer=peer;
            for(const id of this.table){
                let conn = peer.connect(id);
                conn.on("open",()=>{
                    this.pool=Array.from(new Set([...this.pool,conn]))
                    conn.send({key:"get_peers"})
                    conn.send({key:"get_feed"});
                    conn.on('data',(data:any)=>{
                        if(data.key=="peers"){
                            this.updatePeers((prev:any)=>{
                                const peers= Array.from(new Set([...prev,...data.peers])).filter(x=>x!==this.id);
                                this.table=peers;
                                return peers;
                            })
                            if(this.getPeers([]).length<100)this.getMorePeers();
                        }
                        if(data.key=="feed"){
                            const new_feed = this.filterFeed(data.feed);
                            this.updateFeed((prev:any)=> Array.from(new Set([...prev,...new_feed])))
                        }
                        if(data.key=="get_feed"){
                            conn.send({key:"feed",feed:this.feed});
                        }else if(data.key=="get_peers"){
                            const peers = Get_Shuffled(this.table,100);
                            conn.send({key:"peers",peers});
                        }
                    })
                })
            }   
        });
    }       
    getMorePeers(){
        for(const conn of this.pool){
            conn.on("open",()=>{
                conn.send({key:"get_peers"})
                conn.on('data',(data:any)=>{
                    if(data.key=="peers"){
                        this.updatePeers((prev:any)=>Array.from(new Set([...prev,...data.peers])))
                        if(this.getPeers([]).length<100) this.getMorePeers();
                    }
                    else if(data.key=="get_peers"){
                        conn.send({
                            key:"peers",
                            peers:Get_Shuffled(this.table,100)
                        });
                    }
                })
            })
        }
    }
    getPeers(saved_table:string[]){
        return saved_table.length>0?saved_table:this.table;
    }
    clearPeers(setPeers:any){
        this.table=[];
        this.pool=[];
        setPeers([]);
    }
}
export default PeerNet
