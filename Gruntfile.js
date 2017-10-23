module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    uglify: {
      all_src : {
        options : {
          sourceMap : true,
          sourceMapName : 'svgHex.min.map',
          compress: {
          //  drop_console: true
          }
        },
        src : 'svgHex.js',
        dest : 'svgHex.min.js'
      },
      noSVG : {
        options : {
          sourceMap : true,
          sourceMapName : 'plugin.svgHex.min.map',
          compress: {
          //  drop_console: true
          }
        },
        src : 'plugin.svgHex.js',
        dest : 'plugin.svgHex.min.js'
      }
    },

    concat : {
      options : {
        sourceMap : true
      },
      dev : {
        files : {
          'svgHex.js': [
            'src/svgHex.js',
            'libraries/HexAPI.min.js',
            'libraries/svg.min.js',
            'src/anims.js',
            'src/sequences.js',
            'src/close.js'
          ]
        }
      },
      noSVG : {
        files : {
          'plugin.svgHex.js': [
            'src/svgHex.js',
            'libraries/HexAPI.min.js',
            'src/anims.js',
            'src/sequences.js',
            'src/close.js'
          ]
        }
      }
    },

    watch: {
      testAndCombine : {
        files : ['src/**/*.js'],
        tasks: ['concat','uglify']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  //This is to run while developing
};
