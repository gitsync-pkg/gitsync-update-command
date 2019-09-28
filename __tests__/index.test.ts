import * as fs from 'fs';
import {RepoManager, runCommand} from '@gitsync/test';
import update from '..';

const {createRepo, removeRepos} = new RepoManager();

describe('update command', () => {
  afterAll(async () => {
    await removeRepos();
  });

  test('run commit', async () => {
    const source = await createRepo();
    const target = await createRepo();

    await source.commitFile('.gitsync.json', JSON.stringify({
      repos: [
        {
          sourceDir: 'package-name',
          target: target.dir,
        }
      ]
    }));

    await target.commitFile('test.txt');

    await runCommand(update, source, {
      sourceDir: 'package-name',
    });

    expect(fs.existsSync(source.getFile('package-name/test.txt'))).toBeTruthy();
  });
});
