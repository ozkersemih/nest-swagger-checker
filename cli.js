#!/usr/bin/env node
const automate = require('./automate.js');
const {resolve} = require("path");

const userPattern = process.argv[2];

automate.main({
  interactive: true,
  fileIncludePattern: userPattern ? `${resolve('./')}/${userPattern}` : undefined,
});
