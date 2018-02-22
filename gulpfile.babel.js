//https://medium.com/@andrewhenderson/es6-with-babel-6-gulp-and-rollup-aa7aeddeccc6
//https://github.com/gulpjs/gulp#use-latest-javascript-version-in-your-gulpfile
//
//  npm i -D  babel-core  gulp@next gulp-file  rollup rollup-plugin-babel babel-preset-env
//
//For cleanup/minification:
//  npm i -D  gulp-strip-comments gulp-header gulp-uglify gulp-rename
//
//(Ignore warning "Failed to load external module @babel/register")
//https://github.com/gulpjs/gulp/issues/1631


import gulp from 'gulp';
import file from 'gulp-file';
import { rollup } from 'rollup';
import babel from 'rollup-plugin-babel';

//Cleanup & minification step:
import strip from 'gulp-strip-comments';
import header from 'gulp-header';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';

import * as pkg from './package.json';


const globalName = 'dragTracker',
      outFolder = 'dist/';

const myBanner = `/*!
 * <%= pkg.name %> v<%= pkg.version %>
 * <%= pkg.homepage %>
 *
 * Copyright 2017-<%= new Date().getFullYear() %> <%= pkg.author %>
 * Released under the <%= pkg.license %> license.
 */
`;


gulp.task('build', function() {
    return rollup({
        input: 'index.js',
        //input: `src/${pkg.name}.js`,
        plugins: [
          babel({
            babelrc: false,
            presets: [
              ["env", { "modules": false }]
            ],
            exclude: 'node_modules/**',
          })
        ],
    })
    .then(bundle => {
        return bundle.generate({
          format: 'umd',
          name: globalName,
        });
    })
    .then(gen => {
        /* http://paulsalaets.com/posts/reusable-pipelines-in-gulp-build
        function output(inputStream) {
            inputStream
                .pipe(header(myBanner, { pkg : pkg }))
                .pipe(gulp.dest(outFolder));
        }
        //*/
    
        const cleanStream = file(pkg.name + '.js', gen.code, { src: true })
                              .pipe(strip())
        //output(cleanStream);
            .pipe(header(myBanner, { pkg : pkg }))
            .pipe(gulp.dest(outFolder))
    
        //output(cleanStream
            //https://codehangar.io/concatenate-and-minify-javascript-with-gulp/
            //https://stackoverflow.com/questions/32656647/gulp-bundle-then-minify
            //(https://stackoverflow.com/questions/40609393/gulp-rename-illegal-operation)
            .pipe(rename({ extname: '.min.js' }))
            .pipe(uglify())

            .pipe(header(myBanner, { pkg : pkg }))
            .pipe(gulp.dest(outFolder));
        //);
    });
});
