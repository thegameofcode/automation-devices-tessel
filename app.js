var router = require('tiny-router');
var servo = require('./servo');

var wifi = require('wifi-cc3000');
var network = 'HOME-CF32'; // put in your network name here
var pass = 'CAB83A997CE7AF6E'; // put in your password here, or leave blank for unsecured
var security = 'wpa2'; // other options are 'wep', 'wpa', or 'unsecured'
var timeouts = 0;

function connect(){
  wifi.connect({
    security: security
    , ssid: network
    , password: pass
    , timeout: 30 // in seconds
  });
}

wifi.on('connect', function(data){
  // you're connected
  console.log("connect emitted", data);


  router
    .get('/rotate/{pos}', function(req, res){
        var pos = req.body.pos;
        console.log('Received pos=', pos);

        if ( /^(left|top|right)$/.test(pos) ) {

          switch (pos) {
            case 'left':
              pos = 0.8;
              break;
            case 'top':
              pos = 0.4;
              break;
            case 'right':
              pos = 0;
              break;
          }

        } else {
          pos = parseFloat(req.body.pos);
        }

        if ( isNaN(pos) ) {
          return res.send({err: 'invalid pos'});
        }

        console.log('Rotating servo to ' + pos + '...');
        servo.rotate(pos, function (err, pos) {
          if (err) {
            res.send(err);
          } else {
            console.log('Servo rotated :)');
            res.send({err: err, pos: pos});
          }
        });

    }).get('/pwm/min/{val}', function(req, res){
        var val = parseFloat(req.body.val);
        console.log('Received val=', val);

        if ( isNaN(val) ) {
          res.send({err: 'invalid val'});
        } else {
          servo.setMinPWM(val);
          res.send({err: err, minpwm: val});
        }

    }).get('/pwm/max/{val}', function(req, res){
        var val = parseFloat(req.body.val);
        console.log('Received val=', val);

        if ( isNaN(val) ) {
          res.send({err: 'invalid val'});
        } else {
          servo.setMaxPWM(val);
          res.send({err: err, maxpwm: val});
        }

    });

  router.listen(8080);

});

wifi.on('disconnect', function(data){
  // wifi dropped, probably want to call connect() again
  console.log("disconnect emitted", data);
})

wifi.on('timeout', function(err){
  // tried to connect but couldn't, retry
  console.log("timeout emitted");
  timeouts++;
  if (timeouts > 2) {
    // reset the wifi chip if we've timed out too many times
    powerCycle();
  } else {
    // try to reconnect
    connect();
  }
});

wifi.on('error', function(err){
  // one of the following happened
  // 1. tried to disconnect while not connected
  // 2. tried to disconnect while in the middle of trying to connect
  // 3. tried to initialize a connection without first waiting for a timeout or a disconnect
  console.log("error emitted", err);
});

// reset the wifi chip progammatically
function powerCycle(){
  // when the wifi chip resets, it will automatically try to reconnect
  // to the last saved network
  wifi.reset(function(){
    timeouts = 0; // reset timeouts
    console.log("done power cycling");
    // give it some time to auto reconnect
    setTimeout(function(){
      if (!wifi.isConnected()) {
        // try to reconnect
        connect();
      }
      }, 20 *1000); // 20 second wait
  })
}
