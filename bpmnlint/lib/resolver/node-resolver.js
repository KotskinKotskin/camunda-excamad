const Module = require('module');
const path = require('path');

/**
 * A resolver that locates rules and configurations
 * using node module resolution.
 */
function NodeResolver(options) {
  this.require = options && options.require || createScopedRequire(process.cwd());

  this.requireLocal = options && options.requireLocal || require;
}

module.exports = NodeResolver;


NodeResolver.prototype.resolveRule = function(pkg, ruleName) {

  try {
    if (pkg === 'bpmnlint') {
      return this.requireLocal(`../../rules/${ruleName}`);
    } else {
      return this.require(`${pkg}/rules/${ruleName}`);
    }
  } catch (err) {
    throw new Error('Cannot resolve rule <' + ruleName + '> from <' + pkg + '>');
  }
};

NodeResolver.prototype.resolveConfig = function(pkg, configName) {

  // resolve config via $PKG/config/$NAME
  try {
    if (pkg === 'bpmnlint') {
      return this.requireLocal(`../../config/${configName}`);
    } else {
      return this.require(`${pkg}/config/${configName}`);
    }
  } catch (err) { /* ignore */ }

  // resolve config via $PKG.configs[$NAME]
  try {
    const instance = this.require(pkg);

    const configs = instance.configs || {};

    if (configName in configs) {
      return configs[configName];
    }
  } catch (err) {
    /* ignore */
  }

  throw new Error(
    'Cannot resolve config <' + configName + '> from <' + pkg + '>'
  );
};


// helpers ////////////////////

function createScopedRequire(cwd) {

  // shim createRequireFromPath for Node < 10.12
  // shim createRequireFromPath for Node < 12.2.0
  const createRequireFromPath = Module.createRequire || Module.createRequireFromPath || (filename => {
    const mod = new Module(filename, null);

    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));
    mod._compile('module.exports = require;', filename);

    return mod.exports;
  });

  return createRequireFromPath(path.join(cwd, '__placeholder__.js'));
}