var RN2483 = require("RN2483");
var bme;

var appEUI = "70B3D57ED000F1B0";
var appKey = "F45661A2F761B1473AC492F1FB31F947";

var lora = null;
var i2c = null;

var msgRX = "";


function hexToString (hex) {
    var string = '';
    for (var i = 0; i < hex.length; i += 2) {
      string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return string;
}


function UARTprocess(data) {
   msgRX += data;
   var intervalID;
   // Once the message contains the \r\n chars it means the response is done.
   // We can now compare the response to handle it correctly.
   if (msgRX.indexOf("\r\n") != -1) {
      console.log(msgRX);
      // If we get the response "accepted" after a join, we can set the 
      // interval to send the datas periodically.
      if (msgRX.indexOf("accepted") != -1) {
        intervalID = setInterval(function(){loraSendMsg("68656c6c6f", 1, "cnf");}, 5000);
      }
     else if(msgRX.indexOf("mac_rx") != -1){
       console.log("message recived");
       var hexMsg = msgRX.substring(msgRX.lastIndexOf(" ")+1,msgRX.length);
       console.log(hexMsg);
       var msg = hexToString(hexMsg);
       console.log(msg);
       var jsonParsed = JSON.parse(msg);
       var intervalTime = jsonParsed.newInterval;
       console.log(time);
       
       //{ "newInterval" : 5 }
       
       clearInterval(intervalID);
       intervalID = setInterval(function(){loraSendMsg("68656c6c6f", 1, "cnf");}, intervalTime);
     }

     // Reset the reception buffer
      msgRX = ""; 
   }
}

/*
 * Send a message to the LoRa
 */
function loraSendMsg(message, port, ackType) {
  console.log("mac tx " + ackType + " " + port + " " + message);
  Serial2.print("mac tx " + ackType + " " + port + " " + message + "\r\n");
}

/*
 * Initialization of the UART
 */
function UARTInit() {
  Serial2.setup(57600, { tx:A2, rx:A3});
  Serial2.on('data', function(data){UARTprocess(data);});
}

function initI2C() {
  i2c = new I2C();
  i2c.setup({sda:B9,scl:B8});  // Pin changé par rapport au schémas
  bme = require("BME680").connectI2C(i2c, {addr:0x77});

}

function printBME() {
  var data = bme.get_sensor_data();
  console.log(JSON.stringify(data,null,2));
  bme.perform_measurement();
}

/*
 * Initialization of the LoRa module
 */
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

save();

Serial2.println("mac get retx");
