module.exports = function(grunt) {
    grunt.initConfig({
        pkg: '<json:package.json>',
        meta: {
            name: 'Tatsu Game Engine',
            banner: '/*! <%= meta.name %> - v<%= pkg.version %> - <%= grunt.template.today("m/d/yyyy") %>\n' +
              '* <%= pkg.homepage %>\n' +
              '* Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
              ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        },
        concat: {
            dist: {
                src: [
                    '<banner>',
                    'lib/*.js',
                    'src/Tatsu.js',
                    'src/Graphics/**/*.js'
                ],
                dest: 'dist/tatsu.js'
            }
        },
        min: {
            dist: {
                src: ['<banner>', 'dist/tatsu.js'],
                dest: 'dist/tatsu.min.js'
            }
        },
        test: {
            files: ['test/**/*.js']
        },
        lint: {
            all: ['src/**/*.js']
        },
        watch: {
            files: '<config:link.files',
            tasks: 'lint:files test:files'
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true
            },
            globals: {
                console: true,
                Tatsu: true,
                $: true,
                jQuery: true
            }
        },
        uglify: {}
    });

    // default task
    grunt.registerTask('default', 'lint test concat min');
};