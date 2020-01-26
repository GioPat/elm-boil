var gulp = require("gulp");
var sass = require("gulp-sass");
var elm = require("gulp-elm");
var uglify = require("gulp-uglify");
var Vinyl = require("vinyl");
var inject = require("gulp-inject");
var concat = require("gulp-concat");
var hash = require("gulp-hash-filename");
var open = require('open');
var cleanCss = require("gulp-clean-css"); 
var fs = require("fs");
var path = require('path');
var log = require("./src/utils/log");
var connect = require("gulp-connect");
var templates = require('./src/utils/templates');

var paths = {
  src:      "src/**/*",
  srcHTML:  "src/**/*.html",
  srcCSS:   "src/**/*.css",
  srcSCSS:  "src/**/*.scss",
  mainElm:  "src/Main.elm",
  envElm:   "env/**/*.elm",
  srcElm:   "src/**/*.elm",  tmp: "tmp",
  pubIndex: "public/index.html",
  tmpCSS:   "**/*.css",
  tmpJS:    "**/*.js",  dist: "dist",
  assets:   "assets/**/*",
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

function elmDebug(res, rej, tmp) {
  gulp.src(paths.mainElm)
    .pipe(elm.bundle("index.js", { filetype: "js", debug: true}))
    .on("error", function(err) {
      log.error("Error encountered while compiling Elm, see browser for details.");
      rej(err);
    })
    .pipe(gulp.dest(".", {cwd: tmp}))
    .on("end", function() {
      res();
    });
};

function elmRelease(cb, dist) {
  gulp.src(paths.mainElm)
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
    .pipe(hash({
      format: "{name}.{hash:10}{ext}"
    }))
    .pipe(gulp.dest(dist))
    .on("end", function() { cb(); });
}

function indexDebug(cb, tmp) {
  var css = gulp.src(paths.tmpCSS, {cwd: tmp});
  var js = gulp.src(paths.tmpJS, {cwd: tmp});
  gulp.src(paths.pubIndex)
    .pipe(gulp.dest(".", {cwd: tmp}))
    .pipe(inject(css, { quiet: true } ))
    .pipe(inject(js, { quiet: true }))
    .pipe(gulp.dest(".", {cwd: tmp}))
    .pipe(connect.reload());
  cb();
};

function indexError(cb, tmp, content) {
  const htmlContent = templates.errorIndex.replace("{error_content}", content);
  string_src("index.html", htmlContent)
    .pipe(gulp.dest(".", { cwd: tmp}))
    .pipe(connect.reload())
    .on("end", function() { cb(); })
}

function indexRelease(cb, dist) {
  var distCss = dist + "/**/*.css";
  var distJs = dist + "/**/*.js";
  var css = gulp.src(distCss);
  var js = gulp.src(distJs);
  gulp.src(paths.pubIndex, {cwd: process.cwd()})
    .pipe(gulp.dest(dist))
    .pipe(inject(css, { relative: true, quiet: true }))
    .pipe(inject(js, { relative: true, quiet: true }))
    .pipe(gulp.dest(dist))
    .on("end", function() { cb(); });
}

function hashCss(cb, dist) {
  gulp.src(dist + "/" + "style.min.css")
    .pipe(hash({
      format: "{name}.{hash:10}{ext}"
    }))
    .pipe(gulp.dest(dist))
    .on("end", function() {
      cb();
    });
}

function delCss(dist) {
  fs.unlinkSync(path.join(process.cwd(), dist, "style.min.css"));
}

async function release(dist) {
  new Promise((resolve) => {
    assets(resolve, dist);
  });
  await new Promise((resolve) => {
    elmRelease(resolve, dist);
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
  log.info("Build successfully created");
}

function serve(tmp, host, port) {
  var host = host || "0.0.0.0";
  log.info(`Serving @ http://${host}:${port}`);
  connect.server({
    host: host,
    port: port,
    silent: true,
    root: tmp,
    livereload: true,
    fallback: path.join(tmp, "index.html")
  });
}

async function copy(resolve, tmp) {
  try {
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
      new Promise((resolve, reject) => {
        elmDebug(resolve, reject, tmp);
      }),
    ]);
    await new Promise((resolve) => {
      indexDebug(resolve, tmp);
    });
  } catch (e) {
    await new Promise((resolve) => {
      indexError(resolve, tmp, e.message.replace(/\n/g, "<br />"));
    });
  }
  resolve();
}

async function serving(tmp, host, port) {
  fs.mkdirSync(tmp, {recursive: true});
  await new Promise((resolve) => {
    copy(resolve, tmp);
  });
  serve(tmp, host, port);
  await new Promise((resolve) => {
    watching(resolve, tmp, host, port);
  });
  open(`http://localhost:${port}`);
}

function watching(cb, tmp, host, port) {
  gulp.watch([paths.srcElm, paths.envElm, paths.srcSCSS, paths.srcCSS], (resolve) => {
    console.clear();
    log.info("Changes dected");
    log.info(`Reloaded @ http://${host}:${port}`);
    copy(resolve, tmp);
  });
  cb();
}


exports.build = release;
exports.serve = serving;