/**
 * Used to CRUD an entity from a configured DataSource
 */
export class EntityLoader {
    /**
     * @param {DataSource}
     * @param {object} config
     */
    constructor(dataSource, config = {}) {
        this.dataSource = dataSource;
        this.config = config;
    }
    setArea(name) {
        this.config.area = name;
    }
    setBundle(name) {
        this.config.bundle = name;
    }
    hasData() {
        return this.dataSource.hasData(this.config);
    }
    fetchAll() {
        if (!this.dataSource.fetchAll) {
            throw new Error(`fetchAll not supported by ${this.dataSource.name}`);
        }
        return this.dataSource.fetchAll(this.config);
    }
    fetch(id) {
        if (!this.dataSource.fetch) {
            throw new Error(`fetch not supported by ${this.dataSource.name}`);
        }
        return this.dataSource.fetch(this.config, id);
    }
    replace(data) {
        if (!this.dataSource.replace) {
            throw new Error(`replace not supported by ${this.dataSource.name}`);
        }
        return this.dataSource.replace(this.config, data);
    }
    update(id, data) {
        if (!this.dataSource.update) {
            throw new Error(`update not supported by ${this.dataSource.name}`);
        }
        return this.dataSource.update(this.config, id, data);
    }
    delete(id) {
        if (!this.dataSource.delete) {
            throw new Error(`delete not supported by ${this.dataSource.name}`);
        }
        return this.dataSource.delete(this.config, id);
    }
}
