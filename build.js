var base = process.cwd().replace(/\\/g,'/'),
    fs = require('fs'),
    closureCompiler = require('google-closure-compiler-js').compile;

console.log("Building Libraries...");

function flags(src)
{
  return {
    jsCode: [{src: fs.readFileSync(base+src,'utf8')}],
    compilationLevel: 'SIMPLE',
    rewritePolyfills: false
  }
}

fs.writeFileSync(base+'/solone.min.js',closureCompiler(flags('/solone.js')).compiledCode.replace('solone.js','solone.min.js').replace('solone-client', 'solone-client.min').replace('solone-server', 'solone-server.min'));
fs.writeFileSync(base+'/solone-client.min.js',closureCompiler(flags('/solone-client.js')).compiledCode);
fs.writeFileSync(base+'/solone-server.min.js',closureCompiler(flags('/solone-server.js')).compiledCode);

console.log("Finished Building Minified Libraries..");