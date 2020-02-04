const { preappend, combine } = require('./stream-appender.js'),
      { stat, createReadStream } = require('fs'),
      parseUrl = require('url').parse,
      parsePath = require('path').parse,
      base = process.cwd().replace(/\\/g,'/');

if(!Promise.any)
{
  Promise.any = function(promises)
  {
    let count = 0,
        errors = [];
    promises = promises.map((promise, i, len) => promise.catch(err => {
      errors[errors.length] = err;
      return new Promise((resolve, reject) => {
        if(++count === len) return reject(errors);
      });
    }));

    return Promise.race(promises);
  }
}

function exists(prefix, path, title)
{
  return new Promise((resolve,reject) => {
    stat((title ? `${base}${prefix}/components/${path}${path ? '/' : ''}${title}` : path), (err, stats) => {
      if(err || (title && !stats.isDirectory())) return reject(err);
      resolve(path);
    });
  });
}

function streamDevJs(path, title)
{
  return new Promise((resolve, reject) => {
    const stream = createReadStream(`${path}/${title}.js`);

    stream.on('error', reject);

    stream.on('open', () => resolve(stream
      .pipe(preappend(`__KaleoiExtensions__.components["${title}"] = (function(){\r\n`))
    ))
  })
}

function streamDevFile(path, title, ext)
{
  return new Promise((resolve, reject) => {
    const stream = createReadStream(`${path}/${title}.${ext}`);

    stream.on('error', reject);

    stream.on('open', () => resolve(stream
      .pipe(preappend(
        `\r\n${title}.prototype.__extensions${ext.toUpperCase()}__ = "`,
        `";\r\n`,
        (chunk) => chunk.replace(/[\r\n]/g,'')))
    ));
  });
}

function createDevStream(path, title)
{
  return Promise.all([
    streamDevJs(path, title),
    streamDevFile(path, title, 'html'),
    streamDevFile(path, title, 'css'),
  ])
  .then(streams => combine(streams).pipe(preappend(null, `\r\nreturn ${title};\r\n}());`)))
  .catch(() => new Error(`Failed to fetch the dev files for ${title} inside ${path}`));
}

function createStream(path, title, env, debug)
{
  return new Promise((resolve, reject) => {
    const stream = createReadStream(`${path}/${env}/${title}.${(debug ? 'js' : 'min.js')}`);

    stream.on('error', reject);

    stream.on('open', () => resolve(stream
      .pipe(preappend(
        `__KaleoiExtensions__.components["${title}"]${debug ? ' = (function(){\r\n' : '=(function(){'}`,
        (debug ? `\r\nreturn${title};\r\n}());` : `return${title};}());`)
      ))
    ))
  })
}

class Solone {
  constructor() {
    this.designPatterns = ['atoms', 'molecules', 'organisms', 'templates', 'pages'];
    this.useDesignPatterns = true;
    this.prefix = '';
    this.environments = [ 'dev', 'prod' ];
    this.env = 'dev';
    this.debug = true;
    this.decoder = decodeURIComponent;
    this.config = {};
    this.authorize = () => Promise.resolve();
    this.disabled = false;
    this.debug = false;
  }

  exists(title, useDesignPatterns) {
    if(useDesignPatterns)
      return Promise.any(this.designPatterns.map(type => exists(this.prefix, type, title)));
    return exists(this.prefix, '', title);
  }

  fetch(title, env, debug, useDesignPatterns) {
    return this.exists(title, useDesignPatterns)
      .then(type => createStream(`${base}${this.prefix}/components/${type}${type ? '/' : ''}${title}`, title, env, debug));
  }

  fetchDev(title, useDesignPatterns) {
    return this.exists(title, useDesignPatterns)
      .then(type => createDevStream(`${base}${this.prefix}/components/${type}${type ? '/' : ''}${title}`, title));
  }

  fetchConfigs() {
    const globalConfig = `${base}${this.prefix}/node_modules/kaleoi/config.js`,
          localConfig = `${base}${this.prefix}/kaleoi.config.js`;

    return exists(globalConfig)
      .then(() => {
        this.config = require(globalConfig);
        Object.keys(this.config)
          .forEach(key => (this[key] = this.config[key]))
      })
      .then(exists(localConfig))
      .then(() => {
        const config = require(localConfig);
        Object.keys(config)
          .forEach(key => {
            /* If a config property is a method yuse the return as the config */
            if(['decoder', 'auth'].indexOf(key) === -1)
            {
              if(typeof config[key] === 'function')
              {
                config[key] = config[key]();
              }
            }

            /* make sure environments always has dev and prod */
            switch(key) {
              case 'environment':
                if(config[key].indexOf('dev') === -1) config[key].push('dev');
                if(config[key].indexOf('prod') === -1) config[key].push('prod');
            }

            this.config[key] = config[key];
            this[key] = config[key];
          })
      })
  }
}

function pointer(obj, key)
{
  return {
    get() { return obj[key]; },
    set(v) { obj[key] = v; },
    configurable: true,
    enumerable: true
  }
}

function bind(func, obj)
{
  const bound = func.bind(obj);
  Object.keys(obj)
    .forEach(key => {
      Object.defineProperty(bound, key, pointer(obj, key))
    })
  return bound;
}

function init(req, res, next)
{
  const url = parseUrl(req.url, true),
        path = parsePath(url.pathname),
        component = path.name,
        env = (url.query.env && this.environments.indexOf(url.query.env) !== -1 ? url.query.env : this.env),
        debug = (!!url.query.debug || this.debug),
        useDesignPatterns = (typeof url.query.useDesignPatterns === 'boolean' ? url.query.useDesignPatterns : this.useDesignPatterns);

  if(path.ext) return next();
  this.authorize(component, url.query, req.headers)
    .then(() => this[env === 'dev' ? 'fetchDev' : 'fetch'](component, env, debug, useDesignPatterns))
    .then(stream => stream.pipe(res))
    .catch(next);
}

module.exports = bind(init, new Solone());
