window.solone = (function(){
  
  var __config = __KaleoiExtensions__.config,
      __environments = ['dev', 'prod'],
      __headers = {};
  
  if(!__KaleoiExtensions__.authentication) __KaleoiExtensions__.authentication = function(info, resolve){ return resolve(); }
  
  /* HELPER METHODS */
  /* REGION */
  
  function createScript(title, script)
  {
    var sc = document.createElement('script');
    sc.title = title;
    sc.type = 'text/javascript';
    sc.textContent = script;
    document.head.appendChild(sc);
    return sc;
  }
  
  function fetchFile(url, headers)
  {
    return new Promise(function(resolve, reject){
      
      headers = (headers || __headers);
    
      var __xhr = new XMLHttpRequest()

      __xhr.open('GET', url, true);

      if(headers)
      {
        Object.keys(headers)
        .forEach(function(v){
          __xhr.setRequestHeader(v, headers[v]);
        })
      }
      
      __xhr.onreadystatechange = function()
      {
        if(__xhr.readyState === 4)
        {
          if(__xhr.status === 200)
          {
            resolve(__xhr.responseText);
          }
          else
          {
            reject(new Error(__xhr.status));
          }
        }
      }
      
      __xhr.send();
    });
  }
  
  function fetchDevFiles(title, headers)
  {
    return Promise.all([
      fetchFile(__config.prefix + '/components/' + title + '/' + title + '.js', headers),
      fetchFile(__config.prefix + '/components/' + title + '/' + title + '.html', headers),
      fetchFile(__config.prefix + '/components/' + title + '/' + title + '.css', headers)
    ])
    .then(function(js, html, css){
       var script = createScript(title, ''
        + '//@ sourceURL=' + location.origin + '/components/' + title + '.js\r\n'
        + '//# sourceURL=' + location.origin + '/components/' + title + '.js\r\n'
        + '__KaleoiExtensions__.components["'+title+'"] = (function(){\r\n' + js
        + '\r\n'+title+'.prototype.__extensionsHTML__ = "'+html.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";'
        + '\r\n'+title+'.prototype.__extensionsCSS__ = "'+css.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";'
        + '\r\nreturn '+title+';\r\n}());');
      
      script.setAttribute('env', 'dev');
      
      return __KaleoiExtensions__.components[title];
    })
    .catch(function(){
      console.error("ERR! failed to fetch", title, arguments);
    });
  }
  
  function fetchComponent(title, env, debug, headers)
  {
    return fetchFile(__config.prefix + '/components/' + title + '/' + env + '/' + title + (!debug ? '.min' : '') + '.js', headers)
    .then(function(v){
      
      var script = createScript(title, ''
        + '//@ sourceURL=' + location.origin + '/components/' + title + (!debug ? '.min' : '') + '.js\r\n'
        + '//# sourceURL=' + location.origin + '/components/' + title + (!debug ? '.min' : '') + '.js\r\n'
        + '__KaleoiExtensions__.components["'+title+'"] = (function(){\r\n' + v
        + '\r\nreturn '+title+';\r\n}());');
      
      script.setAttribute('env', env);
      if(debug) script.setAttribute('debug', debug);
      
      return __KaleoiExtensions__.components[title];
    })
    .catch(function(v){
      console.error("ERR! failed to fetch", title, v);
    })
  }
  
  function getComponent(title, query, env, debug)
  {
    var __headers = (__headers || {});
    
    return new Promise(function(resolve, reject){
      if((__config.environments || __environments).indexOf(env) === -1) return reject();
      if(!Solone.authorization) return resolve();
      Solone.authorization({component: title, query: query, headers: __headers}, resolve, reject);
    })
    .then(function(){
      if(__KaleoiExtensions__.components[title]) return __KaleoiExtensions__.components[title];
      if(Solone.useBackend)
      {
        return fetchFile(__config.prefix + '/' + title + location.search, __headers)
        .then(function(v){
          var script = createScript(title, ''
            + '//@ sourceURL=' + location.origin + '/components/' + title + (!debug ? '.min' : '') + '.js\r\n'
            + '//# sourceURL=' + location.origin + '/components/' + title + (!debug ? '.min' : '') + '.js\r\n'
            + v);
          
          script.setAttribute('env', env);
          if(debug) script.setAttribute('debug', debug);
          
          return __KaleoiExtensions__.components[title];
        });
      }
      return ((env === 'dev' || !env) ? fetchDevFiles(title, __headers) : fetchComponent(title, env, debug, __headers));
    })
    .catch(function(v){
      if(Solone.authorization) return Solone.onAuthFail(title, query);
      console.error('ERR! component fetch failed', title, env, debug, v.stack);
    })
  }
  
  function parseQuery(params)
  {
    if(!params) return {env: (__config.env || 'dev')};
    return (__config.uriDecoder ? __config.uriDecoder(params) : decodeURIComponent(params)).split(/[\&]/g)
    .reduce(function(obj, v){
      var split = v.split('=');
      if(split.length === 1)
      {
        obj[split[0]] = true;
      }
      else
      {
        obj[split[0]] = split[1];
      }
      return obj;
    }, {})
  }
  
  /* ENDREGION */
  
  /* DESCRIPTORS */
  /* REGION */
  
  function setDescriptor(v, writable, enumerable)
  {
    return {
      value: v,
      writable: !!writable,
      enumerable: !!enumerable,
      configurable: false
    }
  }
  
  /* ENDREGION */
  
  /* LOCAL PROPERTY METHODS */
  /* REGION */
  
  function backendRouting()
  {
    Solone.useBackend = __config.backendRouting = true;
    return Solone;
  }
  
  function auth(v)
  {
    if(typeof v === 'function') Solone.authorization = __KaleoiExtensions__.authentication = v;
    return Solone;
  }
  
  function setAuthFailListener(v)
  {
    if(!v) return Solone.onAuthFail;
    Solone.onAuthFail = (typeof v === 'function' ? v : Solone.onAuthFail);
    return Solone;
  }
  
  function prefix(v)
  {
    if(!v) return __config.prefix;
    __config.prefix = (typeof v === 'string' ? v : __config.prefix);
    return Solone;
  }
  
  function headers(v)
  {
    if(!v) return __headers;
    __headers = (typeof v === 'object' ? v : __headers);
    return Solone;
  }
  
  function env(v)
  {
    if(!v) return __config.env;
    __config.env = (typeof v === 'string' ? v : __config.env);
    return Solone;
  }
  
  function debug(v)
  {
    if(typeof v === 'undefined') return __config.debug;
    __config.debug= !!v;
    return Solone;
  }
  
  function config()
  {
    return __config;
  }
  
  /* ENDREGION */
  
  /* add ability for auth function, check if useBackend for url */
  function Solone(title)
  {
    var query = parseQuery(location.search.replace('?','')),
        env = (query.env || __config.env || 'dev'),
        debug = (query.debug || __config.debug || false);
    
    Solone.authorization = __KaleoiExtensions__.authentication;
    
    return getComponent(title, query, env, debug);
  }
  
  Object.defineProperties(Solone,{
    useBackend: setDescriptor(false, true, true),
    backendRouting: setDescriptor(backendRouting),
    authorization: setDescriptor(undefined, true, true),
    auth: setDescriptor(auth),
    onAuthFail: setDescriptor(function(){}, true, true),
    setAuthFailListener: setDescriptor(setAuthFailListener),
    headers: setDescriptor(headers),
    prefix: setDescriptor(prefix),
    config: setDescriptor(config),
    env: setDescriptor(env),
    debug: setDescriptor(debug),
    init: setDescriptor(window.solone.init)
  })
  
  /* AMD AND COMMONJS COMPATABILITY */
  /* REGION */
  
  if (typeof define === "function" && define.amd){
    define('solone',function(){return Solone;});
  }
  if(typeof module === 'object' && typeof module.exports === 'object'){
    module.exports.solone = Solone;
  }
  
  /* ENDREGION */
  
  return Solone;
}());