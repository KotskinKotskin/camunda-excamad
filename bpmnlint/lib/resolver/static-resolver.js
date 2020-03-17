function StaticResolver(cache) {
  this.cache = cache;
}

module.exports = StaticResolver;


StaticResolver.prototype.resolveRule = function(pkg, ruleName) {
  return this.resolve('rule', pkg, ruleName);
};

StaticResolver.prototype.resolveConfig = function(pkg, configName) {
  return this.resolve('config', pkg, configName);
};

StaticResolver.prototype.resolve = function(type, pkg, name) {
  const id = `${pkg}/${name}`;

  const resolved = this.cache[`${type}:${id}`];

  if (!resolved) {
    throw new Error(`unknown ${type} <${id}>`);
  }

  return resolved;
};