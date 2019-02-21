if(typeof module !== 'undefined' && typeof process !== 'undefined')
{
  module.exports = require('./init-server.js');
}
else
{
  var localurl = (function(){
    var scripts = document.querySelectorAll('script'),
        src,
        len = scripts.length,
        x = 0;
      
    for(x;x<len;x++)
    {
      src = scripts[x].getAttribute('src');
      if(src && src.indexOf('solone') !== -1) return src.replace('/solone/init.js');
    }
  }());
  
  if(typeof __KaleoExtensions__ === 'undefined') window.__KaleoExtensions__ = {config:{}};
  
  /* attach peprze if not already */
  if(!document.querySelector('script[src="' + (localurl || '/node_modules') + '/peprze/init.js"]'))
  {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = '' + (localurl || '/node_modules') + '/peprze/init.js';
    document.head.appendChild(s);
  }
  
  /* Attach script to head */
  s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = (localurl ? localurl + '/solone' : '') + '/init-client.js';
  document.head.appendChild(s);
}