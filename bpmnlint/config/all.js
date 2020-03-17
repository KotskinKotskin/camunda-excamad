const allRules = [
  'conditional-flows',
  'end-event-required',
  'event-sub-process-typed-start-event',
  'fake-join',
  'label-required',
  'no-complex-gateway',
  'no-disconnected',
  'no-duplicate-sequence-flows',
  'no-gateway-join-fork',
  'no-implicit-split',
  'no-inclusive-gateway',
  'single-blank-start-event',
  'single-event-definition',
  'start-event-required',
  'sub-process-blank-start-event',
  'superfluous-gateway'
];


module.exports = {
  rules: allRules.reduce(function(rules, ruleName) {
    rules[ruleName] = 'error';

    return rules;
  }, {})
};