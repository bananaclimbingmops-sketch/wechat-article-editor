export type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
  lastCommit?: {
    key: string;
    timestamp: number;
  };
};

export type HistoryCommitOptions = {
  key?: string;
  timestamp?: number;
};

export const HISTORY_LIMIT = 100;
export const HISTORY_COALESCE_WINDOW_MS = 700;

export function createHistory<T>(initial: T): HistoryState<T> {
  return { past: [], present: initial, future: [] };
}

export function commitHistory<T>(state: HistoryState<T>, next: T, options: HistoryCommitOptions = {}): HistoryState<T> {
  if (Object.is(state.present, next)) return state;

  const timestamp = options.timestamp ?? Date.now();
  const shouldCoalesce = Boolean(
    options.key
    && state.lastCommit?.key === options.key
    && timestamp - state.lastCommit.timestamp <= HISTORY_COALESCE_WINDOW_MS,
  );
  const past = shouldCoalesce
    ? state.past
    : [...state.past, state.present].slice(-HISTORY_LIMIT);

  return {
    past,
    present: next,
    future: [],
    lastCommit: options.key ? { key: options.key, timestamp } : undefined,
  };
}

export function undoHistory<T>(state: HistoryState<T>): HistoryState<T> {
  const previous = state.past.at(-1);
  if (previous === undefined) return state;
  return {
    past: state.past.slice(0, -1),
    present: previous,
    future: [state.present, ...state.future].slice(0, HISTORY_LIMIT),
  };
}

export function redoHistory<T>(state: HistoryState<T>): HistoryState<T> {
  const next = state.future[0];
  if (next === undefined) return state;
  return {
    past: [...state.past, state.present].slice(-HISTORY_LIMIT),
    present: next,
    future: state.future.slice(1),
  };
}
