if(typeof module !== 'undefined' && typeof process !== 'undefined')
{
  module.exports = require('./solone-server.js');
}
else
{
  window.solone = function(){};
  window.solone.init = function(callback) {
    
    if(typeof window.__KaleoiExtensions__ === 'undefined') window.__KaleoiExtensions__ = { components: { } };
    
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
    
    /* Attach script to head */
    s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = (localurl ? localurl + '/solone' : '') + '/solone-client.js';
    s.onload = callback;
    /* The IE madness is real */
    s.onreadystatechange = function() { if (this.readyState == 'complete') callback(); }
    document.head.appendChild(s);
  }
}