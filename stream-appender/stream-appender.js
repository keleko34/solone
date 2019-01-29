module.exports = (function() {
    var stream = require('stream'),
        util = require('util');

    return function () {
        function Stream_Appender(prepend, append) {
            var Transform = stream.Transform;
            function inject(options) {
                Transform.call(this, options);
            }
            util.inherits(inject, Transform);
            inject.prototype._transform = function(chunk, enc, cb) {
                this.push((typeof prepend === 'function' ? prepend(chunk.toString()) : chunk.toString()));
                cb();
            }
            inject.prototype._flush = function(cb) {
                if (typeof append === 'function') this.push(append());
                cb();
            }
            return new inject({});
        }
      
        Stream_Appender.append = function(str) {
            return Stream_Appender(null, function() {
                return str;
            });
        }
        
        Stream_Appender.prepend = function(str, alter) {
            var start = false;
            return Stream_Appender(function(chunk) {
                if (!start) {
                    chunk = str + (typeof alter === 'function' ? alter(chunk) : chunk);
                    start = true;
                }
                return chunk;
            });
        }
        
        Stream_Appender.preappend = function(pre, ap, alter) {
            var start = false;
            return Stream_Appender(function(chunk) {
                if (!start) {
                    chunk = pre + (typeof alter === 'function' ? alter(chunk) : chunk);
                    start = true;
                }
                return chunk;
            }, function() {
                return ap;
            });
        }
        
        return Stream_Appender;
    }
}());
