var base = process.cwd().replace(/\\/g,'/'),
    fs = require('fs'),
    closureCompiler = require('google-closure-compiler-js').compile;

console.log("Building Libraries...");

function flags(src)
{
  return {
    jsCode: [{src: fs.readFileSync(base+src,'utf8')}],
    compilationLevel: 'SIMPLE'
  }
}

fs.writeFileSync(base+'/init.min.js',closureCompiler(flags('/init.js')).compiledCode.replace('init.js','init.min.js').replace('init-client', 'init-client.min').replace('init-server', 'init-server.min'));
fs.writeFileSync(base+'/init-client.min.js',closureCompiler(flags('/init-client.js')).compiledCode);
fs.writeFileSync(base+'/init-server.min.js',closureCompiler(flags('/init-server.js')).compiledCode);

console.log("Finished Building Minified Libraries..");