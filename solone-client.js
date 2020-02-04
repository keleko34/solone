window.solone = (function() {
  if(!__KaleoiExtensions__.config) {
    __KaleoiExtensions__.config = {
      env: 'dev',
      environments: ['dev', 'prod'],
      designPatterns: ['atoms', 'molecules', 'organisms', 'templates', 'pages']
    };
  }

  if(!__KaleoiExtensions__.authentication) {
    __KaleoiExtensions__.authentication = __KaleoiExtensions__.config.authentication || function() { return Promise.resolve(); };
  }

  /* HELPER METHODS */
  /* REGION */

  function setDescriptor(value, writable, enumerable)
  {
    return {
      value: value,
      writable: !!writable,
      enumerable: !!enumerable,
      configurable: false
    }
  }

  function setRelatedDescriptor(key, obj)
  {
    return {
      get: function() { return obj[key]; },
      set: function(v) { obj[key] = v; },
      enumerable: true,
      configurable: true
    }
  }

  function parse(query)
  {
    if(!query) return { env: Solone.env };
    return (Solone.uriDecoder ? Solone.uriDecoder(query) : decodeURIComponent(query)).split(/[\&]/g)
      .reduce(function(obj, v) {
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
      }, { env: Solone.env });
  }

  function createScript(title, env, debug, text)
  {
    var script = document.createElement('script');
    if(debug) script.setAttribute('debug', debug);
    script.setAttribute('env', env);
    script.title = title;
    script.type = 'text/javascript';
    script.textContent = text;
    document.head.appendChild(script);
    return script;
  }

  function fetchFile(url)
  {
    return new Promise(function(resolve, reject){
      var xhr = new XMLHttpRequest(),
          headers = Object.keys(Solone.headers || {}),
          len = headers.length;

      xhr.open('GET', url, true);

      if(len)
      {
        var x = 0;
        for(x;x<len;x++)
        {
          xhr.setRequestHeader(headers[x], __headers[headers[x]]);
        }
      }

      xhr.onreadystatechange = function()
      {
        if(xhr.readyState === 4)
        {
          if(xhr.status === 200) return resolve(xhr.responseText);
          return reject(new Error(xhr.status));
        }
      }

      xhr.send();
    });
  }

  function concatDevFiles(title, type, js, html, css)
  {
    js = (js || "function " + title + "() {\r\nconsole.error('NO JS COMPONENT FOR '" + title +");\r\n}");
    return ''
    + '//@ sourceURL=' + location.origin + '/components/' + (type ? type + '/' : '') + title + '.js\r\n'
    + '//# sourceURL=' + location.origin + '/components/' + (type ? type + '/' : '') + title + '.js\r\n'
    + '__KaleoiExtensions__.components["' + title + '"] = (function(){\r\n\t' + js.replace(/(\r\n)/g, '\r\n\t')
    + '\r\n\t' + title + '.prototype.__extensionsHTML__ = "' + html.replace(/[\r\n]/g,'').replace(/[\"]/g,"'") + '";'
    + '\r\n\t' + title + '.prototype.__extensionsCSS__ = "' + css.replace(/[\r\n]/g,'').replace(/[\"]/g,"'") + '";'
    + '\r\n\treturn ' + title + ';\r\n}());';
  }

  function concatFile(title, type, debug, js)
  {
    js = (js || "function " + title + "() {\r\nconsole.error('NO JS COMPONENT FOR '" + title +");\r\n}");
    return ''
    + '//@ sourceURL=' + location.origin + '/components/'+ (type ? type + '/' : '') + title + (!debug ? '.min' : '') + '.js\r\n'
    + '//# sourceURL=' + location.origin + '/components/'+ (type ? type + '/' : '') + title + (!debug ? '.min' : '') + '.js\r\n'
    + '__KaleoiExtensions__.components["' + title + '"] = (function(){\r\n\t' + js.replace(/(\r\n)/g, '\r\n\t')
    + '\r\n\treturn ' + title + ';\r\n}());'
  }

  function concatBackendFile(title, type, debug, js)
  {
    js = (js || "function " + title + "() {\r\nconsole.error('NO JS COMPONENT FOR '" + title +");\r\n}");
    return ''
    + (js.indexOf('//@ sourceURL=') === -1 ? '//@ sourceURL=' + location.origin + '/components/'+ (type ? type + '/' : '') + title + (!debug ? '.min' : '') + '.js\r\n'  : '')
    + (js.indexOf('//# sourceURL=') === -1 ? '//# sourceURL=' + location.origin + '/components/'+ (type ? type + '/' : '') + title + (!debug ? '.min' : '') + '.js\r\n'  : '')
    + js;
  }

  function fetchComponent(title, env, debug, designPattern)
  {
    var base = Solone.prefix + '/components/' + (designPattern ? designPattern + '/' : '') + title;

    if(env === 'dev')
    {
      return Promise.all([
        fetchFile(base + '/' + title + '.js'),
        fetchFile(base + '/' + title + '.html'),
        fetchFile(base + '/' + title + '.css')
      ])
      .then(function(files) {
        createScript(title, env, false, concatDevFiles(title, designPattern, files[0], files[1], files[2]));
        return __KaleoiExtensions__.components[title];
      })
      .catch(function(err){ console.error(err, title, env); });
    }
    return fetchFile(base + '/' + env + '/' + title + (!debug ? '.min' : '') + '.js')
      .then(function(js) {
        createScript(title, env, debug, concatFile(title, designPattern, debug, js));
        return __KaleoiExtensions__.components[title];
      })
      .catch(function(err){ console.error(err, title, env); })
  }

  /* ENDREGION */

  function Solone(title)
  {
    var query = parse(location.search),
        debug = (query.debug || Solone.debug || false),
        designPattern = '',
        useDesignPatterns = (query.useDesignPatterns || Solone.useDesignPatterns || true)

    if(Solone.environments.indexOf(query.env) === -1) return Promise.reject();
    if(useDesignPatterns && title.indexOf('--') !== -1) {
      var split = title.split('--');
      title = split[1];
      designPattern = split[0];
      if(Solone.designPatterns.indexOf(designPattern) === -1) return Promise.reject();
    }

    return Solone.authentication({ component: title, query: query, headers: Solone.headers})
      .then(function() {
        if(__KaleoiExtensions__.components[title]) return __KaleoiExtensions__.components[title];
        if(Solone.backendRouting)
        {
          return fetchFile('/' + title + location.search)
            .then(function(js) {
              createScript(title, query.env, debug, concatBackendFile(title, designPattern, debug, js));
              return __KaleoiExtensions__.components[title];
            });
        }
        return fetchComponent(title, query.env, debug, designPattern);
      })
      .catch(function(err) {
        console.error(err, title, env, debug, designPattern);
      })
  }

  Object.defineProperties(Solone, {
    config: setDescriptor(__KaleoiExtensions__.config),
    backendRouting: setRelatedDescriptor('backendRouting', __KaleoiExtensions__.config),
    designPatterns: setRelatedDescriptor('designPatterns', __KaleoiExtensions__.config),
    useDesignPatterns: setRelatedDescriptor('useDesignPatterns', __KaleoiExtensions__.config),
    uriDecoder: setRelatedDescriptor('uriDecoder', __KaleoiExtensions__.config),
    headers: setRelatedDescriptor('headers', __KaleoiExtensions__.config),
    prefix: setRelatedDescriptor('prefix', __KaleoiExtensions__.config),
    environments: setRelatedDescriptor('environments', __KaleoiExtensions__.config),
    env: setRelatedDescriptor('env', __KaleoiExtensions__.config),
    debug: setRelatedDescriptor('debug', __KaleoiExtensions__.config),
    authentication: setRelatedDescriptor('authentication', __KaleoiExtensions__)
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