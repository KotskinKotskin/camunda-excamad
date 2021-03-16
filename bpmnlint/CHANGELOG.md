# Changelog

All notable changes to [bpmnlint](https://github.com/bpmn-io/bpmnlint) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 6.4.0

* `FEAT`: add `superfluous-gateway` check ([#42](https://github.com/bpmn-io/bpmnlint/pull/42/files))

## 6.3.0

* `FEAT`: support rules and configuration provided by scoped packages ([#35](https://github.com/bpmn-io/bpmnlint/issues/35))
* `CHORE`: improve `Node >= 12.20` compatibility ([#37](https://github.com/bpmn-io/bpmnlint/pull/37))

## 6.2.0

* `DOCS`: document existing rules ([#14](https://github.com/bpmn-io/bpmnlint/issues/14))

## 6.1.2

* `FIX`: exclude event-based sub-processes from `no-disconnected` check ([#31](https://github.com/bpmn-io/bpmnlint/issues/31))

## 6.1.1

* `FEAT`: allow tool to be used with `Node >= 8`

## 6.1.0

* `FEAT`: resolve local rules in plug-ins without prefix ([`640e411a`](https://github.com/bpmn-io/bpmnlint/commit/640e411ac8c6045198bd09b79b5c53c6e29e251c))

## 6.0.0

* `FEAT`: resolve plug-in provided rules/configuration local to working directory ([`f1bf331f`](https://github.com/bpmn-io/bpmnlint/commit/f1bf331f4bcece62de16da34bb3f8fda08182fbc))
* `CHORE`: improve errors on rule/plugin resolution failures
* `CHORE`: require `>= node@10.12`

## 5.3.0

* `FEAT`: add `--init` option to create `.bpmnlintrc` in current working directory

## 5.2.0

* `FEAT`: provide help on missing `.bpmnlintrc`

## 5.1.2

* `DOCS`: add package description

## 5.1.1

* `CHORE`: exclude additional development assets from distribution

## 5.1.0

* `FEAT`: add `no-duplicate-sequence-flows` rule ([#22](https://github.com/bpmn-io/bpmnlint/issues/22))
* `FEAT`: catch more BPMN parse errors
* `FEAT`: be able to define multiple expected test results in `RuleTester`
* `FIX`: make `nyc` a development dependency
* `CHORE`: update to `bpmn-moddle@6`

## 5.0.0

* `FEAT`: don't expose utils to rules; use `bpmnlint-utils` instead

## 4.1.0

* `FEAT`: handle and report diagram import errors and warnings via CLI
* `FEAT`: properly handle generic moddle elements during rule checking
* `FEAT`: report rule execution errors

## 4.0.0

* `FEAT`: add ability to batch lint multiple files via CLI
* `FEAT`: don't resolve disabled rules ([`6c45f3f9`](https://github.com/bpmn-io/bpmnlint/commit/6c45f3f952a412dda05deb5c57861a1c76af23bb))
* `CHORE`: unify messages of built-in rules
* `CHORE`: adopt cli output to eslint styling

## 3.3.1

* `FIX`: handle empty flow element containers in rules

## 3.3.0

* `FEAT`: do not expose disabled rules when bundling `.bpmnlintrc`

## 3.2.1

* `DOCS`: fix readme code snippet

## 3.2.0

* `FEAT`: add ability to pass linter configuration via constructor

## 3.1.0

* `FEAT`: add support script to compile `.bpmnlintrc` files to JavaScript ([`cf53a389`](https://github.com/bpmn-io/bpmnlint/commit/cf53a3894b6bd821e18ddfc7bdaa8da857356a37))

## 3.0.0

#### Breaking Changes

* `FEAT`: treat unprefixed rules as built-in ones

## 2.0.0

#### Breaking Changes

* `CHORE`: make `NodeResolver` a constructor
* `CHORE`: unify file names to `dashed-case`
* `CHORE`: rework `Resolver` APIs

#### Other Enhancements

* `FEAT`: add `StaticResolver` to load cached resources
* `FEAT`: add `{ Linter }` as a library export
* `CHORE`: move rule and config name resolution to linter
* `CHORE`: catch all cli errors and exit accordingly

## 1.0.0

* `FEAT`: add numerous new rules ([#5](https://github.com/bpmn-io/bpmnlint/issues/5))
* `FEAT`: add `bpmnlint:all` configuration
* `FEAT`: improve `label-required` rule ([#11](https://github.com/bpmn-io/bpmnlint/issues/11))
* `FEAT`: group lint results by rule names
* `FEAT`: exit cli with code=1 on lint errors
* `FEAT`: add `isAny(node, [ ... types ])` method to `utils`
* `CHORE`: improve / test cover existing rules
* `CHORE`: include new rules in `bpmnlint:recommended` configuration

## 1.0.0-alpha6

* `DOCS`: documentation simplification / improvements

## 1.0.0-alpha5

_Initial stable release._

* `FEAT`: configure, resolve and execute local and external rules
* `FEAT`: extend external configuration via `extends`
* `FEAT`: make rule and configuration resolution async
* `FEAT`: provide `bpmnlint:recommended` configuration
* `CHORE`: `linter` is now a constructor, offering a `#lint(moddleElement, config)` method
* `CHORE`: moved library to [bpmn-io/bpmnlint](https://github.com/bpmn-io/bpmnlint)
* `CHORE`: full rewrite of internals
* `CHORE`: `utils` API change

## ...

Check `git log` for earlier history.
