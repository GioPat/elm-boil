# Elm Boiled App

This project is bootstrapped with [Elm Boil](https://github.com/GioPat/elm-boil).

Please, find below some information on how to perform basic tasks.
You can find the most recent version of [elm-boil here](https://github.com/GioPat/elm-boil#readme).

## Table of Contents
* [Folder structure](#folder-structure)
* [Available scripts](#available-scripts)
  * [elm-boil build](#elm-boil-build)
  * [elm-boil serve](#elm-boil-serve)
* [Changing the Page `<title>`](#changing-the-page-title)

## Folder structure
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
## Available scripts

In the project directory you can run:

### `elm-boil build`

`elm-boil build [-o|--output=dist]`

Builds the app for production to the output folder (`dist` by default).

The build is minified, and the filenames include the hashes.
Your single page application is ready to be statically served

### `elm-boil serve`

`elm-boil serve [-p|--port=3000] [-h|--host="0.0.0.0"]`

Runs the app in the development mode.

The browser should open automatically to [http://localhost:3000](http://localhost:3000). If the browser does not open, you can open it manually and visit the URL.

The page will reload if you make edits.

## Changing the Page `<title>`

You can find the source HTML file in the `public` folder of the generated project. You may edit the `<title>` tag in it to change the title from “Elm App” to anything else.

Note that normally you wouldn’t edit files in the `public` folder very often.
