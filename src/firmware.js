var appEUI = "70B3D57ED000F1B0";
var appKey = "5AD84A000CB760B7DD52CC1A7D3300E3";


var RN2483 = require("RN2483");

var lora;


function loraSendMsg(message, port, ackType) {
    lora.setMAC(true, function() {
      console.log("mac tx " + ackType + " " + port + " " + message);
      Serial2.println("mac tx " + ackType + " " + port + " " + message);
  });
}

function UARTInit() {
  Serial2.setup(57600, { tx:A2, rx:A3});
  //Serial2.on('data', function(data){console.log(data);});
}

function loraInit() {
  lora = new RN2483(Serial2, {reset:B0});
  // Setup the LoRa module
  Serial2.println("mac set appeui " + appEUI); 
  Serial2.println("mac set appkey " + appKey);
  Serial2.println("mac join otaa");
  
  //lora.getStatus(function(x){console.log(x);});
}

function onInit() {
  // Reset
  digitalWrite(B0, true);
  digitalPulse(B0, false, 500);
  digitalWrite(B0, true);
  
  UARTInit();
  loraInit();
  
  setInterval(loraSendMsg("Hello", 1, "uncnf"), 5000);
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


