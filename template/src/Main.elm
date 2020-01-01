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

import Html exposing (text, div, img)
import Html.Attributes exposing (src, width, height)
import AppEnv exposing (..)


-- The main value manages what gets displayed on the page.

main =
  div [] [
      text ("Your " ++ appName ++ " is working!"),
      img [ src "./../assets/elm-logo.svg", width 300, height 300] []
    ]