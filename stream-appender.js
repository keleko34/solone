/* TODO: streams not flushing per stream data due to passthrough only ending on the last stream */
const { Transform, PassThrough, Readable } = require('stream');

class StreamAppender extends Transform {
    constructor(prepend, append, alter) {
        super();
        this._start = true;
        this._alter = (alter || ((chunk) => chunk));
        this._append = append || '';
        this._prepend = prepend || '';
    }

    _transform(chunk, encoding, done) {
        this.push((this._start ? this._prepend : '') + this._alter(chunk.toString()));
        this._start = false;
        return done();
    }

    _flush(done) {
        return done(null, this._append);
    }
}

class Combiner extends Transform {
    constructor(passthrough, streams, index) {
        super();
        this._passthrough = passthrough;
        this._streams = streams;
        this._index = index;
        this._len = streams.length;
    }

    _transform(chunk, encoding, done) {
        this._passthrough.push(chunk);
        return done();
    }

    _flush(done) {
        const next = (this._index + 1);
        if(next === this._len) {
            this._passthrough.end()
            return done();
        }
        this._streams[next].pipe(new Combiner(this._passthrough, this._streams, next));
        return done();
    }
}

function append(str) {
    return new StreamAppender(null, str, null);
}

function prepend(str, alter) {
    return new StreamAppender(str, null, alter);
}

function preappend(prepend, append, alter) {
    return new StreamAppender(prepend, append, alter);
}

function combine(streams) {
    return streams[0]
        .pipe(new Combiner(new PassThrough(), streams, 0))._passthrough;
}

module.exports = { append, prepend, preappend, combine }
