class server{
    id=""
    pool={current:[]};
    a={
        list:[],
        acc:0,
        inc:0,
        lim:3,    
        type:"a"
    }
    b={
        list:[],
        acc:0,
        inc:0,
        lim:3, 
        type:"b"
    }
    forward=null;
    score={a:0,b:0};
    flip=false;
    constructor(id){
        this.id=id;
    }
    send_link(request_id,send_id,forward_links,flip){

        console.log(this.id,"sending link,",request_id,send_id,forward_links,flip);
        flip=!flip;
        const target_conn = this.find_target(send_id);
        if(!target_conn){
            console.log("This should never happen normally",this.id,"req/send",request_id,send_id,this.a.list,this.b.list,forward_links);
        }
        target_conn.send({
            key:"server_dispatch",
            data:{
                id:request_id,
                fids:forward_links,
                flip,
            }

        });
    }
    send(obj){
        this.server_dispatch(obj.data.id,obj.data.flip,obj.data.fids);
    }
    connect_to_peer(id,type,pass){
        console.log(this.id,"connecting with",id,"type:",type,"replying_conn:",pass);
        //connect to peer by id.
        //temp test using local data
        const found = peers.find(x=>x.id==id);
        const has = this.pool.current.find(x=>x.id==id);
        if(has==undefined){

            this.pool.current.push(found);
            this[type].list.push(id);
            this[type].inc+=1//this[type].lim;
            this[type].acc++;
            this.score_self(type);
            !pass?found.connect_to_peer(this.id,type,true):null;

        }
    }
    getforwards(type,fall_through){
        const raw_nodes = this[type].list.map(x=>peers.find(y=>y.id==x))
        let forwards=raw_nodes.filter(x=>x[type].list.length<x[type].lim);
        
        console.log(this.id,"get",type,"type of forwards of are:",forwards.map(x=>x.id))
        if(forwards.length>0||fall_through){
            if(forwards.length==0){
                console.log(this.id,"returning self")
                return [this.id];
            }
            let scores = forwards.map(x=>x.getScoreObj(type));
            scores?.sort((a,b)=>a.score-b.score).filter(x=>x.score<forwards.find(y=>y.id==x.id)[type].limit);
            console.log(this.id,"getting forwards if even we continue down the line to:");
            //if they are all the same score and full
            if(scores.every(x=>x.score>=forwards.find(y=>y.id==x.id)[type].lim)&&scores[0].score==scores[scores.length-1].score &&scores.length>0){
                return [];
                let [_z,_zz] = this.a.acc>this.b.acc?["b","a"]:["a","b"];
                const target = this.pool.current.find(x=>x.id==this[_z].list[this[_z].inc])
                console.log(this.id,this[_z].list,"returning deeper,",target.id);
                
                if(target.getScoreObj(type).score<target[type].lim){
                    
                }
                return target.getforwards(type,true);

            }
            else{
                const target=[];
                let inc=0;
                for(const s of scores){
                    if(inc>=this[type].lim-1){
                        continue;
                    }else{
                        inc+=s.score;
                        target.push(s.id);
                        if(inc>this[type].lim-1){
                            inc-=s.score;
                            target.pop();
                        }
                    }
                }
                console.log(this.id,"actually we return this",target)
                 return target
            }
        }
        console.log("finally this,",forwards);
        return forwards;
        const node = this.pool.current.find(x=>x.id==id);
        let ref = node;
        let last_ref=node;
        let slast_ref=node;
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
    score_self(type){
        //actually async but whatever...
        this.score[type]= this[type].list.reduce(
            (acc,x)=>acc+=this.pool.current.find(y=>y.id==x)[type].list.length,0)
            
            console.log(this.id,"score self",this.score);
    }
    getScoreObj(type){
        return {id:this.id,score:this.score[type]}
    }
    server_dispatch(id,flip,fids){
        //set forward if possible
        console.log(this.id,"given",id,flip,fids);
        

        this.a.inc=Math.min(this.a.inc,this.a.list.length-1);
        this.b.inc=Math.min(this.b.inc,this.b.list.length-1);
        //console.log("this.a.,b",this.a.inc,this.b.inc,this.id)
        //primary dispatch n, z is secondary
        const [n,z] = !flip?[this.b,this.a]:[this.a,this.b];

        fids= fids?.length>0?fids:this.getforwards(n.type);
        console.log(this.id,"N:",n.type,"Z:",z.type,"fids",fids);
        //if b is full and a is full

        if(this.b.list.length>=this.b.lim && this.a.list.length>=this.a.lim){
            console.log(this.id,"dispatch lists full: serving",n.type,"as primary");
        //    console.log(this.b.list.length,this.a.list.length,"is list lengths of full",this.id)
            //get the next list in round robin
            //from that list, pick one in another round robin style
            n.acc++;
            
    //        console.log("getting forward",z.list[Math.floor(z.inc)])
            
            console.log("forwards finally are",fids,"from",this.id,"to:",id);
            z.inc=((z.inc+1)%z.lim)//z.lim;
            n.inc=((n.inc+1)%n.lim)//n.lim;
            const target = n.list[Math.floor(n.inc)];
            //this function gets forwarded to next peer
       //     console.log("forwarding ",z,n,"z,n",target, n.list[Math.floor(n.inc)],n.list,n.inc);

            this.send_link(id,target,fids,flip);
        }
        if(flip){
            console.log(this.id,"flip",flip)
            //if a is not full
            if(this.a.list.length<this.a.lim){
                console.log(this.id," is getting ",id," in a");
                this.connect_to_peer(id,"a");
                console.log(this.id,"fids",fids,this.b.list.length,this.b.lim)
                if(fids?.length>0 &&this.b.list.length<this.b.lim){
                    //   console.log("FID!!!!",fid);
                    for(const fid of fids){

                        const test = peers.find(x=>x.id==fid);
                        if((!test.b.list.includes(fid) )&& test.b.list.length<test.b.lim)
                        this.connect_to_peer(fid,"a");
                    }
                }   
            }
            //if b is not full
            else if(this.b.list.length<this.b.lim){            
                console.log(this.id," is getting ",id," in b");
                this.connect_to_peer(id,"b");
                if(fids?.length>0 &&this.a.list.length<this.a.lim){
                    for(const fid of fids){
                        console.log(this.id,"has fids",fids);
                        const test = peers.find(x=>x.id==fid);
                        if((!test.a.list.includes(x=>x==fid) )&& test.a.list.length<test.a.lim)
                        this.connect_to_peer(fid,"b");
                    }
                }
            }
        }else{
            console.log(this.id,"flip",flip)

            //same thing as flip block but in reverse order
            if(this.b.list.length<this.b.lim){   

                console.log(this.id," is getting ",id," in b");
                this.connect_to_peer(id,"b");
                if(fids?.length>0 &&this.a.list.length<this.a.lim){
                    console.log(this.id,"has fids",fids);
                    for(const fid of fids){

                        const test = peers.find(x=>x.id==fid);
                        if((!test.a.list.includes(x=>x==fid) )&& test.a.list.length<test.a.lim)
                        this.connect_to_peer(fid,"b");
                    }
                }
            }else if(this.a.list.length<this.a.lim){
                console.log(this.id," is getting ",id," in a");
                this.connect_to_peer(id,"a");
                if(fids?.length>0 &&this.b.list.length<this.b.lim){
                    for(const fid of fids){
                        console.log(this.id,"has fids",fid);
                        const test = peers.find(x=>x.id==fid);
                        if((!test.b.list.includes(fid) )&& test.b.list.length<test.b.lim)
                        this.connect_to_peer(fid,"a");
                    }
                }  
        }
        //mod both incs by limit
        while(this.a.acc>0&&this.b.acc>0){
            this.a.acc--;
            this.b.acc--;
        }
    }
    }
}
//sample test for debugging
const peers = [];
const boot_node = new server("boot-0");
peers.push(boot_node);
for(let i=1;i<1028;i++){
    peers.push(new server(`peer-${i}`))
}
console.log("\n\n~~~~~~~~~STARTING~~~~~~~~~\n\n")
peers.forEach((p,i,arr)=>{
    if(i!==0){
        if(i<arr.length/2){

            console.log("dispatching",p.id);
            boot_node.server_dispatch(p.id);
            console.log("success:\n\n\n");
        }else{
            //what happens if someone connects to the network from an arbitrary node
            
            const rng_connect_test_node = arr[Math.floor(i*Math.random())]
            console.log("dispatching",p.id);
      //      rng_connect_test_node.server_dispatch(p.id);
            boot_node.server_dispatch(p.id);
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
