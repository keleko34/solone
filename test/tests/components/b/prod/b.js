function b()
{
  this.test = 500;
  this.type = 'no design pattern';
}

b.prototype.__extensionsHTML__ = '<input value="no design pattern" />';
b.prototype.__extensionsCSS__ = '.b {color: blue;} .b__nodesignpattern { }';