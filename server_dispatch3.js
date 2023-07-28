class server{
    id=""
    pool={current:[]};
    lastType="a"
    a={
        list:[],
        acc:0,
        inc:0,
        lim:2,    
        type:"a"
    }
    b={
        list:[],
        acc:0,
        inc:0,
        lim:2, 
        type:"b"
    }
    forward=null;
    score={a:0,b:0};
    flip=false;
    constructor(id){
        this.id=id;
    }
    connect_to_peer(peer,type,pass){
        console.log(this.id,"connect_to_peer",peer.id,"type:",type,"replying_conn:",pass);
        //connect to peer by id.
        //temp test using local data
        const has = this.pool.current.find(x=>x.id==peer.id);
        if(!has){

            this.pool.current.push(peer);
            this[type].list.push(peer);
            this[type].inc+=1//this[type].lim;
            this[type].acc++;
            this.score_self(type);
            !pass?peer.connect_to_peer(this,type,true):null;
            this[type].inc=Math.min(this[type].inc,this[type].list.length-1);

        }
    }
    find_target(id){
        return this.pool.current.find(x=>x.id==id);
    }
    score_self(type){
        //actually async but whatever...
        this.score[type]= this[type].list.reduce(
            (acc,x)=>acc+=x[type].list.length,this[type].list.length)
            
            console.log(this.id,"score_self",this.score);
    }
    getScoreObj(type){
        return {id:this.id,score:this.score[type]}
    }
    getType(){
        this.lastType=this.lastType=="a"?"b":"a";
        return this.lastType;
    }
    SERVERDISPATCH(attachPeer,capturedPeers, primaryType,VisitedPeers){
        if(!VisitedPeers){
            VisitedPeers=[];
        }
        if(!capturedPeers){
            capturedPeers=[];
        }
        if(!primaryType){
            primaryType=this.getType();//round robin on entry
        }
        capturedPeers=capturedPeers.filter(x=>x);
        VisitedPeers=VisitedPeers.filter(x=>x);
        const ot = primaryType=="a"?"b":"a";

        console.log(this.id,"SERVER DISPATCH attaching",attachPeer.id,"captured peers:",capturedPeers.map(x=>x.id),{primaryType},VisitedPeers.length);
        if(this[primaryType].list.length<this[primaryType].lim){
            console.log(this.id,"SERVER DISPATCH connecting",attachPeer.id,"to slot in",{primaryType});
            this.connect_to_peer(attachPeer,primaryType);
            if(capturedPeers){
                console.log(this.id,"SERVER DISPATCH tells",attachPeer.id,"to attach",capturedPeers.map(x=>x.id));
                for(const peer of capturedPeers){
                    console.log(this.id," SERVER DISPATCH attaching peer of peer",attachPeer.id,peer.id,{ot});
                    attachPeer.connect_to_peer(peer,ot);    
                }
            }
        }else{
            capturedPeers=capturedPeers?.length>0?capturedPeers:this.getForwards(ot,VisitedPeers);
            VisitedPeers.push(this);
            const potential_targets= this[primaryType].list.map((x)=>x)
            .filter(x=>VisitedPeers.every(y=>y.id!=x.id));
            potential_targets.sort((a,b)=>a.score-b.score);
            const pts = potential_targets.filter(x=>x.is_safe(ot));
            const pt=pts[0];
            const t = this[primaryType].list[this[primaryType].inc];
            
            const target = pt || t;
            console.log(this.id,"SERVER DISPATCH target",target?.id,{primaryType},this[primaryType].list.map(x=>x.id),this[primaryType].inc);
            this[primaryType].inc++;
            if(this[primaryType].list.length>1&&this[primaryType].inc>this[primaryType].list.length-1){
                this[primaryType].inc=this[primaryType].inc%(this[primaryType].list.length-1);
           }
            this[primaryType].inc=Math.min(this[primaryType].inc,this[primaryType].list.length-1);
            target.SERVERDISPATCH(attachPeer,capturedPeers,primaryType,VisitedPeers);

        }
    }
    is_safe(type){
        return this[type].list.length<this[type].lim
    }
    getForwards(type,vp,fall_through){
        console.log(this.id,"getForwards",{type},{fall_through});
        let forwards=this[type].list.filter(x=>x[type].list.length<x[type].lim)
        .filter(x=>!vp.includes(y=>y.id==x.id))
        let copyf=forwards;
        let setForward = new Set(forwards.map(x=>x.id));
        
        forwards = Array.from(setForward).map(x=>copyf.find(y=>y.id==x));
        console.log(this.id,"getForwards","setforward",setForward);
        console.log(this.id,"getForwards","get",{type},"of forwards of are:",copyf.map(x=>x?.id))
        if(forwards.length>0||fall_through){
            if(forwards.length==0){
                console.log(this.id,"getForwards"," returning self")
                return [this.id];
            }
            let scores = forwards.map(x=>x);
            scores?.sort((a,b)=>a.score-b.score).filter(x=>x.score<x[type].limit);
            //if they are all the same score and full
            if(scores[0].score==scores[scores.length-1].score &&scores.length>0){
                const safe =forwards?.filter(x=>x.is_safe(type=="a"?"b":"a"))
                console.log(this.id,"getForwards","returning filtered forwards that are safe",safe.map(x=>x.id));
                
                return safe
            }
            else{
                const target=[];
                let inc=0;
                for(const s of scores){
                    if(inc>=this[type].lim-1){
                        continue;
                    }else{
                        inc+=1;
                        target.push(forwards.find(x=>x.id==s.id));
                        if(inc>this[type].lim-1){
                            inc-=1;
                            target.pop();
                        }
                    }
                }
                console.log(this.id,"getForwards","actually we return this",target.map(x=>x.id))
                return target
            }
        }
        console.log(this.id,"getForwards","finally this,",forwards);
        return forwards;

    }



}
//sample test for debugging
const peers = [];
const boot_node = new server("boot-0");
peers.push(boot_node);
for(let i=1;i<512;i++){
    peers.push(new server(`peer-${i}`))
}
console.log("\n\n~~~~~~~~~STARTING~~~~~~~~~\n\n")
peers.forEach((p,i,arr)=>{
    if(i!==0){
        if(i<arr.length/2){

            console.log("dispatching",p.id);
            boot_node.SERVERDISPATCH(p);
            console.log("success:\n\n\n");
        }else{
            //what happens if someone connects to the network from an arbitrary node
            
            const rng_connect_test_node = arr[Math.floor(i*Math.random())]
            console.log("dispatching",p.id);
      //      rng_connect_test_node.server_dispatch(p.id);
            boot_node.SERVERDISPATCH(p);
            console.log("success:\n\n\n");

        }
    }
})
console.log(boot_node.a.list,boot_node.b.list);
const error_nodes = peers.filter(x=>x.pool.current.length>x.a.lim+x.b.lim);
console.log("error nodes", error_nodes.map(x=>x.id),error_nodes[0]);
//list ids, and connection pools,
import C from 'csv-writer';
const createCsvWriter = C.createObjectCsvWriter
const path = "output.csv";
const header = [{id:"source",title:"source"},{id:"target",title:"target"},{id:"Label",title:"Label"}];
const csvWriter = createCsvWriter({path,header});
const data=[]
peers.forEach(node=>{
    const a_out = node.a.list;
    const b_out = node.b.list;
    a_out.forEach(a=>data.push({source:node.id,target:a.id,Label:"A"}))
    b_out.forEach(b=>data.push({source:node.id,target:b.id,Label:"B"}))
})
csvWriter.writeRecords(data).then(()=>console.log("yay!"))
