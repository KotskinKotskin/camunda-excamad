const traverse = require('./traverse');

class Reporter {
  constructor({ moddleRoot, rule }) {
    this.rule = rule;
    this.moddleRoot = moddleRoot;
    this.messages = [];
    this.report = this.report.bind(this);
  }

  report(id, message) {
    this.messages.push({ id, message });
  }
}

module.exports = function testRule({ moddleRoot, rule }) {
  const reporter = new Reporter({ rule, moddleRoot });
  traverse(moddleRoot, node => rule.check(node, reporter));
  return reporter.messages;
};
