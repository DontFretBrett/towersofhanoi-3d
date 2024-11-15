export class ObjectPool {
  constructor(createFn, initialSize = 10) {
    this.createFn = createFn;
    this.pool = Array(initialSize).fill(null).map(() => ({
      object: this.createFn(),
      inUse: false
    }));
  }

  acquire() {
    let poolItem = this.pool.find(item => !item.inUse);
    if (!poolItem) {
      poolItem = {
        object: this.createFn(),
        inUse: false
      };
      this.pool.push(poolItem);
    }
    poolItem.inUse = true;
    return poolItem.object;
  }

  release(object) {
    const poolItem = this.pool.find(item => item.object === object);
    if (poolItem) {
      poolItem.inUse = false;
    }
  }
} 