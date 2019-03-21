if(typeof module !== 'undefined' && typeof process !== 'undefined')
{
  module.exports = require('./solone-server.js');
}
else
{
  window.solone = function(){};
  window.solone.init = function(cb){
    
    if(typeof __KaleoiExtensions__ === 'undefined') window.__KaleoiExtensions__ = {config:{}};
    
    var localurl = (function(){
      var scripts = document.querySelectorAll('script'),
          src,
          len = scripts.length,
          x = 0;

      for(x;x<len;x++)
      {
        src = scripts[x].getAttribute('src');
        if(src && src.indexOf('solone') !== -1) return src.replace('/solone.js', '').replace('/solone','');
      }
    }());
    
    function getLocalScript(callback)
    {
      /* Attach script to head */
      s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = (localurl ? localurl + '/solone' : '') + '/solone-client.js';
      s.onload = callback;
      /* The IE madness is real */
      s.onreadystatechange = function()
      {
          if (this.readyState == 'complete') callback();
      }
      document.head.appendChild(s);
    }
    
    /* attach peprze if not already */
    if(!document.querySelector('script[src="' + (localurl || '/node_modules') + '/peprze/peprze.js"]'))
    {
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = '' + (localurl || '/node_modules') + '/peprze/peprze.js';
      s.onload = function() { getLocalScript(cb); }
      /* The IE madness is real */
      s.onreadystatechange = function()
      {
          if (this.readyState == 'complete') getLocalScript(cb);
      }
      document.head.appendChild(s);
    }
    else
    {
      getLocalScript(cb);
    }
  }
}