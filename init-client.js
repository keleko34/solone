window.solone = (function(){
  var __prefix = '',
      __base = '',
      __environments = ['dev', 'prod'],
      __uriDecoder,
      __headers,
      __config = __KaleoExtensions__.config,
      __configsFetched = false;
  
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
  
  function fetchConfigs()
  {
    return Promise.all([
      fetchFile('/node_modules/kaleo/config.js'),
      fetchFile(__base + __prefix + '/config.js'),
      fetchFile(__base + __prefix + '/auth-client.js')
    ])
    .then(function(nodeConfig, localConfig, auth){
      var script = createScript('config_setup', ''),
          script_auth = createScript('auth', auth);
      
      script.textContent = nodeConfig.replace('module.exports', '\r\nvar node_config')
      + localConfig.replace('module.exports', '\r\nvar local_config');
      
      
      
      Object.keys(node_config)
      .forEach(function(k){
        __config[k] = node_config[k];
      })
      
      Object.keys(local_config)
      .forEach(function(k){
        if(__config[k] && typeof __config[k] === 'object')
        {
          if(__config[k].length)
          {
            __config[k].concat(local_config[k]);
          }
          else
          {
            Object.keys(local_config[k]).forEach(function(key){
              __config[k][key] = local_config[k][key];
            })
          }
        }
        else
        {
          __config[k] = local_config[k];
        }
      });
      
      Solone.authorization = __KaleoExtensions__.authorization;
      
      /* Cleanup */
      node_config = null;
      local_config = null;
      document.head.removeChild(script);
      document.head.removeChild(script_auth);
      
      if(__config.prefix) __prefix = __config.prefix;
      if(__config.base) __base = __config.base;
      if(__config.environments) __environments = __environments.concat(__config.environments);
      if(__config.uriDecoder) __uriDecoder = __config.uriDecoder;
      if(__config.backendRouting) Solone.useBackend = __config.backendRouting;
      
      __configsFetched = true;
    })
    .catch(function(){
      console.error('Failed to fetch configs', arguments);
    });
  }
  
  function fetchDevFiles(title, headers)
  {
    return Promise.all([
      fetchFile(__base + __prefix + '/components/' + title + '/' + title + '.js', headers),
      fetchFile(__base + __prefix + '/components/' + title + '/' + title + '.html', headers),
      fetchFile(__base + __prefix + '/components/' + title + '/' + title + '.css', headers)
    ])
    .then(function(js, html, css){
       var script = createScript(title, ''
        + '__KaleoExtensions__.components["'+title+'"] = (function(){\r\n' + js
        + '\r\n'+title+'.prototype.__extensionsHTML__ = "'+html.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";'
        + '\r\n'+title+'.prototype.__extensionsCSS__ = "'+css.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";'
        + '\r\nreturn '+title+';\r\n}());');
      
      script.setAttribute('env', 'dev');
      
      return __KaleoExtensions__.components[title];
    })
    .catch(function(){
      console.error("ERR! failed to fetch", title, arguments);
    });
  }
  
  function fetchComponent(title, env, debug, headers)
  {
    return fetchFile(__base + __prefix + '/components/' + title + '/' + env + '/' + title + (!debug ? '.min' : '') + '.js', headers)
    .then(function(v){
      
      var script = createScript(title, ''
        + '__KaleoExtensions__.components["'+title+'"] = (function(){\r\n' + v
        + '\r\nreturn '+title+';\r\n}());');
      
      script.setAttribute('env', env);
      if(debug) script.setAttribute('debug', debug);
      
      return __KaleoExtensions__.components[title];
    })
    .catch(function(v){
      console.error("ERR! failed to fetch", title, v);
    })
  }
  
  function getComponent(title, query, env, debug)
  {
    var __headers = {};
    
    return new Promise(function(resolve, reject){
      if(__environments.indexOf(env) === -1) return reject();
      if(!Solone.authorization) return resolve();
      Solone.authorization({component: title, query: query, headers: __headers}, resolve, reject);
    })
    .then(function(){
      if(__KaleoExtensions__.components[title]) return __KaleoExtensions__.components[title];
      if(Solone.useBackend)
      {
        return fetchFile(__base + __prefix + '/' + title + location.search, __headers)
        .then(function(v){
          var script = createScript(title, v);
          
          script.setAttribute('env', env);
          if(debug) script.setAttribute('debug', debug);
          
          return __KaleoExtensions__.components[title];
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
    return (__uriDecoder ? __uriDecoder(params) : decodeURIComponent(params)).split(/[\&]/g)
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
    Solone.useBackend = true;
    return Solone;
  }
  
  function auth(v)
  {
    if(typeof v === 'function') Solone.authorization = v;
    return Solone;
  }
  
  function setAuthFailListener(v)
  {
    if(!v) return __onAuthorizationFailed;
    __onAuthorizationFailed = (typeof v === 'function' ? v : __onAuthorizationFailed);
    return Solone;
  }
  
  function prefix(v)
  {
    if(!v) return __prefix;
    __prefix = (typeof v === 'string' ? v : __prefix);
    return Solone;
  }
  
  function base(v)
  {
    if(!v) return __base;
    __base = (typeof v === 'string' ? v : __base);
    return Solone;
  }
  
  function headers(v)
  {
    if(!v) return __headers;
    __headers = (typeof v === 'object' ? v : __headers);
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
        env = (query.env || __config.env),
        debug = (query.debug || __config.debug);
    
    if(!__configsFetched) 
    {
      return fetchConfigs()
      .then(function(){ return getComponent(title, query, env, debug);})
    }
    
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
    base: setDescriptor(base),
    config: setDescriptor(config)
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