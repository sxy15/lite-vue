import { Command } from 'commander';
import { cliVersion } from './index.js';

const program = new Command();

program.version(`@mumu/cli ${cliVersion}`);

program
  .command('commit-lint <gitParams>')
  .description('lint commit message')
  .action(async (gitParams) => {
    const { commitLint } = await import('./commands/commit-lint.js');
    return commitLint(gitParams);
  });

program.parse();
