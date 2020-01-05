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

module.exports.defaultIndexJs = defaultIndexJs;
module.exports.gitignore = gitignore;