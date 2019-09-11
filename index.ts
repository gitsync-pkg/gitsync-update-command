import * as fs from 'fs';
import {Arguments, CommandModule} from 'yargs';
import Sync from '@gitsync/sync';
import {Config, ConfigRepo} from '@gitsync/config';

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

  const repo: ConfigRepo = config.getRepoBySourceDir(argv.sourceDir);
  const target = config.getRepoDir(repo.target);
  if (!fs.existsSync(target)) {
    // TODO clone if not exists
    throw new Error(`Target ${repo.target}, directory ${target} does not exists`);
  }

  const cwd = process.cwd();
  process.chdir(target);

  if (!repo.targetDir) {
    repo.targetDir = '.';
  }
  [repo.sourceDir, repo.targetDir] = [repo.targetDir, repo.sourceDir];
  repo.target = cwd;
  console.log('repo', repo);

  const sync = new Sync();
  await sync.sync(Object.assign({
    $0: '',
    _: []
  }, repo));

  process.chdir(cwd);
}

export default command;
