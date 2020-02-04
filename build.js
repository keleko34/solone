const { unlink, readFileSync, writeFileSync } = require('fs'),
      base = process.cwd().replace(/\\/g,'/'),
      closureCompiler = require('google-closure-compiler-js');

console.log("Building Solone Libraries...");

function flags(title)
{
  return {
    jsCode: [{src: readFileSync(`${base}/${title}.js`,'utf8')}],
    compilationLevel: 'SIMPLE',
    rewritePolyfills: false
  }
}

function compile(title)
{
  return new Promise((resolve, reject) => {
    unlink(`${base}/${title}.min.js`, (err) => {
      if(err && err.code !== 'ENOENT') return reject(err);
      writeFileSync(`${base}/${title}.min.js`, closureCompiler(flags(title)).compiledCode
        .replace('solone.js','solone.min.js')
        .replace('solone-client', 'solone-client.min')
        .replace('solone-server', 'solone-server.min'));
      resolve();
    })
  });
}

Promise.all([
  compile('solone'),
  compile('solone-client'),
  compile('solone-server')
])
.then(() => {
  console.log("Finished Building Minified Solone Libraries..");
})
.catch((err) => {
  console.error('Failed To Build Solone Libraries', err);
})
