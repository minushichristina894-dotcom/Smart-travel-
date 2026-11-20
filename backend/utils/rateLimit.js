const buckets = new Map();

function allowRequest(key, { windowMs, max } = {}) {
  const now = Date.now();
  const previous = buckets.get(key) || [];
  const fresh = previous.filter((ts) => now - ts < windowMs);
  if (fresh.length >= max) {
    buckets.set(key, fresh);
    return false;
  }
  fresh.push(now);
  buckets.set(key, fresh);
  return true;
}

function resetRateLimits() {
  buckets.clear();
}

module.exports = { allowRequest, resetRateLimits };
