import FirefoxPort from "port-firefox";
import ChromePort from "port-chrome";

var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

var Port;

if (is_chrome) {
  Port = ChromePort;
} else {
  Port = FirefoxPort;
}

Ember.Application.initializer({
  name: "port",

  initialize: function(container, application) {
    container.register('port:main', application.Port);
    container.lookup('port:main');
  }
});

Ember.Application.initializer({
  name: "injectPort",

  initialize: function(container) {
    container.typeInjection('controller', 'port', 'port:main');
    container.typeInjection('route', 'port', 'port:main');
  }
});

export default Port;
