const express = require('express')
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mcpadc = require('mcp-spi-adc');
const PubSub = require('pubsub-js');
const { Observable } = require('rxjs')
const { throttleTime } = require('rxjs/operators')

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

const observableFromChannel = ({ channel, options = { speedHz: SPEED_HZ } }) => {
  return new Observable(subscriber => {
    const connection = mcpadc.open(channel, options, err => {
      if (err) throw err;

      setInterval(() => {
          connection.read((err, { rawValue }) => {
            if (err) throw err;

            subscriber.next(rawValue)
          });
      }, 15);
    });
  })
}

// left  > 800
// right < 200
// 1023 516 2

const switchBtn$ = observableFromChannel({ channel: SWITCH_CHANEL })
const xBtn$ = observableFromChannel({ channel: X_CHANEL })

switchBtn$.pipe(throttleTime(150)).subscribe({
  next: value => {
    if(value < 200) {
      console.log('Select')
      PubSub.publish(SPI_EVENTS.ENTER)
    }
  }
})

xBtn$.pipe(throttleTime(150)).subscribe({
  next: value => {
    if(value > 850) {
      console.log('Move left')
      PubSub.publish(SPI_EVENTS.MOVE_LEFT)
    }
    if(value < 150) {
      console.log('Move right')
      PubSub.publish(SPI_EVENTS.MOVE_RIGHT)
    }
  }
})

io.on('connection', function(socket){
  console.log('a user connected');

  PubSub.subscribe(SPI_EVENTS.MOVE_RIGHT, () => {
    socket.emit(SPI_EVENTS.MOVE_RIGHT);
  })

  PubSub.subscribe(SPI_EVENTS.MOVE_LEFT, () => {
    socket.emit(SPI_EVENTS.MOVE_LEFT);
  })

  PubSub.subscribe(SPI_EVENTS.ENTER, () => {
    socket.emit(SPI_EVENTS.ENTER);
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
