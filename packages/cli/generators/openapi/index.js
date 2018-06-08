// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const BaseGenerator = require('../../lib/base-generator');
const loadApiSpec = require('./spec-loader');
const {
  debug,
  debugJson,
  getControllerFileName,
  generateControllerSpecs,
  validateUrlOrFile,
} = require('./spec-helper');

const utils = require('../../lib/utils');
const updateIndex = require('../../lib/update-index');

module.exports = class OpenApiGenerator extends BaseGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.argument('url', {
      description: 'URL or file path of the openapi spec',
      required: false,
      type: String,
    });
    return super._setupGenerator();
  }

  checkLoopBackProject() {
    return super.checkLoopBackProject();
  }

  async askForSpecUrlOrPath() {
    const prompts = [
      {
        name: 'url',
        message: 'Enter the openapi spec url or file path:',
        default: this.url,
        validate: validateUrlOrFile,
        when: this.url == null,
      },
    ];
    const answers = await this.prompt(prompts);
    this.url = answers.url.trim();
  }

  async loadAndBuildSpec() {
    try {
      const spec = await loadApiSpec(this.url, this.log);
      debugJson('OpenAPI spec', spec);
      this.apiSpec = spec;
      this.controllerSpecs = generateControllerSpecs(this.apiSpec);
    } catch (e) {
      this.exit(e);
    }
  }

  async selectControllers() {
    const choices = this.controllerSpecs.map(c => {
      return {
        name: c.tag ? `[${c.tag}] ${c.className}` : c.className,
        value: c.className,
        checked: true,
      };
    });
    const prompts = [
      {
        name: 'controllerSelections',
        message: 'Select controllers to be generated:',
        type: 'checkbox',
        choices: choices,
      },
    ];
    const selections =
      (await this.prompt(prompts)).controllerSelections ||
      choices.map(c => c.value);
    this.selectedControllers = this.controllerSpecs.filter(c =>
      selections.some(a => a === c.className),
    );
    this.selectedControllers.forEach(
      c => (c.fileName = getControllerFileName(c.tag || c.className)),
    );
  }

  async scaffold() {
    if (this.shouldExit()) return false;
    const source = this.templatePath(
      'src/controllers/controller-template.ts.ejs',
    );

    this.controllerFiles = [];
    for (const c of this.selectedControllers) {
      const controllerFile = c.fileName;
      if (debug.enabled) {
        debug(`Artifact output filename set to: ${controllerFile}`);
      }
      const dest = this.destinationPath(`src/controllers/${controllerFile}`);

      if (debug.enabled) {
        debug('Copying artifact to: %s', dest);
      }
      this.fs.copyTpl(source, dest, c, {}, {globOptions: {dot: true}});
    }
  }

  async end() {
    const targetDir = this.destinationPath(`src/controllers`);
    for (const c of this.selectedControllers) {
      // Check all files being generated to ensure they succeeded
      const status = this.conflicter.generationStatus[c.fileName];
      if (status !== 'skip' && status !== 'identical') {
        await updateIndex(targetDir, c.fileName);
      }
    }
    await super.end();
  }
};
