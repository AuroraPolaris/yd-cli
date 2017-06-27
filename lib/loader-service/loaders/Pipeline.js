const { EventEmitter } = require('events');


const log = function (text) {
  console.log(text);
}

var File = function (opt = {}) {
  for (var key in opt) {
    this[key] = opt[key];
  }
}

var PipeLine = function (name = '', options = {}) {
  this.name = name;
  EventEmitter.call(this)
  this.options = options;
  this.transforms = [];
}
PipeLine.File = File;
PipeLine.prototype = new EventEmitter();

PipeLine.prototype.add = function (name, transform) {
  if (arguments.length === 1) {
    transform = name;
  } else {
    transform.$name = name;
  }
  this.transforms.push(transform);
  return this;
}

PipeLine.prototype.write = function (file) {
  return new Promise( (resolve, reject)=> {
    var trs = this.transforms;
    var self = this;
    var done = function (_file) {
      file = _file;
      self.emit('done', file)
      resolve(file);
    }
    var next = function (index = 0) {
      var tr = trs[index];
      if (!tr) {
        return done(file);
      }
      try{
        const startTime = Date.now();
        const taskName = tr.$name;
        tr(file, function (_file) {
          if (self.options.debug) {
            const text = `[Pipeline-${self.name}, Task-${taskName || index}]duration: ${Date.now() - startTime}`;
            log(text)
          }
          file = _file
          next(index + 1)
        }, done);
      } catch (err) {
        self.emit('error', err);
        done(file);
      }
    }
    process.nextTick(next);
  })
}

/*
const p = new PipeLine();
p.add(function (file, content, next) {
  console.log('1', file, content)
  next(file + 'a', content);
})
p.add(function (file, content, next) {
  console.log('2', file, content)
  next(file + 'a', content);
})
p.add(function (file, content, next) {
  console.log('3', file, content)
  next(file + 'b', content);
})
p.on('done', function (file, content) {
  console.log('done', file, content);
})
p.write('a', 'b')
*/

module.exports = PipeLine;
