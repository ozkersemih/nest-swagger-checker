#!/usr/bin/env node
const automate = require('./automate.js');

const userPattern = process.argv[2];

automate.main({
  interactive: true,
  fileIncludePattern: userPattern ? `${path.resolve('./')}/${userPattern}` : undefined,
});
