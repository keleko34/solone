window.solone = (function(){
  
  var __prefix = '',
      __base = '',
      __config = {};
  
  var __CSSLOCALS = /((\.{{>?local}}.*?{(([\r\n\s\W\w]+?)|(.*?))}(?=[\n\.\r\s]|$)))/g;
  
  /* HELPER METHODS */
  /* REGION */
  
  function createScript(name, script)
  {
    var sc = document.createElement('script');
    sc.type = 'text/javascript';
    sc.innerText = script;
    return sc;
  }
  
  /* TODO: change to split base css locals as well */
  function createStyleSheet(title)
  {
    var alreadyExists = document.querySelector('style[name=' + title + ']'),
        st = (document.createElement('style'));
        
        st.type = 'text/css';
        st.name = title;
        st.innerText = (alreadyExists ? s.match(__CSSLOCALS).join('\r\n') : s);
    
    document.head[alreadyExists && alreadyExists.nextSibling ? 'insertBefore' : 'appendChild'](st, alreadyExists.nextSibling);
  }
  
  function fetchFile(url, headers, success, fail)
  {
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
          success(__xhr.responseText);
        }
        else
        {
          fail(__xhr.status);
        }
      }
    }
    __xhr.send();
  }
  
  function fetchConfigs()
  {
    fetchFile(__base + __prefix + '/node_modules/kaleo/config.js', undefined, function(v){
      var nodeConfigText = v.replace('module.exports', 'var nodeConfig');
      
    }, function(v){
      console.error('Failed to ')
    })
  }
  
  function parseQuery(params)
  {
    if(!params) return {env: 'dev'};
    return params.split(/[\&]/g)
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
  
  function error()
  {
    
  }
  
  function getComponent()
  {
    
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
  
  /* ENDREGION */
  
  /* add ability for auth function, check if useBackend for url */
  function Solone(title)
  {
    var query = parseQuery(location.search.replace('?','')),
        env = query.env,
        debug = query.debug,
        next = getComponent.bind({title: title, env:env, debug:debug}),
        fail = error.bind({title: title, env:env, debug:debug});
    
    if(!Solone.authorization) return next();
    
    Solone.authorization(title, query, next, fail);
  }
  
  Object.defineProperties(Solone,{
    useBackend: setDescriptor(false, true, true),
    backendRouting: setDescriptor(backendRouting),
    authorization: setDescriptor(undefined, true, true),
    auth: setDescriptor(auth),
    prefix: setDescriptor(prefix),
    base: setDescriptor(base)
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