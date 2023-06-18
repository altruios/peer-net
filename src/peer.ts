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
    feed:any[];
    table:string[];
    setFeed:any;
    setPeers:any;
    constructor(feed:any[],saved_id:string, setFeed:any,setPeers:any){
        this.id = import.meta.env.VITE_PEERID||saved_id||`peer-${crypto.randomUUID()}`;
        console.log(this.id,"is id")
        this.table = [];
        this.pool=[];
        this.feed=feed;
        console.log(this.feed);
        this.peer=null;
        this.setFeed=setFeed;
        this.setPeers=setPeers;
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
        console.log("peers data from ",source);
        this.setPeers((prev:any)=>{
            const next= Array.from(new Set([...prev,...peers])).filter(x=>x!==this.id);
            this.table=peers;
            return next;
        })
    }
    init(init_host:string){
        if(init_host==this.id) throw "configuring boot node";
        else this.table.push(init_host);
    }
    async connect(){
        console.log("start");
        try{
            if(this.table.length==0)this.init((import.meta.env.VITE_PEER0||""));
            console.log("peers:",this.table.length);
            let peer:any = CreatePeer(this.id,()=>{
                this.peer=peer;
                for(const id of this.table){
                    console.log("attempting to connect to",id)
                    let conn = peer.connect(id);
                    
                    conn.on("open",()=>{
                        console.log(id,":open");
                        this.pool=Array.from(new Set([...this.pool,conn]))
                        conn.send({key:"get_peers"})
                        conn.send({key:"get_feed"});
                        console.log("sending requests for peers and feed");
                        conn.on('data',(data:any)=>{
                            if(data.key=="peers"){
                                console.log("peers data from",id);
                                this.updatePeers(data.peers,id)
                                console.log("count of peers",this.table.length)
                                if(this.getPeers([]).length<100)this.getMorePeers();
                            }
                            if(data.key=="feed"){
                                console.log("feed data from",id);
                                const new_feed = this.filterFeed(data.feed);
                                this.updateFeed(new_feed,id);
                            }
                            if(data.key=="get_feed"){
                                console.log("get feed called")
                                conn.send({key:"feed",feed:this.feed});
                            }else if(data.key=="get_peers"){
                                const peers = Get_Shuffled(this.table,100);
                                conn.send({key:"peers",peers});
                            }
                        })
                    })
                    conn.on("error",(e:any)=>{
                        console.log(e,"is error")
                    })
                }   
            });
        }catch(e){
            console.log(e);
            let peer:any = CreatePeer(this.id,()=>{
                this.peer=peer;
                peer.on('connection',(conn:any)=>{
                    console.log("this table",this.table);

                    console.log("con heard in boot node",{conn:conn.peer})
                    if(conn.peer.startsWith('peer-')) this.updatePeers([conn.peer],conn.peer);
                    console.log("this table",this.table);
                    conn.on('data',(data:any)=>{
                        if(data.key=="peers"){
                            this.updatePeers(data.peers,conn.peer);

                            if(this.getPeers([]).length<100)this.getMorePeers();
                        }
                        if(data.key=="feed"){
                            console.log("feed,",data.feed);
                            const new_feed = this.filterFeed(data.feed||[]);
                            this.updateFeed(new_feed,conn.peer)
                        }
                        if(data.key=="get_feed"){
                            console.log("feeding this one this:",this.feed)
                            console.log(this.feed,"is feed");
                            conn.send({key:"feed",feed:this.feed});
                        }else if(data.key=="get_peers"){
                            const peers = Get_Shuffled(this.table,100);
                            conn.send({key:"peers",peers});
                        }
                    })
                    conn.on("error",(e:any)=>{
                        console.log(e,"is error")
                    })                           
                })
            })
        }
        
    }       
    getMorePeers(){
        for(const conn of this.pool){
            conn.on("open",()=>{
                conn.send({key:"get_peers"})
                conn.on('data',(data:any)=>{
                    if(data.key=="peers"){
                        this.updatePeers(data.peers,conn.peer);
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
