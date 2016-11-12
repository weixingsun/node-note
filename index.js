//var onesignal = require('node-opensignal-api');
var bpush = require('bpush-nodejs');
var os = require("os");
var ps = require('ps-node');
var async = require('async');
//var sleep = require('sleep');
//var deasync = require('deasync');
//var cp = require('child_process');
//var onesignal_client = onesignal.createClient();
var aki = 'WAqWASmCo1GO6uA2AWkjs868PVDRaQOO'
var ski = 'X4WIxOH4ybCzNZ6xdSG69kQ5eGzkDs2S'
var aka = '6MbvSM9MLCPIOYK4I05Ox0FGoggM5d9L'
var ska = '2GvcaUXXlWvMIOSWSSbaEnGo8lxg49Vy'
var live = true
let uuid = process.argv[2]  //channel_id
let name = process.argv[3]  //node,mysql,rstudio,
let cond = process.argv[4]  //#<1,cpu>50,mem>50
//var exec = deasync(cp.exec);
Date.prototype.yyyymmddhhmmss = function() {
   var yyyy = this.getFullYear();
   var mm = this.getMonth() < 9 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
   var dd  = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
   var hh = this.getHours() < 10 ? "0" + this.getHours() : this.getHours();
   var min = this.getMinutes() < 10 ? "0" + this.getMinutes() : this.getMinutes();
   var ss = this.getSeconds() < 10 ? "0" + this.getSeconds() : this.getSeconds();
   return "".concat(yyyy).concat('-').concat(mm).concat('-').concat(dd)
            .concat(' ').concat(hh).concat(':').concat(min).concat(':').concat(ss);
};
var msg_ios = {
  channel_id: uuid,
  msg:JSON.stringify({
    aps:{
      alert: 'Event:'+ cond +' proc:'+name+' host:'+os.hostname() +' time:'+(new Date()).yyyymmddhhmmss(),
      sound:'default',
    }
  }),
  msg_type: bpush.constant.MSG_TYPE.NOTIFICATION,
  deploy_status: bpush.constant.DEPLOY_STATUS.DEVELOPMENT,
  device_type: bpush.constant.DEVICE_TYPE.IOS 
}
var msg_and = {
  channel_id: uuid,
  msg:JSON.stringify({
    title:'Event '+ cond +' proc:'+name,
    description: "host:"+os.hostname()+" time:"+(new Date()).yyyymmddhhmmss(),
    custom_content:{
      'monitor': '1',
      'time': (new Date()).yyyymmddhhmmss(),
      'host': os.hostname(),
      'condition': cond,
    }
  }),
  msg_type: bpush.constant.MSG_TYPE.NOTIFICATION,
}

function note(channel_id,msg){
  bpush.sendRequest(bpush.apis.pushMsgToSingleDevice,msg).then( function (resp) {
        //data=JSON.parse(data)
        console.log(resp)
    }).catch( function(e) {
        console.log(e);
    });
}
function PS(list){
    console.log('['+list.length+'] running at : '+(new Date()).yyyymmddhhmmss()+' list='+JSON.stringify(list))
}
//compare['<'](1,2)
var compare = {
    '<': function (x, y) { return x < y },
    '>': function (x, y) { return x > y }
};

//cond = ['cpu<1','#<1']
function triggerByCondition(cond_str,list){
  let arr = cond_str.split(/<|>/)
  let con = arr[0]
  let op = cond_str.substring(con.length,con.length+1)
  let num = parseInt(arr[1])
  //console.log('con='+con+' op='+op+' num='+num)
  if(con==='#'){
    return compare[op](list.length,num)
  }else{
    let match_list = []
    list.map((item)=>{ 
      let res = parseFloat(item[con])
      if(compare[op]( res,num )) match_list.push(item)
    })
    return match_list.length>0
  }
}
function findProc(uuid,name,cond,found,not_found){
  return ps.lookup(
    { name:name, except:uuid, },
    function(err, resultList ) {
      if(resultList==null || resultList.length===0){
        throw new Error( 'No process '+name+' found.' );
      }else{ //if (err) throw new Error( err );
        let trigger=triggerByCondition(cond,resultList);
        if(trigger){
          not_found();
          live = false;
        }else{ 
          found(resultList);
        }
      }
    }
  );
}

async.whilst(
    ()=>{return live},
    (next)=>{
      findProc(uuid,name, cond, PS, ()=>note(uuid,msg_and)),
      //child_process.execSync("sleep 5"); 
      //sleep(2000)
      setTimeout(next,5000);
    },
    (err)=>{  console.log('all done')}
)
