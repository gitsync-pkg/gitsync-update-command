import {Arguments, CommandModule} from 'yargs';
import Sync from '@gitsync/sync';
import {Config} from '@gitsync/config';

interface UpdateArguments extends Arguments {
  dir: string
}

let command: CommandModule = {
  handler: () => {
  }
};

command.command = 'update <dir>';

command.describe = 'Sync the commits from relative repository to current repository';

command.builder = {
  dir: {
    describe: 'The subdirectory in current repository',
  }
};

command.handler = async (argv: UpdateArguments) => {
  const config = new Config();
  const target: string = config.getRepoByDir(argv.dir);

  const cwd = process.cwd();
  process.chdir(target);

  const sync = new Sync();
  await sync.sync({
    $0: '',
    _: [],
    target: cwd,
    sourceDir: '.',
    targetDir: argv.dir,
  });

  process.chdir(cwd);
}

export default command;
