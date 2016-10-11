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
  title: 'Event from '+os.hostname() +' at '+ (new Date()).yyyymmddhhmmss(),
  value: 'R test finished, and report is sent to your email'
}

function note(app,me,email){
  var params = {
    app_id: app,
    contents: {
        'en': email.title,
    },
    data: {
        'value': email.value,
        //'pics': ['1.jpg','2.jpg'],
    },
    //tags: [{ "key": "custom_tag", "relation": "=", "value": "custom_value"}],
    include_player_ids: [me],
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
    //console.log( 'proc list='+ JSON.stringify(list));
    console.log('['+list.length+']proc:'+list[0].pid+' alive at : '+(new Date()).yyyymmddhhmmss())
}

function findProc(cmd,name,found,not_found){
  return ps.lookup(
    { command:cmd, psargs:' aux |head -1; ps aux|grep '+name, }, 
    function(err, resultList ) {
      if (err) throw new Error( err );
      if(resultList.length===0){
        not_found();
        live = false;
      }else{ 
        found(resultList);
      }
    }
  );
}

let uuid = process.argv[2]
async.whilst(
    ()=>{return live},
    (next)=>{
      findProc('node','start', PS, ()=>note(ID,uuid,email)),
      //child_process.execSync("sleep 5"); 
      //sleep(2000)
      setTimeout(next,5000);
    },
    (err)=>{  console.log('all done')}
)
