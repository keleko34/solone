if(typeof module !== 'undefined' && typeof process !== 'undefined')
{
  module.exports = require('./init-server.js');
}
else
{
  var localurl = (function(){
    document.querySelectorAll('script')
    .forEach(function(v){
      if(v.src.indexOf('solone') != -1) return v.src.replace('/solone/init.js');
    })
  }())
  
  if(typeof __KaleoExtensions__ === 'undefined') window.__KaleoExtensions__ = {config:{}};
  
  /* attach peprze if not already */
  if(!document.querySelector('script[src="' + localurl + '/peprze/init.js"]'))
  {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = '' + localurl + '/peprze/init.js';
    document.head.appendChild(s);
  }
  
  /* Attach script to head */
  s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = localurl + '/solone/init-client.js';
  document.head.appendChild(s);
}