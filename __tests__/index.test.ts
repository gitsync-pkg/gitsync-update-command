import * as fs from 'fs';
import {createRepo, runCommand} from '@gitsync/test';
import update from '..';

describe('update command', () => {
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
