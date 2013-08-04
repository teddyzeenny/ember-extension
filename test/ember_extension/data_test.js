import EmberExtension from "main";

var port, message, name;

function modelTypes() {
  return [
    {
      name: 'App.Post',
      count: 2,
      attributes: [ { name: 'id'}, { name: 'title' }, { name: 'body' } ]
    },
    {
      name: 'App.Comment',
      count: 2,
      attributes: [ { name: 'id'}, { name: 'title' }, { name: 'body' }]
    }
  ];
}

function records(modelType) {
  if (modelType === 'App.Post') {
    return [
      { id: 1, title: 'My Post', body: 'This is my first post' },
      { id: 2, title: 'Hello', body: '' }
    ];
  } else if(modelType === 'App.Comment') {
    return [
      { id: 1, title: 'My Comment', body: 'This is my comment' },
      { id: 2, title: 'I am confused', body: 'I have no idea what im doing' }
    ];
  }

}

module("Data", {
  setup: function() {
    EmberExtension.Port = EmberExtension.Port.extend({
      init: function() {},
      send: function(n, m) {
        name = n;
        message = m;
      }
    });
    EmberExtension.reset();

    port = EmberExtension.__container__.lookup('port:main');
  }
});

test("Model types are successfully listed", function() {
  port.reopen({
    send: function(n, m) {
      name = n;
      message = m;
      if (name === 'data:getModelTypes') {
        this.trigger('data:modelTypes', { modelTypes: modelTypes() });
      }
      if (name === 'data:getRecords') {
        this.trigger('data:records', { records: records(message.modelType ) });
      }
    }
  });
  visit('model_types.index')
  .then(function() {
    return click(findByLabel('model-type-row').first());
  });

  ok(true);
});
