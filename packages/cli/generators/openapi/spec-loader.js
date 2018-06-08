// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const chalk = require('chalk');
const SwaggerParser = require('swagger-parser');

/**
 * Load swagger specs from the given url or file path; handle yml or json
 * @param {String} specUrlStr The url or file path to the swagger spec
 * @param cb
 */
async function loadSpec(specUrlStr, log) {
  log(chalk.blue('Loading ' + specUrlStr + '...'));
  const parser = new SwaggerParser();
  return await parser.dereference(specUrlStr);
}

module.exports = loadSpec;
