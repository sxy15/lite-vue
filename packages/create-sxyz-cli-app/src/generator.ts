import fs from 'fs-extra';
import glob from 'fast-glob';
import chalk from 'chalk';
import { logger } from 'rslog';
import { prompt } from 'enquirer';
import { sep, join } from 'node:path';
import { CWD, GENERATOR_DIR } from './constant';

const PROMPTS = [
  {
    name: 'vueVersion',
    message: 'Select Vue version',
    type: 'select',
    choices: [
      {
        name: 'vue3',
        message: 'Vue 3',
      },
    ],
  },
  {
    name: 'preprocessor',
    message: 'Select css preprocessor',
    type: 'select',
    choices: ['Less', 'Sass'],
  },
];

export class Generator {
  outputDir: string = '';

  inputs = {
    name: '',
    cssLang: '',
    vueVersion: '',
    preprocessor: '',
  };

  constructor(name: string) {
    this.inputs.name = name;
    this.outputDir = join(CWD, name);
  }

  async run() {
    await this.prompting();
    this.writing();
    this.end();
  }

  async prompting() {
    return prompt<Record<string, string>>(PROMPTS).then((inputs) => {
      const preprocessor = inputs.preprocessor.toLowerCase();
      const cssLang = preprocessor === 'sass' ? 'scss' : preprocessor;

      this.inputs.cssLang = cssLang;
      this.inputs.vueVersion = inputs.vueVersion;
      this.inputs.preprocessor = preprocessor;
    });
  }

  writing() {
    logger.info(`Creating project in ${chalk.green(this.outputDir)}\n`);

    const templatePath = join(GENERATOR_DIR, this.inputs.vueVersion).replace(
      /\\/g,
      '/',
    );

    const templateFiles = glob.sync(join(templatePath, '**', '*'), {
      dot: true,
    });

    templateFiles.forEach((filePath) => {
      const outputPath = filePath
        .replace('.tpl', '')
        .replace(templatePath, this.outputDir);
      this.copyTpl(filePath, outputPath, this.inputs);
    });
  }

  copyTpl(from: string, to: string, args: Record<string, any>) {
    fs.copySync(from, to);
    let content = fs.readFileSync(to, 'utf-8');

    Object.keys(args).forEach((key) => {
      const reg = new RegExp(`<%=\\s*${key}\\s*>`, 'g');
      content = content.replace(reg, args[key]);
    });

    fs.writeFileSync(to, content);

    const name = to.replace(this.outputDir + sep, '');
    logger.success(`Generated ${chalk.green(name)}`);
  }

  end() {
    const { name } = this.inputs;

    logger.success(`Successfully created ${chalk.yellow(name)}.`);
    logger.success(
      `Run ${chalk.yellow(
        `cd ${name} && git init && pnpm i && pnpm run dev`,
      )} to start development!`,
    );
  }
}
