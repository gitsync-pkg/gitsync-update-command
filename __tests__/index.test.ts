import * as fs from 'fs';
import {createRepo, removeRepos, disableColor, runCommand, catchError} from '@gitsync/test';
import update from '..';

beforeAll(() => {
  disableColor();
});

afterAll(() => {
  removeRepos();
});

describe('update command', () => {
  test('run commit', async () => {
    const source = await createRepo();
    const target = await createRepo();

    await source.addFile('.gitsync.json', JSON.stringify({
      repos: [
        {
          paths: 'package-name',
          repo: target.dir,
        }
      ]
    }));

    await target.commitFile('test.txt');

    await runCommand(update, source, {
      dir: 'package-name',
    });

    expect(fs.existsSync(source.getFile('package-name/test.txt'))).toBeTruthy();
  });
});
