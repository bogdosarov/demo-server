const express = require('express')
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mcpadc = require('mcp-spi-adc');
const PubSub = require('pubsub-js');
const { Observable } = require('rxjs')

const SWITCH_CHANEL = 0;
const Y_CHANEL = 1;
const X_CHANEL = 2;
const SPEED_HZ = 20000;

const SPI_EVENTS = {
  MOVE_LEFT: 'MOVE_LEFT',
  MOVE_RIGHT: 'MOVE_RIGHT',
  ENTER: 'ENTER',
  BACK: 'BACK',
}

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');

  // PubSub.subscribe()
    socket.emit('gpio', 'data');
});

const switchBtn = mcpadc.open(SWITCH_CHANEL, {speedHz: SPEED_HZ}, err => {
  if (err) throw err;
});

const switchBtn$ = new Observable(subscriber => {
  setInterval(_ => {
    switchBtn.read((err, { rawValue }) => {
      if (err) throw err;

      subscriber.next(rawValue)
    });
  }, 10);
})

switchBtn$.subscribe({
  next: value => {
    console.log(`SWITCH_CHANEL: ${value}`)
  }
})

http.listen(3000, function(){
  console.log('listening on *:3000');
});
