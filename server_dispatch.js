class server{
    id=""
    pool={current:[]};
    a={
        list:[],
        acc:0,
        inc:0,
        lim:3,    
    }
    b={
        list:[],
        acc:0,
        inc:0,
        lim:3, 
    }
    forward=null;
    score=0;
    constructor(id){
        this.id=id;
    }
    send_link(request_id,send_id,forward_link){
        const target_conn = this.find_target(send_id);
        if(!target_conn){
            console.log("This should never happen normally",this.id,"req/send",request_id,send_id,this.a.list,this.b.list);
        }
        target_conn.send({
            key:"server_dispatch",
            data:{
                id:request_id,
                fid:forward_link
            }

        });
    }
    send(obj){
        this.server_dispatch(obj.data.id,obj.data.fid);
    }
    connect_to_peer(id,type){
        //connect to peer by id.
        //temp test using local data
        const found = peers.find(x=>x.id==id);
        const has = this.pool.current.find(x=>x.id==id);
        const found_has = found.pool.current.find(x=>x.id==this.id);
        if(has==undefined&&found_has==undefined){

            this.pool.current.push(found);
            this[type].list.push(id);
            found.pool.current.push(this);
            found[type].list.push(this.id);
            this[type].inc+=1//this[type].lim;
            this[type].acc++;
            found[type].inc+=1//found[type].lim;
            found[type].acc++;
            found.score_self();
            this.score_self();
        }
    }
    getforward(id){
        const node = this.pool.current.find(x=>x.id==id);
        let ref = node;
        let last_ref=node;
        let slast_ref=node;
        let [_z,_zz] = ref.a.acc>ref.b.acc?["b","a"]:["a","b"];
        let i=0;
        while(ref&&ref[_z].list.length>=ref[_z].lim){
          //   [_z,_zz] = ref.a.acc>ref.b.acc?["b","a"]:["a","b"];

            let z = ref[_z];
            const zz = ref[_zz];
            //not round robin, try a fill the lowest?
            //we are going to cheat here and simulate a async
            //call to get a score (how many connections you have);
            
            const scores = ref.pool.current.map(x=>({score:x.score,id:x.id}))
            scores.sort((a,b)=>a.score-b.score);
         //   console.log(scores.map(x=>x),"are scores");
            const is_equal = scores.every(x=>x.score==scores[0].score)
            const a = z.list[Math.floor(z.inc)];
            const b = zz.list[Math.floor(zz.inc)];
            let tid = (is_equal)?a:b;
       //     console.log(a,b,is_equal,"going to do the thing",z.inc,z.list);
            console.log("target",a,b,zz.list,zz.inc,tid,i++,this.id,"id",z);;
            z.inc++//z.lim;
            z.acc++;
            zz.acc++;
            zz.inc++;
            z.inc=Math.min(z.list.length-1,z.inc);
            zz.inc=Math.min(zz.list.length-1,zz.inc);
           console.log(ref,"before")
        ///console.log(ref.pool.current.map(x=>x.id),"current ref pool")
            ref=ref.pool.current.find(x=>x.id==tid);
            //console.log("ref,",ref);
            if(!ref){
                console.log("walking back");
                //just walk backwards once in the search
                ref=slast_ref?slast_ref:last_ref;
            }else{
                slast_ref=last_ref;
                last_ref=ref;


            }
       //     console.log(ref,"after")
        }
        return ref?.id;
    }
    find_target(id){
        return this.pool.current.find(x=>x.id==id);
    }
    score_self(){
        //actually async but whatever...
        this.score =this.pool.current.reduce(
            (acc,item)=>acc+=item.pool.current.length,0)+this.pool.current.length;

    }
    getScoreObj(){
        return {id:this.id,score:this.a.list.length+this.b.list.length}
    }
    server_dispatch(id,fid){
        //set forward if possible
       // console.log("this.a.,b",this.a.inc,this.b.inc,this.id)

        this.a.inc=Math.min(this.a.inc,this.a.list.length-1);
        this.b.inc=Math.min(this.b.inc,this.b.list.length-1);
        //console.log("this.a.,b",this.a.inc,this.b.inc,this.id)
        //primary dispatch n, z is secondary
        const [n,z] = this.a.acc>this.b.acc?[this.b,this.a]:[this.a,this.b];
        //if b is full and a is full

        if(this.b.list.length>=this.b.lim && this.a.list.length>=this.a.lim){
        //    console.log(this.b.list.length,this.a.list.length,"is list lengths of full",this.id)
            //get the next list in round robin
            //from that list, pick one in another round robin style
            n.acc++;
            
                 console.log("getting forward",z.list[Math.floor(z.inc)])
            const forward = this.getforward(z.list[Math.floor(z.inc)]);
            z.inc=((z.inc+1)%z.lim)//z.lim;
            n.inc=((n.inc+1)%n.lim)//n.lim;
            const target = n.list[Math.floor(n.inc)];
            //this function gets forwarded to next peer
            console.log("forwarding ",z,n,"z,n",target, n.list[Math.floor(n.inc)],n.list,n.inc);

            this.send_link(id,target,forward);
        }
        //if a is not full
        else if(this.a.list.length<this.a.lim){
          //  console.log("putting ",id," in a of",this.id);
            this.connect_to_peer(id,"a");
            if(fid &&this.b.list.length<this.b.lim){
             //   console.log("FID!!!!",fid);
                const test = peers.find(x=>x.id==fid);
                if((!test.b.list.includes(fid) )&& test.b.list.length<test.b.lim)
                    this.connect_to_peer(fid,"b");
            }
        }
        //if b is not full
        else if(this.b.list.length<this.b.lim){            
         //   console.log("putting ",id," in b of",this.id);
         this.connect_to_peer(id,"b");
         if(fid &&this.a.list.length<this.a.lim){
            //   console.log("FID!!!!",fid);
               const test = peers.find(x=>x.id==fid);
               if((!test.a.list.includes(fid) )&& test.a.list.length<test.a.lim)
                   this.connect_to_peer(fid,"a");
           }
        }
        //mod both incs by limit
        while(this.a.acc>0&&this.b.acc>0){
            this.a.acc--;
            this.b.acc--;
        }
        
    }
}
//sample test for debugging
const peers = [];
const boot_node = new server("boot-0");
peers.push(boot_node);
for(let i=1;i<64;i++){
    peers.push(new server(`peer-${i}`))
}
peers.forEach((p,i,arr)=>{
    if(i!==0){
        if(i<arr.length/2){

            console.log("dispatching",p.id);
            boot_node.server_dispatch(p.id);
            console.log("success:\n\n");
        }else{
            //what happens if someone connects to the network from an arbitrary node
            
            const rng_connect_test_node = arr[Math.floor(arr.length*Math.random())]
            console.log("dispatching",p.id,"to",rng_connect_test_node.id);
            rng_connect_test_node.server_dispatch(p.id);
      //      boot_node.server_dispatch(p.id);

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
const header = [{id:"source",title:"source"},{id:"target",title:"target"},{id:"label",title:"label"}];
const csvWriter = createCsvWriter({path,header});
const data=[]
peers.forEach(node=>{
    const a_out = node.a.list;
    const b_out = node.b.list;
    a_out.forEach(a=>data.push({source:node.id,target:a,label:"A"}))
    b_out.forEach(b=>data.push({source:node.id,target:b,label:"B"}))
})
csvWriter.writeRecords(data).then(()=>console.log("yay!"))
