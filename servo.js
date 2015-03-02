// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

/*********************************************
This servo module demo turns the servo around
1/10 of its full rotation  every 500ms, then
resets it after 10 turns, reading out position
to the console at each movement.
*********************************************/

var tessel = require('tessel');
var servolib = require('servo-pca9685');

var servo = servolib.use(tessel.port['A']);

var servo1 = 1; // We have a servo plugged in at position 1

servo.on('ready', function () {

  //  Set the minimum and maximum duty cycle for servo 1.
  //  If the servo doesn't move to its full extent or stalls out
  //  and gets hot, try tuning these values (0.05 and 0.12).
  //  Moving them towards each other = less movement range
  //  Moving them apart = more range, more likely to stall and burn out
  console.log('Servo is ready!');
});

var minPWM = 0.02, maxPWM = 0.14;

module.exports = {
  rotate : function (pos, done) {

    servo.configure(servo1, minPWM, maxPWM, function () {
      
      servo.move(servo1, pos, function (err) {
        if (err) {
          console.error('Servo ERROR: ', err);
          done(err, -1);
        } else {
          done(null, pos);
        }
      });

    });

  },setMinPWM : function (val) {
    minPWM = val;

  },setMaxPWM : function (val) {
    maxPWM = val;
  }
};
