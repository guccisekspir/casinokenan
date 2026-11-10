/** Oyuncunun boss başına en iyi sonucu. Tarayıcıda saklanır. */
export interface BossRecord {
  /** Aldığı en yüksek çarpan. */
  best: number;
  /** Max win'i en az bir kez aldı mı. */
  max: boolean;
}

const KEY = 'slot-dayagi-records';

export function getRecords(): Record<string, BossRecord> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') ?? {};
  } catch {
    return {};
  }
}

export function recordResult(id: string, x: number, max: boolean) {
  const all = getRecords();
  const cur = all[id] ?? { best: 0, max: false };
  all[id] = { best: Math.max(cur.best, x), max: cur.max || max };
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* depolama kapalı olabilir */
  }
}
