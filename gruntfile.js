// Gruntfile with the configuration of grunt-express and grunt-open. No livereload yet!
module.exports = function(grunt) {

    // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    var httpFolder;
    var options = grunt.file.readJSON('config.json');
    // Configure Grunt
    grunt.initConfig({
        // grunt-express will serve the files from the folders listed in `bases`
        // on specified `port` and `hostname`
        express: {
            all: {
                options: {
                    port: 9000,
                    hostname: "0.0.0.0",
                    bases: ["http"], // Replace with the directory you want the files served from
                                        // Make sure you don't use `.` or `..` in the path as Express
                                        // is likely to return 403 Forbidden responses if you do
                                        // http://stackoverflow.com/questions/14594121/express-res-sendfile-throwing-forbidden-error
                    livereload: true
                }
            }
        },

        // grunt-watch will monitor the projects files
        watch: {
            options: {
                livereload: true
            },
            all: {
                // Replace with whatever file you want to trigger the update from
                // Either as a String for a single entry
                // or an Array of String for multiple entries
                // You can use globing patterns like `css/**/*.css`
                // See https://github.com/gruntjs/grunt-contrib-watch#files
                files: ['<%= express.all.options.bases%>/**/*.css', '<%= express.all.options.bases%>/*.html',
                        '<%= express.all.options.bases%>/**/*.js', 'http/**/*.img']
            }
        },

        // grunt-open will open your browser at the project's URL
        open: {
            all: {
                // Gets the port from the connect configuration
                path: 'http://localhost:<%= express.all.options.port%>'
            }
        }
    });

    grunt.registerTask('create', 'Creates new project', function () {
        var task;
        var templateFolder;
        var alert;
        if (arguments.length > 0) {
            task = options[arguments[0]];
        } else {
            task = options.default;
        }

        httpFolder = task.http_folder;
        if (grunt.file.exists(httpFolder) === true) {
            alert = "Warning: this project already exist you " +
            "\ncan't create a new project in the same dir name: " + httpFolder;
            grunt.fail.fatal(alert , 3)
        }
        grunt.file.mkdir(httpFolder);
        templateFolder = task.template_folder;
        task.structures.forEach(
            function (file) {
                if(file.template){
                    grunt.file.write(httpFolder + file.name, grunt.file.read(templateFolder + file.template));
                }else{
                    if(file.name.indexOf(".")  === -1 ){
                        grunt.file.mkdir(httpFolder + file.name);
                    }else{
                        grunt.file.write(httpFolder + file.name);
                    }
                }
            }
        );
        grunt.task.run([
            'init',
            'express',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('clean', 'Clean project', function () {
        var alert;
        var task;
        if (arguments.length > 0) {
            task = options[arguments[0]];
        } else {
            task = options.default;
        }
        httpFolder = task.http_folder;
        if (grunt.file.exists(httpFolder) === true) {
            alert = "Please use --force option.\n!***WARNING: " + httpFolder + " folder and all contents will be deleted."
            + "\nYou can use arguments to delete specified project.\nEx:clean:xpto";
            grunt.fail.warn(alert , 3);
        }
        grunt.file.delete(httpFolder);
    });

    grunt.registerTask('init', 'Init project', function () {
        var task;
        if (arguments.length > 0) {
            task = options[arguments[0]];
        } else {
            task = options.default;
        }
        httpFolder = task.http_folder;
        if (grunt.file.exists(httpFolder) !== true) {
            alert = "Warning: this project is not created " +
            "\ncan't continue, please execute 'grunt create'.";
            grunt.fail.fatal(alert , 3);
        }
        grunt.config.set('express.all.options.bases', [httpFolder]);
    });

    // Creates the `server` task
    grunt.registerTask('default', [
        'init',
        'express',
        'open'
        ,'watch'
    ]);
};