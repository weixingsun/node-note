var onesignal = require('node-opensignal-api');
var os = require("os");
var ps = require('ps-node');
var async = require('async');
//var sleep = require('sleep');
//var deasync = require('deasync');
//var cp = require('child_process');
var onesignal_client = onesignal.createClient();
var ID = 'beed51f1-1763-4ab3-bcd2-da4364786ceb';
var live = true
let uuid = process.argv[2]  //111-222-333,aaa-bbb-ccc
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
var email = {
  title: 'Event '+ cond +' from '+os.hostname(),
  value: 'Report/Email will be in next release'
}

function note(app,me,email){
  var params = {
    app_id: app,
    device_type: 9, //0:ios,1:android,2:amazon,3:win_phone_mpns,4:chrome_app,5:chrome_web_push,6:win_phone_wns,7:safari,8:firefox,9:macos
    language: 'en',
    contents: {
        'en': email.title,
    },
    data: {
        'custom': '1',
        'title': email.title,
        'value': email.value,
        'time': (new Date()).yyyymmddhhmmss(),
        'host': os.hostname(),
        'condition': cond,
        //'pics': ['1.jpg','2.jpg'],
    },
    //tags: [{ "key": "custom_tag", "relation": "=", "value": "custom_value"}],
    include_player_ids: me.split(','),
  };
  onesignal_client.notifications.create('', params, function (err, response) {
    if (err) {
        console.log('Encountered error', err);
    } else {
        console.log(response);
    }
  });
}
function PS(list){
    console.log('['+list.length+'] alive at : '+(new Date()).yyyymmddhhmmss()+' list='+JSON.stringify(list))
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
      findProc(uuid,name, cond, PS, ()=>note(ID,uuid,email)),
      //child_process.execSync("sleep 5"); 
      //sleep(2000)
      setTimeout(next,5000);
    },
    (err)=>{  console.log('all done')}
)
