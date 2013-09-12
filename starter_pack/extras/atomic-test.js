/*
Atomic
Copyright 2013 LinkedIn

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.   See the License for the specific language
governing permissions and limitations under the License.
*/

/*
ATOMIC TESTING HARNESS
======================
This file creates an Atomic.Test namespace, which provides assistance in testing
Atomic Components. Most notably:

* You can create "fake" components with Atomic.Test.fakeComponent()
* You can set global dependencies like jQuery with Atomic.Test.define()
* Atomic.pack and Atomic.load use an internal loading system to allow for
  dependency injection
*/

Atomic.version = 'TEST-' + Atomic.version;
Atomic.Test = {};
Atomic.Test.__components = {};
Atomic.Test.__defines = {};
Atomic.Test.methods = {};
Atomic.Test.methods.pack = Atomic.pack;
Atomic.Test.methods.Component = Atomic.Component;
Atomic.Test.methods.load = Atomic.load;

/**
 * resets the environment, making all dependencies invalid again
 * useful in an after() or cleanup() type method within your unit test
 * @method Atomic.Test.resetEnv
 */
Atomic.Test.resetEnv = function() {
  Atomic.Test.__components = {};
  Atomic.Test.__defines = {};
};

/**
 * define an external module that isn't an Atomic Component
 * useful for items such as underscore or jQuery, which may be external
 * libraries, but are still needed inside an Atomic Component. It's
 * recommended to use a utility like Sinon and mock/replace integration
 * methods where needed.
 * @method Atomic.Test.define
 * @param {String} id - the id to reference this exports collection
 * @param {Object} exp - the exports object for the given id
 */
Atomic.Test.define = function (id, exp) {
  Atomic.Test.__defines[id] = exp;
};


/**
 * Creates a fake Atomic Component, without any functioning methods
 * This shell function makes it possible to create an Atomic component
 * that will not trigger any dependency requirements, and offers all
 * of the methods and events a component may have.
 *
 * A fake component definition is an object literal with the following
 * keys defined
 *
 * - events (array) an array of event names this component will use
 * - methods (array) an array of methods this component will expose
 * - id (string) an id for this component. Useful for debugging
 *
 * @method Atomic.Test.fakeComponent
 * @param {Object} def - component definition
 */
Atomic.Test.fakeComponent = function(def) {
  var obj = {
    depends: [],
    name: 'Mock of ' + def.id,
    events: {}
  };
  
  var newFn = function() {
    return function() {};
  };
  
  var i;
  
  if (def.methods) {
    for (i = 0, len = def.methods.length; i < len; i++) {
      obj[def.methods[i]] = newFn();
    }
  }
  
  if (def.events) {
    for (i = 0, len = def.events.length; i < len; i++) {
      obj.events[def.events[i]] = 'Mock event from fakeComponent()';
    }
  }
  
  obj.init = function() {
    var wire = this.wireIn;
    this.wireIn = function(o) {
      o.depends = [];
      return wire(o);
    };
  };
  
  var component = Atomic.Component(obj);
  Atomic.Test.__components[id] = component;
};


/**
 * Replaces the Atomic.pack() function
 * This new function writes to an internal component registry
 * @method Atomic.pack
 */
Atomic.pack = function(id, m, d, factory) {
  Atomic.Test.__components[id] = factory();
};

/**
 * Current a placeholder, passes through to Atomic.Component
 * It is likely we will need to alter the way component generation
 * works, but it's unknown in which ways yet
 * @method Atomic.Component
 */
Atomic.Component = function(definition) {
  return Atomic.Test.methods.Component(definition);
};

/**
 * Replaces Atomic.load, using an alternate loading method
 * This loading method looks at the internal registers for modules
 * and opts to use those instead. Returns a promise just like the
 * original Atomic.load function
 */
Atomic.load = function() {
  var deps = [].slice.call(arguments, 0);
  var resolvedDeps = [];
  var deferred = Atomic.deferred();
  var mod;
  var comp;
  for (var i = 0, len = deps.length; i < len; i++) {
    mod = Atomic.Test.__defines[deps[i]];
    comp = Atomic.Test.__components[deps[i]];
  
    if (!mod && !comp) {
      throw new Error('must define: ' + deps[i] + ' either with fakeComponent() or define()');
    }
  
    resolvedDeps.push(mod || comp);
  }
  window.setTimeout(function() {
    deferred.resolve(resolvedDeps);
  }, 10);
  
  return deferred.promise;
};
