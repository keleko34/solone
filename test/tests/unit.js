mocha.setup('bdd');

(function(describe,it,expect,spy) {
  var componentA = null,
      componentB = null;

  /* mocha tests */
  describe("Component Fetching:", function() {
    
    describe("Fetching from the frontend (No Design Pattern)", function() {
      it("Should properly fetch a dev environment component", function(done) {
        solone.useDesignPatterns = false;
        solone('a')
          .then(function(){
            componentA = document.querySelector('script[title="a"][env="dev"]');
            
            expect(__KaleoiExtensions__.components.a).to.not.equal(undefined);
            expect(__KaleoiExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
            expect(__KaleoiExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
            expect(componentA).to.not.equal(null);
            done();
          })
          .catch(function(){
            expect(true).to.equal(false);
            done();
          })
      });

      it('Should properly fetch a prod environment component', function(done) {
        solone.useDesignPatterns = false;
        solone.env = 'prod';
        solone('a')
          .then(function() {
            componentA = document.querySelector('script[title="a"][env="prod"]')
            
            expect(__KaleoiExtensions__.components.a).to.not.equal(undefined);
            expect(__KaleoiExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
            expect(__KaleoiExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
            expect(componentA).to.not.equal(null);
            done();
          })
          .catch(function(){
            expect(true).to.equal(false);
            done();
          });
      });

      it('Should properly fetch a debug component from a minified environment', function(done) {
        solone.useDesignPatterns = false;
        solone.env = 'prod';
        solone.debug = true;

        solone('a')
          .then(function(){
            componentA = document.querySelector('script[title="a"][env="prod"][debug="true"]');
            
            expect(__KaleoiExtensions__.components.a).to.not.equal(undefined);
            expect(__KaleoiExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
            expect(__KaleoiExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
            expect(componentA).to.not.equal(null);
            done();
          })
          .catch(function(){
            expect(true).to.equal(false);
            done();
          });
      });

      it('Should properly fetch multiple components in sync', function(done) {
        solone.useDesignPatterns = false;
        solone('a')
          .then(function(a) {
            return solone('b')
              .then(function(b) {
                componentA = document.querySelector('script[title="a"][env="dev"]');
                componentB = document.querySelector('script[title="b"][env="dev"]');
                
                expect(a).to.equal(__KaleoiExtensions__.components.a);
                expect(b).to.equal(__KaleoiExtensions__.components.b);
                expect(componentA).to.not.equal(null);
                expect(componentB).to.not.equal(null);
                done();
              })
              .catch(function() {
                expect(true).to.equal(false);
                done();
              })
            });
      });

      it('Should properly fetch multiple components in async', function(done) {
        solone.useDesignPatterns = false;
        Promise.all([
          solone('a'),
          solone('b')
        ])
        .then(function(components) {
          componentA = document.querySelector('script[title="a"][env="dev"]');
          componentB = document.querySelector('script[title="b"][env="dev"]');
          
          expect(components[0]).to.equal(__KaleoiExtensions__.components.a);
          expect(components[1]).to.equal(__KaleoiExtensions__.components.b);
          expect(componentA).to.not.equal(null);
          expect(componentB).to.not.equal(null);
          done();
        })
        .catch(function() {
          expect(true).to.equal(false);
          done();
        })
      });

      it('Should properly run authentication for components', function(done) {
        solone.useDesignPatterns = false;
        var cb = spy();

        solone.authentication = function(info) { 
          return (new Promise(function(resolve, reject) {
            if(info.component === 'a') return resolve();
            return reject();
          }))
          .catch(cb);
        }

        Promise.all([
          solone('a'),
          solone('b')
        ])
        .then(function(components) {
          expect(components[0]).to.equal(__KaleoiExtensions__.components.a);
          expect(cb.callCount).to.equal(1);
          done();
        })
        .catch(function() {
          expect(true).to.equal(false);
          done();
        });
      });
    });

    describe("Fetching from the frontend (Design Pattern)", function() {
      it("Should properly fetch a dev environment component", function(done) {
        solone.useDesignPatterns = true;
        solone('atoms--a')
          .then(function(){
            componentA = document.querySelector('script[title="a"][env="dev"]');
            
            expect(__KaleoiExtensions__.components.a).to.not.equal(undefined);
            expect(__KaleoiExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
            expect(__KaleoiExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
            expect(componentA).to.not.equal(null);
            done();
          })
          .catch(function(){
            expect(true).to.equal(false);
            done();
          })
      });

      it('Should properly fetch a prod environment component', function(done) {
        solone.useDesignPatterns = true;
        solone.env = 'prod';
        solone('atoms--a')
          .then(function() {
            componentA = document.querySelector('script[title="a"][env="prod"]')
            
            expect(__KaleoiExtensions__.components.a).to.not.equal(undefined);
            expect(__KaleoiExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
            expect(__KaleoiExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
            expect(componentA).to.not.equal(null);
            done();
          })
          .catch(function(){
            expect(true).to.equal(false);
            done();
          });
      });

      it('Should properly fetch a debug component from a minified environment', function(done) {
        solone.useDesignPatterns = true;
        solone.env = 'prod';
        solone.debug = true;

        solone('atoms--a')
          .then(function(){
            componentA = document.querySelector('script[title="a"][env="prod"][debug="true"]');
            
            expect(__KaleoiExtensions__.components.a).to.not.equal(undefined);
            expect(__KaleoiExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
            expect(__KaleoiExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
            expect(componentA).to.not.equal(null);
            done();
          })
          .catch(function(){
            expect(true).to.equal(false);
            done();
          });
      });

      it('Should properly fetch multiple components in sync', function(done) {
        solone.useDesignPatterns = true;
        solone('atoms--a')
          .then(function(a) {
            return solone('b')
              .then(function(b) {
                componentA = document.querySelector('script[title="a"][env="dev"]');
                componentB = document.querySelector('script[title="b"][env="dev"]');
                
                expect(a).to.equal(__KaleoiExtensions__.components.a);
                expect(b).to.equal(__KaleoiExtensions__.components.b);
                expect(componentA).to.not.equal(null);
                expect(componentB).to.not.equal(null);
                done();
              })
              .catch(function() {
                expect(true).to.equal(false);
                done();
              })
            });
      });

      it('Should properly fetch multiple components in async', function(done) {
        solone.useDesignPatterns = true;
        Promise.all([
          solone('atoms--a'),
          solone('atoms--b')
        ])
        .then(function(components) {
          componentA = document.querySelector('script[title="a"][env="dev"]');
          componentB = document.querySelector('script[title="b"][env="dev"]');
          
          expect(components[0]).to.equal(__KaleoiExtensions__.components.a);
          expect(components[1]).to.equal(__KaleoiExtensions__.components.b);
          expect(componentA).to.not.equal(null);
          expect(componentB).to.not.equal(null);
          done();
        })
        .catch(function() {
          expect(true).to.equal(false);
          done();
        })
      });

      it('Should properly run authentication for components', function(done) {
        solone.useDesignPatterns = true;
        var cb = spy();

        solone.authentication = function(info) { 
          return (new Promise(function(resolve, reject) {
            if(info.component === 'a') return resolve();
            return reject();
          }))
          .catch(cb);
        }

        Promise.all([
          solone('atoms--a'),
          solone('atoms--b')
        ])
        .then(function(components) {
          expect(components[0]).to.equal(__KaleoiExtensions__.components.a);
          expect(cb.callCount).to.equal(1);
          done();
        })
        .catch(function() {
          expect(true).to.equal(false);
          done();
        });
      });
    });
    
    describe("Fetching from the backend (No Design Pattern)", function() {
      
      it('Should properly fetch a dev environment component', function(done) {
        solone.backendRouting = true;
        solone.useDesignPatterns = false;

        solone('a')
        .then(function(){
          componentA = document.querySelector('script[title="a"][env="dev"]');
          
          expect(__KaleoiExtensions__.components.a).to.not.equal(undefined);
          expect(__KaleoiExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
          expect(__KaleoiExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
          expect(componentA).to.not.equal(null);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
        
      });
      
      it('Should properly fetch a prod environment component', function(done) {
        solone.backendRouting = true;
        solone.useDesignPatterns = false;
        solone.env = 'prod';
        
        solone('a')
        .then(function(){
          componentA = document.querySelector('script[title="a"][env="prod"]');
          
          expect(__KaleoiExtensions__.components.a).to.not.equal(undefined);
          expect(__KaleoiExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
          expect(__KaleoiExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
          expect(componentA).to.not.equal(null);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
      });
      
      it('Should properly fetch a debug component from a minified environment', function(done) {
        solone.backendRouting = true;
        solone.useDesignPatterns = false;
        solone.env = 'prod';
        solone.debug = true;
        
        solone('a')
        .then(function(){
          componentA = document.querySelector('script[title="a"][env="prod"][debug="true"]');
          
          expect(__KaleoiExtensions__.components.a).to.not.equal(undefined);
          expect(__KaleoiExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
          expect(__KaleoiExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
          expect(componentA).to.not.equal(null);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
      });
      
      it('Should properly fetch multiple components in sync', function(done) {
        solone.backendRouting = true;
        solone.useDesignPatterns = false;

        solone('a')
          .then(function(a){
            return solone('b')
              .then(function(b){
                componentA = document.querySelector('script[title="a"][env="dev"]');
                componentB = document.querySelector('script[title="b"][env="dev"]');
                
                expect(a).to.equal(__KaleoiExtensions__.components.a);
                expect(b).to.equal(__KaleoiExtensions__.components.b);
                expect(componentA).to.not.equal(null);
                expect(componentB).to.not.equal(null);
                done();
              })
              .catch(function(){
                expect(true).to.equal(false);
                done();
              })
          })
      });
      
      it('Should properly fetch multiple components in async', function(done){
        solone.backendRouting = true;
        solone.useDesignPatterns = false;
        
        Promise.all([
          solone('a'),
          solone('b')
        ])
        .then(function(components){
          componentA = document.querySelector('script[title="a"][env="dev"]');
          componentB = document.querySelector('script[title="b"][env="dev"]');
          
          expect(components[0]).to.equal(__KaleoiExtensions__.components.a);
          expect(components[1]).to.equal(__KaleoiExtensions__.components.b);
          expect(componentA).to.not.equal(null);
          expect(componentB).to.not.equal(null);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
      });
    });

    describe("Fetching from the backend (Design Pattern)", function() {
      it('Should properly fetch a dev environment component', function(done) {
        solone.backendRouting = true;
        solone.useDesignPatterns = true;

        solone('a')
        .then(function(){
          componentA = document.querySelector('script[title="a"][env="dev"]');
          
          expect(__KaleoiExtensions__.components.a).to.not.equal(undefined);
          expect(__KaleoiExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
          expect(__KaleoiExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
          expect(componentA).to.not.equal(null);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
        
      });
      
      it('Should properly fetch a prod environment component', function(done) {
        solone.backendRouting = true;
        solone.useDesignPatterns = true;
        solone.env = 'prod';
        
        solone('a')
        .then(function(){
          componentA = document.querySelector('script[title="a"][env="prod"]');
          
          expect(__KaleoiExtensions__.components.a).to.not.equal(undefined);
          expect(__KaleoiExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
          expect(__KaleoiExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
          expect(componentA).to.not.equal(null);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
      });
      
      it('Should properly fetch a debug component from a minified environment', function(done) {
        solone.backendRouting = true;
        solone.useDesignPatterns = true;
        solone.env = 'prod';
        solone.debug = true;
        
        solone('a')
        .then(function(){
          componentA = document.querySelector('script[title="a"][env="prod"][debug="true"]');
          
          expect(__KaleoiExtensions__.components.a).to.not.equal(undefined);
          expect(__KaleoiExtensions__.components.a.prototype.__extensionsCSS__).to.not.equal(undefined);
          expect(__KaleoiExtensions__.components.a.prototype.__extensionsHTML__).to.not.equal(undefined);
          expect(componentA).to.not.equal(null);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
      });
      
      it('Should properly fetch multiple components in sync', function(done) {
        solone.backendRouting = true;
        solone.useDesignPatterns = true;

        solone('a')
          .then(function(a){
            return solone('b')
              .then(function(b){
                componentA = document.querySelector('script[title="a"][env="dev"]');
                componentB = document.querySelector('script[title="b"][env="dev"]');
                
                expect(a).to.equal(__KaleoiExtensions__.components.a);
                expect(b).to.equal(__KaleoiExtensions__.components.b);
                expect(componentA).to.not.equal(null);
                expect(componentB).to.not.equal(null);
                done();
              })
              .catch(function(){
                expect(true).to.equal(false);
                done();
              })
          })
      });
      
      it('Should properly fetch multiple components in async', function(done){
        solone.backendRouting = true;
        solone.useDesignPatterns = true;
        
        Promise.all([
          solone('a'),
          solone('b')
        ])
        .then(function(components){
          componentA = document.querySelector('script[title="a"][env="dev"]');
          componentB = document.querySelector('script[title="b"][env="dev"]');
          
          expect(components[0]).to.equal(__KaleoiExtensions__.components.a);
          expect(components[1]).to.equal(__KaleoiExtensions__.components.b);
          expect(componentA).to.not.equal(null);
          expect(componentB).to.not.equal(null);
          done();
        })
        .catch(function(){
          expect(true).to.equal(false);
          done();
        })
      });
    });
  })
  
  beforeEach(function() {
    __KaleoiExtensions__.components = {};
    solone.prefix = '/test/tests';
    solone.env = 'dev';
    solone.debug = undefined;
    solone.authentication = function() { return Promise.resolve(); };
    if(componentA && componentA.parentElement) componentA.parentElement.removeChild(componentA);
    if(componentB && componentB.parentElement) componentB.parentElement.removeChild(componentB);
  })
  
  solone.init(function(){
    mocha.run();
  });

}(describe,it,chai.expect,sinon.spy));