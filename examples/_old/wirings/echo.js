/*global require:true, module:true, define: true, console:true */

/*
A reusable wiring.
This is a sample wiring. Go ahead and include it and add "echo" methods
*/
var Atomic = require('atomic');

function factory() {
  return function(config) {
    return {
      init: function(needs, nodes) {
        // reusable code goes here, it's invoked when a consuming
        // developer calls load()
        // this === the component
        var sample = config.configName;
        this.echo('Initialized with the config of ' + sample);
      },
      /**
       * This is a custom method. Anyone who wires in this object
       * will get an "echo" method.
       */
      echo: function(msg) {
        console.log(msg);
      }
    };
  };
}
// you only need to set .id if you are using the "system" loader
factory.id = 'wirings/echo';

Atomic.export(module, define, factory);