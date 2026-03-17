export class TTLCache {
  constructor(defaultTtlMs) {
    this.defaultTtlMs = defaultTtlMs;
    this.store = new Map();
    this.inflight = new Map();
  }

  get(key) {
    const record = this.store.get(key);

    if (!record) {
      return undefined;
    }

    if (record.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }

    return record.value;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });

    return value;
  }

  async remember(key, factory, ttlMs = this.defaultTtlMs) {
    const cachedValue = this.get(key);

    if (cachedValue !== undefined) {
      return {
        value: cachedValue,
        cached: true
      };
    }

    if (this.inflight.has(key)) {
      const value = await this.inflight.get(key);
      return {
        value,
        cached: true
      };
    }

    const promise = Promise.resolve()
      .then(factory)
      .then((value) => {
        this.set(key, value, ttlMs);
        this.inflight.delete(key);
        return value;
      })
      .catch((error) => {
        this.inflight.delete(key);
        throw error;
      });

    this.inflight.set(key, promise);

    const value = await promise;

    return {
      value,
      cached: false
    };
  }
}
