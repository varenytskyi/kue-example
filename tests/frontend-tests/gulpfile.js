var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee');

var paths = {
    dist: 'dist/',
    src: 'src/*.coffee'
};

gulp.task('coffee:compile', function() {
    gulp.src(paths.src).
        pipe(
            coffee().on('error', gutil.log)
        ).
        pipe(gulp.dest(paths.dist));
});

gulp.task('watch', function() {
    gulp.watch(paths.src, ['coffee:compile']);
});

gulp.task('default', ['coffee:compile', 'watch']);
