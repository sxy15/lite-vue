import { Command } from 'commander';
import { cliVersion } from './index.js';

const program = new Command();

program.version(`@sxyz/cli ${cliVersion}`);

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
  .command('commit-lint <gitParams>')
  .description('lint commit message')
  .action(async (gitParams) => {
    const { commitLint } = await import('./commands/commit-lint.js');
    return commitLint(gitParams);
  });

program.parse();
