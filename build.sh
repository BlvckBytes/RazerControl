#!/bin/bash

# Package the app for Mac App Store (.app format), overwrite if exists
electron-packager . --platform=mas --overwrite
