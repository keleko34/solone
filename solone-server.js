var fs = require('fs'),
    preappend = require('./stream-appender/stream-appender.js').preappend;

module.exports = (function(){
  
  /* PROPERTIES */
  /* REGION */
  var __prefix = '',
      __base = process.cwd().replace(/\\/g,'/'),
      __environments = ['dev', 'prod'],
      __uriDecoder,
      __config = {},
      __auth,
      __disabled = false,
      __configsFetched = false,
      __prefixWasSet = false,
      __baseWasSet = false,
      __onAuthFail = function(){};
      
  /* ENDREGION */
  
  /* PROMISE METHODS */
  /* REGION */
  
  function exists(title)
  {
    return new Promise(function(resolve, reject) {
      fs.stat(__base + __prefix + '/components/' + title, function(err, data) {
        if(err || !data.isDirectory()) return reject(err);
        resolve(__base + __prefix + '/components/' + title);
      });
    });
  }
  
  function getFile(path)
  {
    return new Promise(function(resolve, reject) {
      fs.readFile(path, { encoding: 'utf8'}, function(err, data) {
        if(err) return reject(err);
        resolve(data);
      });
    });
  }
  
  function getDevComponents(title)
  {
    return Promise.all([
      getFile(__base + __prefix + '/components/' + title + '/' + title + '.html'),
      getFile(__base + __prefix + '/components/' + title + '/' + title + '.css')
    ]);
  }
  
  function authorize(title, query, headers)
  {
    return new Promise(function(resolve, reject){
        __auth({component: title, query: query, headers: headers}, resolve, reject);
    });
  }
  
  function getStream(title, env, debug)
  {
    return fs.createReadStream(__base + __prefix + '/components/' + title + '/' + (env === 'dev' ? (title + '.js') : (env + '/' + title + (!debug ? '.min' : '') + '.js')));
  }
  
  /* ENDREGION */
  
  /* FETCH CONFIGS */
  /* REGION */
  
  function getConfigs()
  {
    return new Promise(function(resolve, reject){
      
      try{
        var baseConfig = require(process.cwd().replace(/\\/g,'/') + '/node_modules/kaleo/config.js'),
            localConfig = require(__base + __prefix + '/config.js');
    
        __auth = require(__base + __prefix + '/auth-server.js');
      }
      catch(e)
      {
        return reject(e);
      }
      
      Object.keys(baseConfig).forEach(function(v){
        __config[v] = baseConfig[v];
      });
    
      Object.keys(localConfig).forEach(function(v){
        if(__config[v] && typeof __config[v] === 'object')
        {
          if(__config[v].length)
          {
            __config[v].concat(localConfig[v]);
          }
          else
          {
            Object.keys(localConfig[v]).forEach(function(key){
              __config[v][key] = localConfig[v][key];
            })
          }
        }
        else
        {
          __config[v] = localConfig[v];
        }
      });

      if(!__prefixWasSet && __config.prefix) __prefix = __config.prefix;
      if(!__baseWasSet && __config.base) __base = __config.base;
      if(__config.environments) __environments = __environments.concat(__config.environments);
      if(__config.uriDecoder) __uriDecoder = __config.uriDecoder;

      __configsFetched = true;
      
      resolve(__configsFetched);
    })
  }
  
  /* ENDREGION */
  
  /* URL HANDLING */
  /* REGION */
  
  function search(url)
  {
    var __queryIndex = url.indexOf('?'),
        __hashIndex = url.indexOf('#');
    
    if(__queryIndex !== -1)
    {
      if(__hashIndex > __queryIndex)
      {
        return url.substring(__queryIndex,__hashIndex); 
      }
      else
      {
        return url.substring(__queryIndex,url.length);
      }
    }
    return '';
  }
  
  function hash(url)
  {
    var __hashIndex = url.indexOf('#');
    
    if(__hashIndex !== -1)
    {
      return url.substring(__hashIndex,url.length);
    }
    return '';
  }
  
  function ext(url)
  {
    var __extIndex = url.lastIndexOf('.');
    
    if(__extIndex !== -1)
    {
      return url.substring(__extIndex, url.length);
    }
    return '';
  }
  
  function last(url)
  {
    var __extIndex = url.lastIndexOf('.'),
        __split = url.split('/');
    return __split[(__split.length - (__extIndex !== -1 ? 2 : 1))];
  }
  
  function pathname(url)
  {
    var __extIndex = url.lastIndexOf('.'),
        __split = url.split('/');
    
    if(__extIndex !== -1) __split = __split.slice(0, (__split.length - 1));
    
    return __split.join('/');
  }
  
  function query(q, search)
  {
    if(!search) return q;
    
    var __query = q,
        __pairs = search.split('&'),
        __pair;
    
    __pairs.forEach(function(v){
      __pair = v.split('=');
      __query[__pair[0]] = __pair[1];
    });
    
    return __query;
  }
  
  function parseUrl(req)
  {
    var __url = {},
        __query = (req.query || {}),
        __decoder = (__uriDecoder ? __uriDecoder : decodeURIComponent);
    
    __url.href = __decoder(req.url);
    __url.search = search(__url.href);
    __url.hash = hash(__url.href.replace(__url.search,''));
    __url.path = __url.href.replace(__url.search,'').replace(__url.hash,'');
    __url.ext = ext(__url.path);
    __url.last = last(__url.path);
    __url.pathname = pathname(__url.path);
    __url.query = query(__query, __url.search);
    __url.base = __url.path.replace(__prefix, '').replace(__base, '');
    
    return __url;
  }
  
  /* ENDREGION */
  
  /* HELPER METHODS */
  /* REGION */
  
  function fetchComponent(title, query, res, next)
  {
    exists(title)
    .then(function(){
      if(query.env === 'dev')
      {
        getDevComponents(title)
        .then(function(files){
          allFilesRecieved(title, getStream(title, query.env, query.debug), {html: files[0], css: files[1]}).pipe(res); 
        })
        .catch(function(e){
          console.error("ERR! Component", title, "is missing",e,"required to operate")
          res.end('Component missing files');
        })
      }
      else
      {
        allFilesRecieved(title, getStream(title, query.env, query.debug)).pipe(res);
      }
    })
    .catch(function(){
      return next();
    })
  }
  
  function allFilesRecieved(title, stream, files)
  {
    if(files)
    {
      return stream.pipe(preappend(
          '__KaleoiExtensions__.components["'+title+'"] = (function(){\r\n',
          '\r\n'+title+'.prototype.__extensionsHTML__ = "'+files.html.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";'
        + '\r\n'+title+'.prototype.__extensionsCSS__ = "'+files.css.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";'
        + '\r\nreturn '+title+';\r\n}());'
      ));
    }
    else
    {
      return stream.pipe(preappend(
          '__KaleoiExtensions__.components['+title+'] = (function(){\r\n',
          '\r\nreturn '+title+';\r\n}());'
      ));
    }
  }
  
  /* TODO: change to using path methods */
  function getComponent(req, res, next)
  {
    var url = parseUrl(req)
    
    if(url.base === '/' || url.base.split(/[\/\.]/g).filter(Boolean).length > 1) return next();
    
    /* TAKE REQ AND SEND BACK COMPONENT FILE BASED ON URL AND QUERY */
    /* url.last = COMPONENT */
    /* QUERY = (debug, env) */
    var query = url.query,
        component = url.last,
        env = (query.env || __config.env || 'dev');
    
    query.env = env;
    
    if(__environments.indexOf(env) !== -1)
    {
      if(typeof __auth === 'function')
      {
        authorize(component, query, req.headers)
        .then(function(){
          fetchComponent(component, query, res, next);
        })
        .catch(function(){
          __onAuthFail(component, query);
          next();
        })
      }
      else
      {
        fetchComponent(component, query, res, next);
      }
    }
    else
    {
      return next();
    }
  }
  
  /* ENDREGION */
  
  /* DESCRIPTORS */
  /* REGION */
  
  function setDescriptor(v)
  {
    return {
      value: v,
      writable: false,
      enumerable: false,
      configurable: false
    }
  }
  
  /* ENDREGION */
  
  /* LOCAL PROPERTY METHODS */
  /* REGION */
  
  function prefix(v)
  {
    if(!v) return __prefix;
    if(typeof v === 'string') __prefixWasSet = !!(__prefix = v);
    return Solone;
  }

  function base(v)
  {
    if(!v) return __base;
    if(typeof v === 'string') __baseWasSet = !!(__base = v);
    return Solone;
  }
  
  function disabled(v)
  {
    __disabled = !!v;
    return Solone;
  }
  
  function config()
  {
    return __config;
  }
  
  function auth(v)
  {
    if(!v) return __auth;
    __auth = (typeof v === 'function' ? v : __auth);
    return Solone;
  }
  
  function setAuthFailListener(v)
  {
    if(!v) return __onAuthFail;
    __onAuthFail = (typeof v === 'function' ? v : __onAuthFail);
    return Solone;
  }
  
  /* ENDREGION */
  
  function Solone(req, res, next)
  {
    /* FETCH CONFIGS IF NOT ALREADY FETCHED */
    if(!__configsFetched)
    {
      getConfigs()
      .then(function(){
        if(__disabled) return next();
        getComponent(req, res, next);
      })
      .catch(function(e){
        console.error("ERR!", "Config.js is missing from", __base + __prefix, e)
        return next();
      })
    }
    else
    {
      if(__disabled) return next();
      getComponent(req, res, next);
    }
  }
  
  Object.defineProperties(Solone, {
    prefix: setDescriptor(prefix),
    base: setDescriptor(base),
    isDisabled: setDescriptor(disabled),
    config: setDescriptor(config),
    auth: setDescriptor(auth),
    setAuthFailListener: setDescriptor(setAuthFailListener)
  })
  
  return Solone;
}())