const express = require('express')
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mcpadc = require('mcp-spi-adc');
const { bindNodeCallback } = require('rxjs');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
    socket.emit('gpio', 'data');
});

const SWITCH_CHANEL = 0;
const X_CHANEL = 2;
const Y_CHANEL = 1;
const SPEED_HZ = 20000;

const switchBtnObservable = bindNodeCallback(mcpadc.open)
const switchBtn = switchBtnObservable(SWITCH_CHANEL, { speedHz: SPEED_HZ })

switchBtn.subscribe(value => console.log(value), e => console.error(e))

http.listen(3000, function(){
  console.log('listening on *:3000');
});
