import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test('README contains the progressive user and developer guide', () => {
  for (const heading of [
    '## \u529f\u80fd\u7279\u8272',
    '## \u5feb\u901f\u5f00\u59cb',
    '## \u64cd\u4f5c\u6559\u7a0b',
    '## \u72b6\u6001\u53c2\u8003',
    '## JavaScript API',
    '## \u63a5\u5165 Codex \u6216\u5176\u4ed6\u4efb\u52a1\u7cfb\u7edf',
    '## \u7d20\u6750\u4e0e\u5b9a\u5236',
    '## \u9879\u76ee\u7ed3\u6784',
    '## \u5e38\u89c1\u95ee\u9898',
    '## \u9690\u79c1\u4e0e\u7248\u6743'
  ]) {
    assert.match(readme, new RegExp(heading));
  }
});

test('README documents the complete public API and state contract', () => {
  for (const api of ['window.ceciliaPet', 'setState(state)', 'startDemo()', 'stopDemo()', 'state']) {
    assert.ok(readme.includes(api), `missing API documentation: ${api}`);
  }
  for (const state of ['idle', 'thinking', 'coding', 'success', 'error', 'sleeping', 'clicked']) {
    assert.ok(readme.includes(`\`${state}\``), `missing state documentation: ${state}`);
  }
  assert.match(readme, /\u6210\u529f\u8fd4\u56de `true`/);
  assert.match(readme, /\u672a\u77e5\u72b6\u6001\u8fd4\u56de `false`/);
  assert.match(
    readme,
    /`clicked` \u662f\u5185\u90e8\u4ea4\u4e92\u72b6\u6001.*?window\.ceciliaPet\.setState\('clicked'\).*?\u8fd4\u56de `false`/s
  );
});

test('README is portable and documents validation, fallback, privacy, and rights', () => {
  assert.doesNotMatch(readme, /(?:^|[\s`("'=])(?:[A-Za-z]:[\\/]|\/(?:home|Users)\/[^/\s`)}\]]+(?:\/[^\s`)}\]]*)?)/);
  assert.match(readme, /assets\/pet\/cecilia-idle\.png/);
  assert.match(readme, /npm run serve/);
  assert.match(readme, /npm test/);
  assert.match(readme, /\u56de\u9000\u5230 `cecilia-idle\.png`/);
  assert.match(readme, /\u4e0d\u4f1a\u8bfb\u53d6 Codex \u7684\u79c1\u4eba\u4efb\u52a1\u3001\u8d26\u53f7\u3001\u804a\u5929\u5185\u5bb9\u6216\u526a\u8d34\u677f/);
  assert.match(readme, /\u4e0d\u9644\u5e26\u5f00\u6e90\u8bb8\u53ef\u8bc1/);
});
