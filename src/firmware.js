var appEUI = "70B3D57ED000F1B0";
var appKey = "5AD84A000CB760B7DD52CC1A7D3300E3";


var RN2483 = require("RN2483");

var lora = null;

var msgRX = "";



function UARTprocess(data) {
   msgRX += data;
   if (msgRX.indexOf("\r\n") != -1) {
      console.log(msgRX);
      if (msgRX.indexOf("accepted") != -1) {
        setInterval(function(){loraSendMsg("Hello", 1, "uncnf");}, 5000);
      }
      msgRX = ""; 
   }
}

function loraSendMsg(message, port, ackType) {
    
  
  console.log("mac tx " + ackType + " " + port + " " + message);
  Serial2.print("mac tx " + ackType + " " + port + " " + message + "\r\n");
  /*if (lora !== null) {
      lora.setMAC(true, function() {
      });
    }*/
}

function UARTInit() {
  Serial2.setup(57600, { tx:A2, rx:A3});
  Serial2.on('data', function(data){UARTprocess(data);});
}

function loraInit() {
  lora = new RN2483(Serial2, {reset:B0});
  // Setup the LoRa module
  setTimeout(function() {Serial2.println("mac set appeui " + appEUI);} , 1000);
  setTimeout(function() {Serial2.println("mac set appkey " + appKey);}, 2000);
  setTimeout(function() {Serial2.println("mac join otaa");}, 3000);
  
  //lora.getStatus(function(x){console.log(x);});
}

function onInit() {
  // Reset
  digitalWrite(B0, true);
  digitalPulse(B0, false, 500);
  digitalWrite(B0, true);
  
  UARTInit();
  loraInit();
}






/*
RN2483.prototype.loraTX = function(msg, callback) {
  var at = this.at;
  this.setMAC(true, function() {
    // convert to hex
    at.cmd("mac tx uncnf 1 "+toHex(msg)+"\r\n",2000,function(d) {
      callback((d=="ok")?null:((d===undefined?"Timeout":d)));
    });
  });
};
*/

save();


