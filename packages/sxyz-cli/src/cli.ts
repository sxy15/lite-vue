import { Command } from 'commander';
import { cliVersion } from './index.js';

const program = new Command();

program.version(`@sxyz/cli ${cliVersion}`);

program
  .command('dev')
  .description('Run dev server')
  .action(async () => {
    const { dev } = await import('./commands/dev.js');
    return dev();
  });

program
  .command('release')
  .description('Compile components and release it')
  .option('--tag <tag>', 'Release tag')
  .option('--gitTag', 'Generate git tag')
  .action(async (option) => {
    const { release } = await import('./commands/release.js');
    return release(option);
  });

program
  .command('build')
  .description('Compile components in production mode')
  .action(async () => {
    const { build } = await import('./commands/build.js');
    return build();
  });

program
  .command('build-site')
  .description('Compile site in production mode')
  .action(async () => {
    const { buildSite } = await import('./commands/build-site.js');
    return buildSite();
  });

program
  .command('lint')
  .description('Run lint')
  .action(async () => {
    const { lint } = await import('./commands/lint.js');
    return lint();
  });

program
  .command('commit-lint <gitParams>')
  .description('lint commit message')
  .action(async (gitParams) => {
    const { commitLint } = await import('./commands/commit-lint.js');
    return commitLint(gitParams);
  });

program.parse();
