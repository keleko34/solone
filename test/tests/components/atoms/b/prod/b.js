function b()
{
  this.test = 500;
}

b.prototype.__extensionsHTML__ = '<input />';
b.prototype.__extensionsCSS__ = '.b {color: blue;}';