import {Arguments, CommandModule} from 'yargs';
import Sync from '@gitsync/sync';
import {Config} from '@gitsync/config';

interface UpdateArguments extends Arguments {
  sourceDir: string
}

let command: CommandModule = {
  handler: () => {
  }
};

command.command = 'update <source-dir>';

command.describe = 'Sync the commits from relative repository to current repository';

command.builder = {
  dir: {
    describe: 'The subdirectory in current repository',
  }
};

command.handler = async (argv: UpdateArguments) => {
  const config = new Config();
  config.checkFileExist();

  const target: string = config.getRepoByDir(argv.sourceDir);

  const cwd = process.cwd();
  process.chdir(target);

  const sync = new Sync();
  await sync.sync({
    $0: '',
    _: [],
    target: cwd,
    sourceDir: '.',
    targetDir: argv.sourceDir,
  });

  process.chdir(cwd);
}

export default command;
