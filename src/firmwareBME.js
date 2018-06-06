var RN2483 = require("RN2483");
var bme;

//AppEUI and Appkey to set manually
var appEUI = "70B3D57ED000F1B0";
var appKey = "5AD84A000CB760B7DD52CC1A7D3300E3";

var lora = null;
var i2c = null;

var msgRX = "";
var batteryLevel = 3.3;

var defaultInterval = 10000; //to set new interval send : {"newInterval":5000}
//7B 22 6E 65 77 49 6E 74 65 72 76 61 6C 22 3A 35 30 30 30 7D in hexa

// Bitfield to know which datas will be contained in the payload.
// For now it is hardcoded but it should be modular.
var header = "F003";


/*
 * Fonction to convert hex message to string
 */
function hexToString (hex) {
	var string = '';
	for (var i = 0; i < hex.length; i += 2) {
		string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	}
	return string;
}

/*
 * Proccessing message recived by UART
 */
function UARTprocess(data) {
	msgRX += data;
	// Once the message contains the \r\n chars it means the response is done.
	// We can now compare the response to handle it correctly.
	if (msgRX.indexOf("\r\n") != -1) {
		console.log(msgRX);
		// If we get the response "accepted" after a join, we can set the
		// interval to send the datas periodically.
		if (msgRX.indexOf("accepted") != -1) {
			setInterval(sendDatas, defaultInterval);
		}
		else if(msgRX.indexOf("mac_rx") != -1){
			console.log("New interval asked !");
			var hexMsg = msgRX.substring(msgRX.lastIndexOf(" ")+1,msgRX.length);
			var msg = hexToString(hexMsg);
			var jsonParsed = JSON.parse(msg);
			var newIntervalTime = jsonParsed.newInterval;
			console.log("New interval" + newIntervalTime + " ms");

       		//{ "newInterval" : 5 }
       		clearInterval();
       		console.log("Old interval cleared");
       		setInterval(sendDatas, newIntervalTime);
       		console.log("Interval changed successfully");
       	}
       	// Reset the reception buffer
     	msgRX = "";
    }
}

function perform_measurement(callback) {
	bme.perform_measurement();
	callback();
}

/*
 * Send datas
 */
function sendDatas() {

	perform_measurement(function() {var data = bme.get_sensor_data();
	console.log(JSON.stringify(data,null,2));

	var payload = createPayload(data);

	var msg = header;
	msg += convertPayloadToHexString(payload);

	loraSendMsg(msg, 1, "uncnf");})
}

/*
 * Payload conversion for sending
 */
function convertPayloadToHexString(payload) {
	var msg = "";
	var tmp = "";

	var i;
    for (i = 0; i < payload.length; i++) {
	    msg += ('0000' + payload[i].toString(16).toUpperCase()).slice(-4);
    }

	return msg;
}

/*
 * Send a message to the LoRa
 */
function loraSendMsg(message, port, ackType) {
	digitalWrite(LED1,1);
 	console.log("mac tx " + ackType + " " + port + " " + message);
 	Serial2.print("mac tx " + ackType + " " + port + " " + message + "\r\n");
 	digitalWrite(LED1,0);
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


/*
 *	BME Initialization
 */
function initBME() {
	bme = require("BME680").connectI2C(i2c, {addr:0x77});
}

/*
 *	Print sensro values in console and call payload creation
 */
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
 	setTimeout('Serial2.println("mac set appeui " + appEUI);', 1000);
 	setTimeout('Serial2.println("mac set appkey " + appKey);', 2000);
	setTimeout('Serial2.println("mac join otaa");', 3000);
}

/*
 *	Payload creation from sensor data
 */
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


function onInit() {

	console.log("Node Starting...");


  	initI2C();
  	initBME();

	// Reset LoRa module
  	digitalWrite(B0, true);
  	digitalPulse(B0, false, 500);
  	digitalWrite(B0, true);
  	console.log("LoRa restarted");

  	console.log("Starting UART init...");
  	initUART();
  	console.log("UART initialized");

  	console.log("Starting LoRa init...");
  	loraInit();
}

save();
