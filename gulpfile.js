var gulp = require("gulp");
var babel = require("gulp-babel");
var exec = require('child_process').exec;

gulp.task("default", function () {
  child = exec('rm -rf src', function(err, out) { });

  gulp.src("source/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("src"));

  return Promise.resolve();
});
