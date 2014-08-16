module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    jshint: {
      options: {
        eqeqeq: true,
        jshintrc: true
      },
      all: ['src/**/*.js']
    },

    watch: {
      jshint: {
        tasks: ['jshint:all'],
        files: ['src/**/*.js']
      }
    }
  });
};
