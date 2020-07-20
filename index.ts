import {Arguments, CommandModule} from 'yargs';
import Sync from '@gitsync/sync';
import {Config, ConfigRepo} from '@gitsync/config';
import log from "@gitsync/log";
import theme from "chalk-theme";

interface UpdateArguments extends Arguments {
  sourceDir: string
  include: string[]
  exclude: string[]
  yes?: boolean
}

let command: CommandModule = {
  handler: () => {
  }
};

command.command = 'update [source-dir]';

command.describe = 'Sync the commits from relative repository to current repository';

command.builder = {
  'source-dir': {
    describe: 'Include only source directory matching the given glob, use --include if require multi globs',
    default: '',
    type: 'string',
  },
  include: {
    describe: 'Include only source directory matching the given glob',
    default: [],
    type: 'array',
  },
  exclude: {
    describe: 'Exclude source directory matching the given glob',
    default: [],
    type: 'array',
  },
  yes: {
    describe: 'Whether to skip confirm or not',
    alias: 'y',
    type: 'boolean',
  }
};

command.handler = async (argv: UpdateArguments) => {
  argv.include || (argv.include = []);
  argv.exclude || (argv.exclude = []);

  const config = new Config();
  config.checkFileExist();

  if (argv.sourceDir) {
    // Remove trailing slash, this is useful on OS X and some Linux systems (like CentOS),
    // because they will automatic add trailing slash when completing a directory name by default
    if (argv.sourceDir !== '/' && argv.sourceDir.endsWith('/')) {
      argv.sourceDir = argv.sourceDir.slice(0, -1);
    }
    argv.include.push(argv.sourceDir);
  }

  const repos = config.filterReposBySourceDir(argv.include, argv.exclude);

  // Tell `gitsync post-commit` to skip
  process.env.GITSYNC_UPDATE = '1';

  for (const repo of repos) {
    try {
      log.info(`Update from ${theme.info(repo.sourceDir)}`);

      const cwd = process.cwd();
      const repoDir = await config.getRepoDirByRepo(repo, true);
      process.chdir(repoDir);

      if (!repo.targetDir) {
        repo.targetDir = '.';
      }
      [repo.sourceDir, repo.targetDir] = [repo.targetDir, repo.sourceDir];
      [repo.addTagPrefix, repo.removeTagPrefix] = [repo.removeTagPrefix, repo.addTagPrefix];
      repo.target = cwd;
      repo.yes = argv.yes;
      repo.plugins = config.getRepoPlugins(repo.plugins);

      const sync = new Sync();
      await sync.sync(repo);

      process.chdir(cwd);
    } catch (e) {
      process.exitCode = 1;
      log.error(`Sync fail: ${e.message}`);
    }
  }

  delete process.env.GITSYNC_UPDATE;

  log.info('Done!');
}

export default command;
