module.exports = function(grunt) {
  grunt.initConfig({
    clean: ['src/js/'],
    type: {
      'default': {
        files: [
          {
            src: 'src/ts/bongo.ts',
            dest: 'src/js/bongo.es5.js'
          }
        ],
        options: {
          sourcemap: true,
          target: 'es5'
        }
      }
    },
    uglify: {
      'default': {
        src: '**/bongo.es5.js',
        dest: 'dist/bongo.min.js'
      }
    },
    watch: {
      files: ['**/*.ts'],
      tasks: ['clean','type','uglify','karma']
    },
    karma: {
      unit: {
        configFile: 'tests/karma.conf.js',
        runnerPort: 9100,
        singleRun: true,
        browsers: ['Chrome','ChromeCanary','Firefox'] // Add 'IE' if you're on Windows
      }
    }
  });

  grunt.registerTask('default', [
    'clean',
    'type',
    'uglify',
    'karma',
    'watch'
  ]);

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-type');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');
};