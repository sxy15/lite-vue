#!/usr/bin/env node
import { logger } from 'rslog';
import { prompt } from 'enquirer';
import { ensureDir } from 'fs-extra';
import { Generator } from './generator';

async function run() {
  const { name } = await prompt<{ name: string }>({
    type: 'input',
    name: 'name',
    message: 'Your package name:',
  });

  try {
    await ensureDir(name);
    const generator = new Generator(name);
    await generator.run();
  } catch (err) {
    logger.error(err);
  }
}

run();
