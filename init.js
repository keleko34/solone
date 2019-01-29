if(module && require && process)
{
  module.exports = require('./init-server.js');
}
else
{
  /* Attach script to head */
  var s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = '/node_modules/solone/init-client.js';
  document.head.appendChild(s);
}