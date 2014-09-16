/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const STABLE_VERSION = '1_17';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mozilla-addon-sdk');
  grunt.loadNpmTasks('grunt-bower-task');

  grunt.initConfig({
    bower: {
      install: {
        options: {
          targetDir: 'src/data/bower_components/',
          verbose: true,
        }
      }
    },

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
    },

    'mozilla-addon-sdk': {
      '1_17': {
        options: {
          revision: '1.17'
        }
      },
      'master': {
        options: {
          revision: 'master',
          github: true
        }
      }
    },
    'mozilla-cfx-xpi': {
      'stable': {
        options: {
          'mozilla-addon-sdk': STABLE_VERSION,
          extension_dir: 'src',
          dist_dir: 'tmp/dist-stable'
        }
      },
      'experimental': {
        options: {
          'mozilla-addon-sdk': 'master',
          extension_dir: 'src',
          dist_dir: 'tmp/dist-experimental'
        }
      }
    },
    'mozilla-cfx': {
      'run_stable': {
        options: {
          'mozilla-addon-sdk': STABLE_VERSION,
          extension_dir: 'src',
          command: 'run'
        }
      },
      'run_experimental': {
        options: {
          'mozilla-addon-sdk': 'master',
          extension_dir: 'src',
          command: 'run'
        }
      },
      'run_test': {
        options: {
          'mozilla-addon-sdk': STABLE_VERSION,
          extension_dir: 'src',
          command: 'test'
        }
      },
      'run_test_experimental': {
        options: {
          'mozilla-addon-sdk': 'master',
          extension_dir: 'src',
          command: 'test'
        }
      }
    }
  });

  grunt.registerTask('default', ['jshint:all', 'watch']);

  grunt.registerTask('build', ['mozilla-addon-sdk:' + STABLE_VERSION,
                               'mozilla-cfx-xpi:stable']);

  grunt.registerTask('run', ['mozilla-cfx:run_stable']);
  grunt.registerTask('run:experimental',
                    ['mozilla-cfx:run_experimental']);

  grunt.registerTask('release', ['mozilla-cfx-xpi:stable']);
  grunt.registerTask('release:experimental',
                    ['mozilla-cfx-xpi:experimental']);
  grunt.registerTask('test', ['mozilla-cfx:run_test']);
  grunt.registerTask('test:experimental',
                    ['mozilla-cfx:run_test_experimental']);
};
