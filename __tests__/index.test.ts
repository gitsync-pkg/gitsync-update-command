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

  test('add tag prefix', async () => {
    const source = await createRepo();
    const target = await createRepo();

    await source.commitFile('.gitsync.json', JSON.stringify({
      repos: [
        {
          sourceDir: 'package-name',
          target: target.dir,
          addTagPrefix: '@test/test@',
        }
      ]
    }));

    await target.commitFile('test.txt');
    await target.run(['tag', '@test/test@0.1.0']);

    await runCommand(update, source, {
      sourceDir: 'package-name',
    });

    const tags = await source.run(['tag']);
    expect(tags).toContain('0.1.0');
  });

  test('remove tag prefix', async () => {
    const source = await createRepo();
    const target = await createRepo();

    await source.commitFile('.gitsync.json', JSON.stringify({
      repos: [
        {
          sourceDir: 'package-name',
          target: target.dir,
          removeTagPrefix: 'v',
        }
      ]
    }));

    await target.commitFile('test.txt');
    await target.run(['tag', '0.1.0']);

    await runCommand(update, source, {
      sourceDir: 'package-name',
    });

    const tags = await source.run(['tag']);
    expect(tags).not.toContain('v0.1.0');
  });

  test('add and remove tag prefix', async () => {
    const source = await createRepo();
    const target = await createRepo();

    await source.commitFile('.gitsync.json', JSON.stringify({
      repos: [
        {
          sourceDir: 'package-name',
          target: target.dir,
          addTagPrefix: 'v',
          removeTagPrefix: '@test/test@',
        }
      ]
    }));

    await target.commitFile('test.txt');
    await target.run(['tag', 'v0.1.0']);

    await runCommand(update, source, {
      sourceDir: 'package-name',
    });

    const tags = await source.run(['tag']);
    expect(tags).toContain('@test/test@0.1.0');
    expect(tags).not.toContain('v0.1.0');
  });
});
