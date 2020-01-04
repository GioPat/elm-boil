-- This is how you write single-line comments in Elm.
{-
   This is how you
   write multi-line comments
   in Elm.
-}
-- This is how you declare what your module name is and what values it exports.
-- We've chosen to name our module Main and we are exporting the value main that
-- we have defined below.


module Main exposing (main)

-- We're importing the Html module the text value available in our file, so we
-- can just reference it if we want.

import Html exposing (Html, div, h1, text, img)
import Html.Attributes exposing (src, width, height, class, id)
import AppEnv exposing (appName)


-- The main value manages what gets displayed on the page.
main : Html msg
main =
  div [] [
      h1 [ class "main-header" ] [ text ("Your " ++ appName ++ " is working great!") ],
      img [ id "spinner", src "./assets/elm-logo.svg", width 300, height 300] []
    ]