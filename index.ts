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
  const repoDir = await config.getRepoDirByRepo(repo, true);

  const cwd = process.cwd();
  process.chdir(repoDir);

  if (!repo.targetDir) {
    repo.targetDir = '.';
  }
  [repo.sourceDir, repo.targetDir] = [repo.targetDir, repo.sourceDir];
  repo.target = cwd;

  const sync = new Sync();
  await sync.sync(Object.assign({
    $0: '',
    _: []
  }, repo));

  process.chdir(cwd);
}

export default command;
