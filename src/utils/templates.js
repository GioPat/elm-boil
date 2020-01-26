const defaultIndex = `<!DOCTYPE HTML>
<html>
<head>
  <meta charset="UTF-8">
  <title>Elm App</title>
  <link rel="shortcut icon" href="/assets/favicon.ico">
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


const errorIndex = `<!DOCTYPE HTML>
<html>
<head>
  <meta charset="UTF-8">
  <title>Error</title>
</head>

<body style="font-family: 'Courier New'">
  <h3 style="text-align:center; color: red">
    Error encountered while compiling Elm sources
  </h3>
  <div style="border-left: 10px solid red; background-color: #ff00000f; padding: 20px">
    <span>
      {error_content}
    </span>
  </div>
</body>
</html>
`

const gitignore = `
# Default build directory
dist

# Evironment variables
env

# elm-package files
elm-stuff

# npm Dependencies
node_modules

.DS_Store
`

module.exports.defaultIndex = defaultIndex;
module.exports.gitignore = gitignore;
module.exports.errorIndex = errorIndex;
