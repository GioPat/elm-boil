# Elm Boil

Handle Elm Project with almost zero effort 🍲.
- [Quickstart](#quickstart)
- [Getting Started](#getting-started)
    1. [Installation](#installation)
    2. [Create Project](#create-project)
    3. [Serve Project](#serve-project)
    4. [Build project](#build-project)
- [Why do I chose elm-boil?](#why-do-i-chose-elm-boil)

## Quickstart
**Node >= 12.10.0**

```sh
  npm install -g elm-boil
  elm-boil create my-elm-app
  cd ./my-elm-app
  npm start
```
Create a production build with `npm run build -- --output my-elm-build`

Note that you can modify your `package.json` and pass your custom parameters to the `elm-boil` utility.

## Getting Started

### Installation
**Make sure you have Node >= 12.10.0 installed**

`npm install -g elm-boil`

### Create project
This command scaffolds a new Elm project with the support of scss compilation and Elm environment variable handling as it's described in [this answer](https://discourse.elm-lang.org/t/dependency-injection-how-to-switch-api-server/570) provided by the creator of [elm-spa-example](https://github.com/rtfeldman/elm-spa-example).

Usage:

`elm-boil init <project_name>`

Project structure:

```
my-elm-app
├── README.md
├── package.json
├── elm.json
├── .gitignore
├── assets
│   ├── favicon.ico
│   └── elm-logo.svg
├── env                 - Env variables (not versioned)
├── env-default         - Default Env (versioned)
├── public
|   └── index.html      - index.html template
└── src
    ├── Main.elm
    └── Main.scss
```
### Serve Project
This command starts a local webserver helping development phase of the application using live elm and scss compilation plus a livereload functionality.

Usage (inside the project directory):

`elm-boil serve [-p|--port=3000] [-h|--host="0.0.0.0"]`

### Build Project
This command creates a minified and uglified build inside the project directory.
A content hash is added to the file name allowing you to use aggressive caching techniques.

Usage (inside the project directory):

`elm-boil build [-o|--output=dist]`

A good idea to use the output parameter could be a parallel centered distribution of the same frontend for multiple environments.

### Why do I chose elm-boil?

  - Single dependency
  - Support of SCSS
  - Lightweight
  - Extremely fast
  - Ease of use

### Contributing

Feel free to submit issues and enhancement requests 🚀🚀!.

### Popular alternatives
 - [create-elm-app](https://github.com/halfzebra/create-elm-app)