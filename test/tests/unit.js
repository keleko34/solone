mocha.setup('bdd');

(function(describe,it,expect,spy){
  /* mocha tests */
  
  window.__KaleoExtensions__ = {components:{}, config:{}};
  
  /* Attach script to head */
  var s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = '/init-client.js';
  document.head.appendChild(s);
  
  describe("Component Fetching:", function(){
    
    describe("Fetching from the frontend", function(){
      
      __KaleoExtensions__.components = {};
      
      it("Should properly fetch a dev environment component", function(done){
        
        __KaleoExtensions__.components = {};
        
        solone.prefix('/test/tests');
        
        solone('a')
        .then(function(){
          var s = document.querySelector('script[title="a"][env="dev"]');
          
          expect(__KaleoExtensions__.components.a).to.not.equal(undefined);
          expect(__KaleoExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
          expect(__KaleoExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
          expect(s).to.not.equal(null);
          
          s.parentElement.removeChild(s);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
        
      });
      
      it('Should properly fetch a prod environment component', function(done){
        
        __KaleoExtensions__.components = {};
        
        solone.config().env = 'prod';
        
        solone('a')
        .then(function(){
          var s = document.querySelector('script[title="a"][env="prod"]')
          
          expect(__KaleoExtensions__.components.a).to.not.equal(undefined);
          expect(__KaleoExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
          expect(__KaleoExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
          expect(s).to.not.equal(null);
          
          s.parentElement.removeChild(s);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
      });
      
      it('Should properly fetch a debug component from a minified environment', function(done){
        
        __KaleoExtensions__.components = {};
        
        solone.config().env = 'prod';
        solone.config().debug = true;
        
        solone('a')
        .then(function(){
          var s = document.querySelector('script[title="a"][env="prod"][debug="true"]');
          
          expect(__KaleoExtensions__.components.a).to.not.equal(undefined);
          expect(__KaleoExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
          expect(__KaleoExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
          expect(s).to.not.equal(null);
          
          s.parentElement.removeChild(s);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
      });
      
      it('Should properly fetch multiple components in sync', function(done){
        
        __KaleoExtensions__.components = {};
        
        solone.config().env = 'dev';
        solone.config().debug = undefined;
        
        solone('a')
        .then(function(){
          return solone('b');
        })
        .then(function(a, b){
          var sa = document.querySelector('script[title="a"][env="dev"]'),
              sb = document.querySelector('script[title="b"][env="dev"]');
          
          expect(a).to.equal(__KaleoExtensions__.components.a);
          expect(b).to.equal(__KaleoExtensions__.components.b);
          expect(sa).to.not.equal(null);
          expect(sb).to.not.equal(null);
          
          sa.parentElement.removeChild(sa);
          sb.parentElement.removeChild(sb);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
      });
      
      it('Should properly fetch multiple components in async', function(done){
        
        __KaleoExtensions__.components = {};
        
        solone.config().env = 'dev';
        solone.config().debug = undefined;
        
        Promise.all([
          solone('a'),
          solone('b')
        ])
        .then(function(a, b){
          var sa = document.querySelector('script[title="a"][env="dev"]'),
              sb = document.querySelector('script[title="b"][env="dev"]');
          
          expect(a).to.equal(__KaleoExtensions__.components.a);
          expect(b).to.equal(__KaleoExtensions__.components.b);
          expect(sa).to.not.equal(null);
          expect(sb).to.not.equal(null);
          
          sa.parentElement.removeChild(sa);
          sb.parentElement.removeChild(sb);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
      });
      
      it('Should properly run authentication for components', function(done){
        var cb = spy();
        
        __KaleoExtensions__.components = {};
        
        solone.config().env = 'dev';
        solone.config().debug = undefined;
        solone.auth(function(info, resolve, reject){
          if(info.component === 'a') return resolve();
          return reject();
        })
        .setAuthFailListener(cb);
        
        Promise.all([
          solone('a'),
          solone('b')
        ])
        .then(cb)
        .then(function(a){
          expect(a).to.equal(__KaleoExtensions__.components.a);
          expect(cb.callCount).to.equal(2);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        });
      });
      
    });
    
    describe("Fetching from the backend", function(){
      
      __KaleoExtensions__.components = {};
      
      it('Should properly fetch a dev environment component', function(done){
        __KaleoExtensions__.components = {};
        solone.useBackend = true;
        solone.config().env = 'dev';
        solone.config().debug = undefined;
        
        solone.auth(function(info, resolve){ return resolve(); })
        
        solone('a')
        .then(function(){
          var s = document.querySelector('script[title="a"][env="dev"]');
          
          expect(__KaleoExtensions__.components.a).to.not.equal(undefined);
          expect(__KaleoExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
          expect(__KaleoExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
          expect(s).to.not.equal(null);
          
          s.parentElement.removeChild(s);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
        
      });
      
      it('Should properly fetch a prod environment component', function(done){
        
        __KaleoExtensions__.components = {};
        
        solone.config().env = 'prod';
        
        solone('a')
        .then(function(){
          var s = document.querySelector('script[title="a"][env="prod"]');
          
          expect(__KaleoExtensions__.components.a).to.not.equal(undefined);
          expect(__KaleoExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
          expect(__KaleoExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
          expect(s).to.not.equal(null);
          
          s.parentElement.removeChild(s);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
      });
      
      it('Should properly fetch a debug component from a minified environment', function(done){
        
        __KaleoExtensions__.components = {};
        
        solone.config().env = 'prod';
        solone.config().debug = true;
        
        solone('a')
        .then(function(){
          var s = document.querySelector('script[title="a"][env="prod"][debug="true"]');
          
          expect(__KaleoExtensions__.components.a).to.not.equal(undefined);
          expect(__KaleoExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
          expect(__KaleoExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
          expect(s).to.not.equal(null);
          
          s.parentElement.removeChild(s);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
      });
      
      it('Should properly fetch multiple components in sync', function(done){
        
        __KaleoExtensions__.components = {};
        
        solone.config().env = 'dev';
        solone.config().debug = undefined;
        
        solone('a')
        .then(function(){
          return solone('b');
        })
        .then(function(a, b){
          var sa = document.querySelector('script[title="a"][env="dev"]'),
              sb = document.querySelector('script[title="b"][env="dev"]');
          
          expect(a).to.equal(__KaleoExtensions__.components.a);
          expect(b).to.equal(__KaleoExtensions__.components.b);
          expect(sa).to.not.equal(null);
          expect(sb).to.not.equal(null);
          
          sa.parentElement.removeChild(sa);
          sb.parentElement.removeChild(sb);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
      });
      
      it('Should properly fetch multiple components in async', function(done){
        
        __KaleoExtensions__.components = {};
        
        solone.config().env = 'dev';
        solone.config().debug = undefined;
        
        Promise.all([
          solone('a'),
          solone('b')
        ])
        .then(function(a, b){
          var sa = document.querySelector('script[title="a"][env="dev"]'),
              sb = document.querySelector('script[title="b"][env="dev"]');
          
          expect(a).to.equal(__KaleoExtensions__.components.a);
          expect(b).to.equal(__KaleoExtensions__.components.b);
          expect(sa).to.not.equal(null);
          expect(sb).to.not.equal(null);
          
          sa.parentElement.removeChild(sa);
          sb.parentElement.removeChild(sb);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
      });
    });
  })
  
  if(!window.solone)
  {
    setTimeout(function(){
      solone.prefix('/test/tests');
      mocha.run();
    }, 100);
  }
  else
  {
    solone.prefix('/test/tests');
    mocha.run();
  }
  
}(describe,it,chai.expect,sinon.spy));