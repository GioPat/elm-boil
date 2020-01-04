#!/usr/bin/env node

var fs = require('fs');
var log = require('./utils/log');
var copy = require('./utils/copy');
var path = require('path');
var gulpfunc = require('../gulpfile');
var inquirer = require('inquirer');
const IndexNotExistError = require('./utils/errors');

var tmpPath      =path.join(__dirname, './../tmp/');
var templatePath =path.join(__dirname, './../template');

const Operations = {
  SERVE: "serve",
  BUILD: "build",
};

const defaultIndexJs = `<!DOCTYPE HTML>
<html>
<head>
  <meta charset="UTF-8">
  <title>Elm App</title>
  <link rel="shortcut icon" href="./assets/favicon.ico">
  <!-- inject:css -->
  <!-- endinject -->
  <!-- inject:js -->
  <!-- endinject -->
</head>

<body>
  <div id="elm"></div>
  <script>
  var app = Elm.Main.init({
    node: document.getElementById("elm")
  });
  </script>
</body>
</html>
`
require('yargs')
  .command('init <projName>', 'creates a new project', (yargs) => {
    yargs
      .positional('projName', {
        describe: 'Project name to create',
        require: true,
      })
  }, (argv) => {
    var projName = argv.projName
    handleCreate(projName);
  })
  .command('serve', 'project', (yargs) => {
    yargs
      .option('host', {
        alias: 'h',
        default: '0.0.0.0',
      })
      .option('port', {
        alias: 'p',
        default: 3000
      })
  }, (argv) => {
    handleServe(argv.host, argv.port);
  })
  .command('build', ' build the project', (yargs) => {
    yargs
      .option('output', {
        alias: 'o',
        default: 'dist'
      })
  }, (argv) => {
    handleBuild(argv.output);
  })
.argv;


/**
 * Scaffold Elm project in a folder called projName
 * @param {string} projName Project name.
 */
function handleCreate(projName) {
  log.info(`Creating project: ${projName} in ${tmpPath}`);
  var projPath = path.join('./', projName);
  copy.copySync(templatePath, projPath);
  fs.readFile(path.join(projPath, 'package.json'), 'utf8', function (err,data) {
    if (err) {
      return log.error(err);
    }
    var result = data.replace(/<projName>/g, projName);
  
    fs.writeFile(path.join(projPath, 'package.json'), result, 'utf8', function (err) {
       if (err) return log.error(err);
    });
    log.info(`${projName} created successfully`);
  });
}

/**
 * Checks the source project that needs to be served.
 */
function checkBoiledElm() {
  var sourcePath = process.cwd();
  if(!fs.existsSync(path.join(sourcePath, "public"))) {
    throw new Error("Public folder is missing, make sure to serve a elm-boiled folder");
  }
  if(!fs.existsSync(path.join(sourcePath, "public", "index.html"))) {
    throw new IndexNotExistError("public/index.html template is missing, elm-boil project corrupted");
  }
  if(!fs.existsSync(path.join(sourcePath, "assets"))) {
    log.warn("./assets folder is missing");
  }
}

/**
 * Performs serve or build function checking the folder
 * @param {string=Operations.BUILD|Operations.SERVE} [operation=Operations.SERVE] 
 * - operation to be perfomed
 * @param {string} path - Working process path
 * @param {string} host - Host, in case of serve
 * @param {string} port - Port, in case of serve
 */
function perform(operation, path, host, port) {
  operation = operation || Operations.SERVE;
  try {
    checkBoiledElm();
    (operation === Operations.BUILD) ? (
      gulpfunc.build(path)
    ) : (
      gulpfunc.serve(path, host, port)
    );
  }
  catch(error) {
    if(error.name === "IndexNotExistsError") {
      log.warn(error.message);
      inquirer.prompt([
        {
          type: 'confirm',
          message: 'Index not found, do you want to create a default one?',
          name: 'createIndex'
        }
      ])
      .then(answer => {
        if(answer.createIndex) {
          fs.writeFileSync(
            path.join(process.cwd(), 'public', 'index.html'),
            defaultIndexJs,
            {
              encoding: 'utf-8'
            }
          )
          log.info("Index file created successfully");
          (operation === Operations.BUILD) ? (
            gulpfunc.build(path)
          ) : (
            gulpfunc.serve(path, hsot, port)
          );
        } else {
          log.error(`Can't perform a ${operation} without public/index.html file`);
          return;
        }
      })
    } else {
      log.error(error.message);
      return;
    }
  }
}

/**
 * Serves an Elm boiled project in the current working directory for a development
 * environment
 * @param {string} [host="0.0.0.0"] 
 * @param {int} [port=3000]
 */
function handleServe(host, port) {
  var host = host || "0.0.0.0";
  var port = port || 3000;
  var nowTimestamp = new Date().getTime().toString();
  var servingPath = tmpPath + nowTimestamp;
  fs.readdirSync(tmpPath, { withFileTypes: true})
    .filter(dirent => dirent.isDirectory())
    .map((dirent) => {
      fs.rmdirSync(path.join(tmpPath, dirent.name), {recursive: true});
    });
  
  perform(Operations.SERVE, servingPath, host, port);
  return;
}

/**
 * Creates an optimized Elm build in the specified directory
 * @param {string} [outputDir="dist"]
 */
function handleBuild(outputDir) {
  log.info("Building project in ./" + outputDir);
  perform(Operations.BUILD, outputDir);
}

