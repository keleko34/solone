if(typeof module !== 'undefined' && typeof process !== 'undefined')
{
  module.exports = require('./init-server.js');
}
else
{
  /* attach peprze if not already */
  if(!document.querySelector('script[src="/node_modules/peprze/init.js"]'))
  {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = '/node_modules/peprze/init.js';
    document.head.appendChild(s);
  }
  
  if(!__KaleoExtensions__) window.__KaleoExtensions__ = {config:{}};
  
  /* Attach script to head */
  s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = '/node_modules/solone/init-client.js';
  document.head.appendChild(s);
}