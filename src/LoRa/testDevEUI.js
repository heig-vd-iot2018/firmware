var RN2483 = require("RN2483");
Serial2.setup(57600, { tx:A2, rx:A3});
Serial2.on('data', function(data){console.log(data);});
var lora = new RN2483(Serial1, {reset:B0});

// Reset LoRa module
digitalWrite(B0, true);
digitalPulse(B0, false, 500);
digitalWrite(B0, true);
console.log("LoRa restarted");

lora.getStatus(function(x){console.log("Device EUI = " + x.EUI);});

  	