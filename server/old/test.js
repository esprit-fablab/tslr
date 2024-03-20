var Button = require('gpio-button'),
  button4 = new Button('button17');

var i = 0;

button4.on('press', function () {
  console.log(++i);
});
