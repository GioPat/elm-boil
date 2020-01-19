#!/usr/bin/env node

var fs = require('fs');
var log = require('./utils/log');
var copy = require('./utils/copy');
var templates = require('./utils/templates');
var path = require('path');
var gulpfunc = require('../gulpfile');
var inquirer = require('inquirer');
var exec = require('child_process').exec;
const IndexNotExistError = require('./utils/errors');

var tmpPath      =path.join(__dirname, './../tmp/');
var templatePath =path.join(__dirname, './../template');

const Operations = {
  SERVE: "serve",
  BUILD: "build",
};

/**
 * Serving Path of the project
 */
var servingPath = undefined;

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
 * Asks the user for npm elm installation if answer is Yes performs a npm elm installation
 * @returns {Promise<string>} Elm installation promise with installed elm version
 */
function _askAndInstallElm() {
  return new Promise((resolve, reject) => {
    inquirer.prompt([
      {
        type: 'confirm',
        message: `It seems that elm is not installed on your machine, do you want to install globally with npm?`,
        name: 'installElm'
      }
    ])
      .then(answer => {
        if(answer.installElm) {
          log.info("Installing elm with \"npm install -g elm\"");
          exec("npm install -g elm", (_, __, stderr) => {
            if(stderr) {
              reject(new Error(stderr));
            }
            exec("elm --version", (_, stdout, stderr) => {
              if(stderr) {
                reject(new Error(stderr));
              }
              const version = stdout.replace(/(\r\n|\n|\r)/gm, "");
              log.info(`Elm ${version} successfully installed`);
              resolve(version)
            })
          })
        } else {
          const msg = `Can't use elm-boil without elm :-/, install it with your tools and try again!`;
          reject(new Error(msg));
        }
      })
      .catch(err => {
        reject(err);
      })
  })
}


/**
 * Scaffold Elm project in a folder called projName
 * @param {string} projName Project name.
 */
async function handleCreate(projName) {
  log.info(`Creating project: ${projName}`);
  var projPath = path.join('./', projName);
  try {
    const elmVersion = await (
      new Promise((resolve, _) => {
        exec("elm --version", async (_, stdout, stderr) => {
          var version = stdout;
          if(stderr) {
            try {
              version = await _askAndInstallElm();
            } catch(err) {
              reject(err);
            }
          }
          version = version.replace(/(\r\n|\n|\r)/gm, "")
          resolve(version);
        })
      }
    ));
    copy.copySync(templatePath, projPath);
    var npmPackage = fs
      .readFileSync(path.join(projPath, 'package.json'), 'utf8')
      .replace(/<projName>/g, projName);
    fs.writeFileSync(path.join(projPath, 'package.json'), npmPackage, 'utf8');
    fs.writeFileSync(path.join(projPath, '.gitignore'), templates.gitignore);
    var elmJson = fs
      .readFileSync(path.join(projPath, 'elm.json'), 'utf8')
      .replace(/<elmVersion>/g, elmVersion);
    fs.writeFileSync(path.join(projPath, 'elm.json'), elmJson, 'utf8');
    log.info(`${projName} created successfully`);
  }
  catch(err) {
    log.error(err);
    return;
  }
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
            templates.defaultIndexJs,
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
  servingPath = tmpPath + nowTimestamp;
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


// TODO: For any issue with windows:
// Follow https://stackoverflow.com/questions/10021373/what-is-the-windows-equivalent-of-process-onsigint-in-node-js 
process.on("SIGINT", function () {
  fs.rmdirSync(servingPath, { recursive: true });
  process.exit();
});
