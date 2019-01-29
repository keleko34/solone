/* TODO: route components, group into single component if multiple files, route environment, load config  */

module.exports = (function(){
  
  /* GLOBALS */
  /* REGION */
  
  var fs = require('fs'),
      path = require('path'),
      querystring = require('querystring'),
      streamAppender = require('./stream-appender/stream-appender.js'),
      preappend = streamAppender.preappend;
  
  /* ENDREGION */
  
  /* PROPERTIES */
  /* REGION */
  var __prefix = '',
      __base = process.cwd().replace(/\\/g,'/'),
      __config = {},
      __environments = [],
      __uriDecoder,
      __auth;
      
  
  /* ENDREGION */
  
  /* LOCAL VARIABLES */
  /* REGION */
  
  var __prefixWasSet = false,
      __baseWasSet = false,
      __currentUrl = __base + __prefix,
      __configFilled = false;
  
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
      fs.readFile(path, function(err, data) {
        if(err) return reject(err);
        resolve(data);
      });
    });
  }
  
  /* ENDREGION */
  
  /* HELPER METHODS */
  /* REGION */
  
  function getConfig(isFirst)
  {
    __config = {};
    
    try{
      var baseConfig = require(__base + '/node_modules/kaleo/config.js'),
          localConfig = require(__base + '/config.js');
      
          Object.keys(baseConfig).forEach(function(v){
            __config[v] = baseConfig[v];
          })

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
          })
    
      if(!__prefixWasSet && __config.prefix) __prefix = __config.prefix;
      if(!__baseWasSet && __config.base) __base = __config.base;
      if(__config.environments) __environments = __config.environments;
      if(__config.uriDecoder) __uriDecoder = __config.uriDecoder;
      if(__config.auth) __auth = __config.auth
      
      __currentUrl = __base + __prefix;
      __configFilled = true;
    }
    catch(e){
      if(!isFirst) console.error('ERR! No config was found in ',__base + __prefix);
    }
  }
  
  function getFileSrc(title, query)
  {
    var __env = (query.env || __config.env || 'dev'),
        __debug = (query.debug || __config.debug || false);
    
    if(__env === 'dev')
    {
      return {
        js: title + '.js',
        html: title + '.html',
        css: title + '.css'
      };
    }
    else
    {
      return {
        js: ('/' + __env + '/' + title + (__debug ? '.min.js' : '.js'))
      };
    }
  }
  
  function fetchComponent(title, query, res, next)
  {
    var files = getFileSrc(title, query),
        fileSrc = {html:'',css:''};
    
    exists(title)
    .then(function(v){
      if(query.env === 'dev')
      {
        getFile(v + '/' + files.html)
        .then(function(v){
          fileSrc.html = v;
          return getFile(v + '/' + files.css);
        })
        .then(function(v){
          fileSrc.css = v;
          res.pipe(allFilesRecieved(title, fs.createReadStream(v + '/' + files.js), fileSrc)); 
        })
        .catch(function(v){
          console.error("ERR! Component", title, "is missing",v,"required to operate")
          res.end('Component missing files');
        })
      }
      else
      {
        res.pipe(allFilesRecieved(title, fs.createReadStream(v + '/' + files.js))); 
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
          '__KaleoExtensions__.components['+title+'] = (function(){\r\n',
          '\r\n'+title+'.prototype.__extensionsHTML__ = "'+files.html.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";'
        + '\r\n'+title+'.prototype.__extensionsCSS__ = "'+files.css.replace(/[\r\n]/g,'').replace(/[\"]/g,"'")+'";'
        + '\r\nreturn '+title+';\r\n}());'
      ));
    }
    else
    {
      return stream.pipe(preappend(
          '__KaleoExtensions__.components['+title+'] = (function(){\r\n',
          '\r\nreturn '+title+';\r\n}());'
      ));
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
  
  function config()
  {
    return __config;
  }
  
  /* ENDREGION */
  
  function Solone(req, res, next)
  {
    /* CHECK IF URL CHANGED */
    if(__currentUrl !== __base + __prefix)
    {
      __currentUrl = __base + __prefix;
      __configFilled = false;
    }
    
    /* FETCH CONFIGS IF NOT ALREADY FETCHED */
    if(!__configFilled) getConfig();
    
    /* ERR IF EITHER FAILED */
    if(!__configFilled)
    {
      console.error("ERR!", "Config.js is missing from", __base + __prefix)
      return next();
    }
    
    
    /* TAKE REQ AND SEND BACK COMPONENT FILE BASED ON URL AND QUERY */
    /* URL = COMPONENT NAME */
    /* QUERY = (debug, env) */
    var query = req.query,
        localQueryIndex = req.url.indexOf('?'),
        localQueryString = '',
        localQuery,
        component = path.posix.basename(req.url);
    
    /* PARSE QUERY PARAMS FROM URL */
    if(localQueryIndex !== -1)
    {
      var decoder = (__uriDecoder ? { decodeURIComponent: __uriDecoder } : {});
      
      localQueryString = req.url.substring(localQuery, req.url.length);
      localQuery = querystring.parse(localQueryString, null, null,decoder);
      
      Object.keys(localQuery).forEach(function(v){
        query[v] = localQuery[v];
      })
    }
    
    if(!query.env) query.env = 'dev';
    
    if(__environments.indexOf(query.env) !== -1)
    {
      /* CHECK AND RUN AUTH IF IT IS USED */
      if(typeof __auth === 'function')
      {
        if(__auth(component, query, req.headers.Authorization))
        {
          /* SEND BACK COMPONENT */
          fetchComponent(component, query, res, next);
        }
        else
        {
          return next();
        }
      }
      else
      {
        /* SEND BACK COMPONENT */
        fetchComponent(component, query, res, next);
      }
    }
    else
    {
      return next();
    }
  }
  
  Object.defineProperties(Solone, {
    prefix: setDescriptor(prefix),
    base: setDescriptor(base),
    config: setDescriptor(config)
  })
  
  return Solone;
}())