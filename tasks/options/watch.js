module.exports = {
  scripts: {
    files: ['app/**/*', 'vendor/**/*', 'ember_debug/**/*', 'test/**/*', 'css/**/*', 'chrome_dist/*.js'],
    tasks: ['lock', 'build_test', 'unlock'],
    options: {
      nospawn: true
    }
  }
};
