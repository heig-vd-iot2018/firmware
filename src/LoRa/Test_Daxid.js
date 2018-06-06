var RN2483 = require("RN2483");
var bme;

var appEUI = "70B3D57ED000F1B0";
var appKey = "5AD84A000CB760B7DD52CC1A7D3300E3";

var lora = null;
var i2c = null;

var msgRX = "";

var batteryLevel = 3.3;

// Bitfield to know which datas will be contained in the payload.
// For now it is hardcoded but it should be modular.
var header = "F003";


function UARTprocess(data) {
   msgRX += data;
   // Once the message contains the \r\n chars it means the response is done.
   // We can now compare the response to handle it correctly.
   if (msgRX.indexOf("\r\n") != -1) {
      console.log(msgRX);
      // If we get the response "accepted" after a join, we can set the 
      // interval to send the datas periodically.
      if (msgRX.indexOf("accepted") != -1) {
        setInterval(sendDatas, 5000);
      }
     // Reset the reception buffer
      msgRX = ""; 
   }
}

function sendDatas() {
  var data = bme.get_sensor_data();
  console.log(JSON.stringify(data,null,2));
  
  var payload = createPayload(data);
  
  var msg = header;
  msg += convertPayloadToHexString(payload);
  
  loraSendMsg(msg, 1, "uncnf");

  bme.perform_measurement();
}

function convertPayloadToHexString(payload) {
  var msg = "";
  var tmp = "";
  
  tmp = ('0000' + payload[0].toString(16).toUpperCase()).slice(-4);
  msg += tmp;
  tmp = ('0000' + payload[1].toString(16).toUpperCase()).slice(-4);
  msg += tmp;
  tmp = ('0000' + payload[2].toString(16).toUpperCase()).slice(-4);
  msg += tmp;
  tmp = ('0000' + payload[3].toString(16).toUpperCase()).slice(-4);
  msg += tmp;
  tmp = ('0000' + payload[4].toString(16).toUpperCase()).slice(-4);
  msg += tmp;
  tmp = ('0000' + payload[5].toString(16).toUpperCase()).slice(-4);
  msg += tmp;
  
  return msg;
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
function initUART() {
  Serial2.setup(57600, { tx:A2, rx:A3});
  Serial2.on('data', function(data){UARTprocess(data);});
}

/*
 * Initialization of the I2C and the BME
 */
function initI2C() {
  i2c = new I2C();
  i2c.setup({sda:B9,scl:B8});  // Pin changé par rapport au schémas
}

function initBME() {
  bme = require("BME680").connectI2C(i2c, {addr:0x77});
}

function printBME() {
  var data = bme.get_sensor_data();
  console.log(JSON.stringify(data,null,2));
  
  createPayload(data);
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
}

function onInit() {
  // Reset LoRa module
  digitalWrite(B0, true);
  digitalPulse(B0, false, 500);
  digitalWrite(B0, true);
  
  initUART();
  loraInit();
  
  initI2C();
  initBME();
}

function createPayload(datas) {
  var payload = new Int16Array(6);
  
  payload[0] = datas.temperature * 10;
  payload[1] = datas.pressure * 10;
  payload[2] = datas.humidity * 100;
  payload[3] = datas.gas_resistance / 10;
  payload[4] = E.getTemperature() * 10;
  payload[5] = batteryLevel * 10;
  
  return payload;
}


save();


