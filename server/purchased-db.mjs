// The only application access to the logical D1 binding. Schema is migration-owned.
export function purchasedStore(env) {
  if (!env?.DB?.prepare || !env.DB.batch) throw new Error('DB_UNAVAILABLE');
  const db = env.DB;
  function summary(product, browser) {
    return db.prepare(`SELECT COUNT(*) AS count,
      COALESCE(MAX(CASE WHEN browser_id = ? THEN 1 ELSE 0 END), 0) AS purchased
      FROM purchased_marks WHERE product_id = ?`).bind(browser, product);
  }
  function normalize(row) {
    if (!row || !Number.isSafeInteger(row.count) || row.count < 0) throw new Error('INVALID_DB_RESULT');
    return { count: row.count, purchased: row.purchased === 1 };
  }
  return {
    async get(product, browser) { return normalize(await summary(product, browser).first()); },
    async set(product, browser, purchased) {
      const change = purchased
        ? db.prepare('INSERT INTO purchased_marks (product_id, browser_id) VALUES (?, ?) ON CONFLICT(product_id, browser_id) DO NOTHING').bind(product, browser)
        : db.prepare('DELETE FROM purchased_marks WHERE product_id = ? AND browser_id = ?').bind(product, browser);
      // D1 batch is transactional: the response observes this desired-state change.
      const results = await db.batch([change, summary(product, browser)]);
      if (results.some(result => result.success === false)) throw new Error('DB_BATCH_FAILED');
      return normalize(results[1]?.results?.[0]);
    },
  };
}
