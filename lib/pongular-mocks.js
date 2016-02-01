'use strict';
/*global require: false, exports: false, global: false, beforeEach: false, afterEach: false, setup: false, teardown: false  */

var pongular = require('./pongular').pongular,
    utils = require('./utils');

var currentSpec = null,
    isSpecRunning = function() {
      return !!currentSpec;
    };

(beforeEach || setup)(function() {
  currentSpec = this;
});

(afterEach || teardown)(function() {
  var injector = currentSpec.$injector;

  utils.forEach(currentSpec.$modules, function(module) {
    if (module && module.$$hashKey) {
      module.$$hashKey = undefined;
    }
  });

  currentSpec.$injector = null;
  currentSpec.$modules = null;
  currentSpec = null;
});

/**
   * @ngdoc function
   * @name pongular.mock.module
   * @description
   *
   * This function registers a module configuration code. It collects the configuration information
   * which will be used when the injector is created by {@link pongular.mock.inject inject}.
   *
   * See {@link pongular.mock.inject inject} for usage example
   *
   * @param {...(string|Function|Object)} fns any number of modules which are represented as string
   * aliases or as anonymous module initialization functions. The modules are used to
   * configure the injector. The 'ng' and 'ngMock' modules are automatically loaded. If an
   * object literal is passed they will be register as values in the module, the key being
   * the module name and the value being what is returned.
   */
exports.module = function() {
  var moduleFns = Array.prototype.slice.call(arguments, 0);
  return isSpecRunning() ? workFn() : workFn;
  /////////////////////
  function workFn() {

    if (currentSpec.$injector) {
      throw new Error('Injector already created, can not register a module!');
    } else {
      var modules = currentSpec.$modules || (currentSpec.$modules = []);
      utils.forEach(moduleFns, function(module) {
        if (utils.isObject(module) && !utils.isArray(module)) {
          modules.push(function($provide) {
            utils.forEach(module, function(value, key) {
              $provide.value(key, value);
            });
          });
        } else {
          modules.push(module);
        }
      });
    }
  }
};

/**
   * @ngdoc function
   * @name pongular.mock.inject
   * @description
   *
   * *NOTE*: This function is also published on global for easy access.<br>
   *
   * The inject function wraps a function into an injectable function. The inject() creates new
   * instance of {@link AUTO.$injector $injector} per test, which is then used for
   * resolving references.
   *
   *
   * ## Resolving References (Underscore Wrapping)
   * Often, we would like to inject a reference once, in a `beforeEach()` block and reuse this
   * in multiple `it()` clauses. To be able to do this we must assign the reference to a variable
   * that is declared in the scope of the `describe()` block. Since we would, most likely, want
   * the variable to have the same name of the reference we have a problem, since the parameter
   * to the `inject()` function would hide the outer variable.
   *
   * To help with this, the injected parameters can, optionally, be enclosed with underscores.
   * These are ignored by the injector when the reference name is resolved.
   *
   * For example, the parameter `_myService_` would be resolved as the reference `myService`.
   * Since it is available in the function body as _myService_, we can then assign it to a variable
   * defined in an outer scope.
   *
   * ```
   * // Defined out reference variable outside
   * var myService;
   *
   * // Wrap the parameter in underscores
   * beforeEach( inject( function(_myService_){
   * myService = _myService_;
   * }));
   *
   * // Use myService in a series of tests.
   * it('makes use of myService', function() {
   * myService.doStuff();
   * });
   *
   * ```
   *
   * See also {@link pongular.mock.module pongular.mock.module}
   *
   * ## Example
   * Example of what a typical jasmine tests looks like with the inject method.
   * <pre>
   *
   * pongular.module('myApplicationModule', [])
   * .value('mode', 'app')
   * .value('version', 'v1.0.1');
   *
   *
   * describe('MyApp', function() {
   *
   * // You need to load modules that you want to test,
   * // it loads only the "ng" module by default.
   * beforeEach(module('myApplicationModule'));
   *
   *
   * // inject() is used to inject arguments of all given functions
   * it('should provide a version', inject(function(mode, version) {
   * expect(version).toEqual('v1.0.1');
   * expect(mode).toEqual('app');
   * }));
   *
   *
   * // The inject and module method can also be used inside of the it or beforeEach
   * it('should override a version and test the new version is injected', function() {
   * // module() takes functions or strings (module aliases)
   * module(function($provide) {
   * $provide.value('version', 'overridden'); // override version here
   * });
   *
   * inject(function(version) {
   * expect(version).toEqual('overridden');
   * });
   * });
   * });
   *
   * </pre>
   *
   * @param {...Function} fns any number of functions which will be injected using the injector.
   */
exports.inject = function() {
  var blockFns = Array.prototype.slice.call(arguments, 0);
  var errorForStack = new Error('Declaration Location');
  return isSpecRunning() ? workFn() : workFn;
  /////////////////////
  function workFn() {
    var results = [], result;
    var modules = currentSpec.$modules || [];

    var injector = currentSpec.$injector;
    if (!injector) {
      injector = currentSpec.$injector = pongular.injector(modules);
    }
    for(var i = 0, ii = blockFns.length; i < ii; i++) {
      try {
        /* jshint -W040 *//* Jasmine explicitly provides a `this` object when calling functions */
        result = injector.invoke(blockFns[i] || pongular.noop, this);
        results.push(result);
        /* jshint +W040 */
      } catch (e) {
        results.push(e);
        if(e.stack && errorForStack) e.stack += '\n' + errorForStack.stack;
        throw e;
      } finally {
        errorForStack = null;
      }
    }

    return blockFns.length === 1 ? results[0] : result;
  }
};
