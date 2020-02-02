const express = require('express')
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mcpadc = require('mcp-spi-adc');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
    socket.emit('gpio', 'data');
});

const SWITCH_CHANEL = 0;
const X_CHANEL = 1;
const Y_CHANEL = 2;
const SPEED_HZ = 20000;

const switchButton = mcpadc.open(SWITCH_CHANEL, {speedHz: SPEED_HZ}, err => {
  if (err) throw err;

  setInterval(_ => {
    tempSensor.read((err, { rawValue }) => {
      if (err) throw err;

      console.log(`SWITCH_CHANEL: ${rawValue}`)
    });
  }, 100);
});
const xButton = mcpadc.open(X_CHANEL, {speedHz: SPEED_HZ}, err => {
  if (err) throw err;

  setInterval(_ => {
    tempSensor.read((err, { rawValue }) => {
      if (err) throw err;

      console.log(`X_CHANEL: ${rawValue}`)
    });
  }, 100);
});
const yButton = mcpadc.open(Y_CHANEL, {speedHz: SPEED_HZ}, err => {
  if (err) throw err;

  setInterval(_ => {
    tempSensor.read((err, { rawValue }) => {
      if (err) throw err;

      console.log(`Y_CHANEL: ${rawValue}`)
    });
  }, 100);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
