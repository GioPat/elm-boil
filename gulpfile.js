var gulp = require("gulp");
var sass = require("gulp-sass");
var elm = require("gulp-elm");
var uglify = require("gulp-uglify");
var Vinyl = require("vinyl");
var inject = require("gulp-inject");
var concat = require("gulp-concat");
var hash = require("gulp-hash");
var cleanCss = require("gulp-clean-css"); 
var del = require("del");
var log = require("./src/utils/log");
var connect = require("gulp-connect");
var paths = {
  src: "src/**/*",
  srcHTML: "src/**/*.html",
  srcCSS: "src/**/*.css",
  srcSCSS: "src/**/*.scss",
  srcElm: "src/**/*.elm",  tmp: "tmp",
  pubIndex: "public/index.html",
  tmpCSS: "**/*.css",
  tmpJS: "**/*.js",  dist: "dist",
  assets: "assets/**/*",
};

function string_src(filename, string) {
  var src = require("stream").Readable({ objectMode: true });
  src._read = function() {
    this.push(new Vinyl({ path: filename, contents: Buffer.from(string) }));
    this.push(null);
  };
  return src;
}

function assets(cb, dest) {
  gulp.src(paths.assets)
    .pipe(gulp.dest("./assets", {cwd: dest}))
    .on("end", function() { cb(); });
}

function scssDebug(cb, tmp) {
  gulp.src(paths.srcSCSS)
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest(".", {cwd: tmp}))
    .on("end", () => { cb(); });
};

function cssDebug(cb, tmp) {
  gulp.src(paths.srcCSS)
    .pipe(gulp.dest(".", {cwd: tmp}))
    .on("end", () => { cb(); });
};

function cssRelease(cb, dist) {
  gulp.src(paths.srcCSS)
    .pipe(concat("style.min.css"))
    .pipe(cleanCss())
    .pipe(gulp.dest(dist));
  gulp.src(paths.srcSCSS)
    .pipe(sass().on("error", sass.logError))
    .pipe(concat("style.min.css"))
    .pipe(cleanCss())
    .pipe(gulp.dest(dist))
    .on("end", function() { cb(); });
};

function elmDebug(cb, tmp) {
  gulp.src(paths.srcElm)
    .pipe(elm.bundle("index.js", { filetype: "js", debug: true}))
    .pipe(gulp.dest(".", {cwd: tmp}))
    .on("end", function() {
      cb();
    });
};

function elmRelease(cb, dist) {
  gulp.src(paths.srcElm)
    .pipe(elm.bundle("script.min.js", { optimize: true }))
    .pipe(
      uglify({
        compress: {
          pure_funcs: [
            "F2",
            "F3",
            "F4",
            "F5",
            "F6",
            "F7",
            "F8",
            "F9",
            "A2",
            "A3",
            "A4",
            "A5",
            "A6",
            "A7",
            "A8",
            "A9"
          ],
          pure_getters: true,
          keep_fargs: false,
          unsafe_comps: true,
          warnings: false,
          drop_console: true,
          unsafe: true,
        },
        mangle: false,
      })
    )
    .pipe(
      uglify({
        warnings: false,
        compress: false,
        mangle: true,
      })
    )
    .pipe(hash())
    .pipe(gulp.dest(dist))
    .on("end", function() { cb(); });
}

function indexDebug(cb, tmp) {
  var css = gulp.src(paths.tmpCSS, {cwd: tmp});
  var js = gulp.src(paths.tmpJS, {cwd: tmp});
  gulp.src(paths.pubIndex)
    .pipe(gulp.dest(".", {cwd: tmp}))
    .pipe(inject(css, { relative: true, quiet: true } ))
    .pipe(inject(js, { relative: true, quiet: true }))
    .pipe(gulp.dest(".", {cwd: tmp}))
    .pipe(connect.reload());
  cb();
};

function indexRelease(cb, dist) {
  var distCss = dist + "/**/*.css";
  var distJs = dist + "/**/*.js";
  var css = gulp.src(distCss);
  var js = gulp.src(distJs);
  string_src("index.html", indexJs)
    .pipe(gulp.dest(dist))
    .pipe(inject(css, { relative: true }))
    .pipe(inject(js, { relative: true }))
    .pipe(gulp.dest(dist))
    .on("end", function() { cb(); });
}

function hashCss(cb, dist) {
  gulp.src(dist + "/" + "style.min.css")
    .pipe(hash())
    .pipe(gulp.dest(dist))
    .on("end", function() {
      cb();
    });
}

function delCss(dist) {
  del(dist + "/" + "style.min.css", {froce: true});
}

async function release() {
  var dist = paths.dist;
  new Promise((resolve) => {
    assets(resolve, dist);
  });
  await new Promise((resolve) => {
    elmDebug(resolve, dist);
  });
  await new Promise((resolve) => {
    cssRelease(resolve, dist);
  });
  await new Promise((resolve) => {
    hashCss(resolve, dist);
  });
  await new Promise((resolve) => {
    indexRelease(resolve, dist);
  });
  delCss(dist);
}

function serve(tmp, host, port) {
  var host = host || "0.0.0.0";
  log.info(`Serving @ http://${host}:${port}`);
  connect.server({
    host: host,
    port: port,
    silent: true,
    root: tmp,
    livereload: true
  })
}

async function copy(resolve, tmp) {
  await Promise.all([
    new Promise((resolve) => {
      assets(resolve, tmp);
    }),
    new Promise((resolve) => {
      scssDebug(resolve, tmp);
    }),
    new Promise((resolve) => {
      cssDebug(resolve, tmp);
    }),
    new Promise((resolve) => {
      elmDebug(resolve, tmp);
    }),
  ]);
  await new Promise((resolve) => {
    indexDebug(resolve, tmp);
  });
  resolve();
}

async function serving(tmp, host, port) {
  await new Promise((resolve) => {
    copy(resolve, tmp);
  });
  serve(tmp, host, port);
  await new Promise((resolve) => {
    watching(resolve, tmp);
  });
}

function watching(cb, tmp) {
  gulp.watch(paths.src, (resolve) => {
    copy(resolve, tmp);
  });
  cb();
}

async function greet() {
  log.info("Hello World!");
};

exports.default = greet;
exports.build = release;
exports.serve = serving;