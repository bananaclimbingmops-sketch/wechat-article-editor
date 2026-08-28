import { describe, expect, it } from 'vitest';
import {
  commitHistory,
  createHistory,
  redoHistory,
  undoHistory,
} from '../src/features/history/articleHistory';

describe('文章操作历史', () => {
  it('可以依次撤回和重做文章修改', () => {
    let history = createHistory({ title: '初始' });
    history = commitHistory(history, { title: '第一次修改' }, { timestamp: 1 });
    history = commitHistory(history, { title: '第二次修改' }, { timestamp: 2 });

    history = undoHistory(history);
    expect(history.present.title).toBe('第一次修改');
    expect(history.future).toHaveLength(1);

    history = redoHistory(history);
    expect(history.present.title).toBe('第二次修改');
    expect(history.future).toHaveLength(0);
  });

  it('连续输入会合并为一次可撤回操作', () => {
    let history = createHistory({ text: '' });
    history = commitHistory(history, { text: '开' }, { key: 'block:intro', timestamp: 100 });
    history = commitHistory(history, { text: '开学' }, { key: 'block:intro', timestamp: 500 });
    history = commitHistory(history, { text: '开学季' }, { key: 'block:intro', timestamp: 900 });

    expect(history.past).toHaveLength(1);
    expect(undoHistory(history).present.text).toBe('');
  });

  it('撤回后产生新修改会清空重做分支', () => {
    let history = createHistory({ value: 0 });
    history = commitHistory(history, { value: 1 });
    history = commitHistory(history, { value: 2 });
    history = undoHistory(history);
    expect(history.future).toHaveLength(1);

    history = commitHistory(history, { value: 3 });
    expect(history.present.value).toBe(3);
    expect(history.future).toHaveLength(0);
  });
});
