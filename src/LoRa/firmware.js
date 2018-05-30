var RN2483 = require("RN2483");
var bme;

var appEUI = "70B3D57ED000F1B0";
var appKey = "5AD84A000CB760B7DD52CC1A7D3300E3";

var lora = null;
var i2c = null;

var msgRX = "";



function UARTprocess(data) {
   msgRX += data;
   // Once the message contains the \r\n chars it means the response is done.
   // We can now compare the response to handle it correctly.
   if (msgRX.indexOf("\r\n") != -1) {
      console.log(msgRX);
      // If we get the response "accepted" after a join, we can set the 
      // interval to send the datas periodically.
      if (msgRX.indexOf("accepted") != -1) {
        setInterval(function(){loraSendMsg("68656c6c6f", 1, "cnf");}, 5000);
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
  
  initI2C();
  
   setInterval(printBME, 5000);
}

function createPayload() {
    var datas =
}


save();


