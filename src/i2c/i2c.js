var i2c = new I2C();
i2c.setup({sda:B9,scl:B8});  // Pin changé par rapport au schémas
//var bme = require("BME680").connectI2C(i2c, {addr:0x77});
//var opt = require("OPT3001").connectI2C(i2c, {addr:0x77});
var data = 0;

function printBME() {
  var data = bme.get_sensor_data();
  console.log(JSON.stringify(data,null,2));
  bme.perform_measurement();
}

function storeData(x) {
  data = x;
}

function printOPT() {
  data = opt.read(storeData(callBackValue));
}

var i = setInterval(printOPT, 1000);

save(); // Pour mettre ça dans la flash et qu'il charge le programme lors d'un load(). Un load est automatiquement fait au boot

// Mikroe Environment click -> BME680
// Mikroe Ambient 2 click -> OPT3001