import * as Cache from './';
import inspect from 'logspect';
import {
    AsyncTest,
    Expect,
    TestFixture,
    Timeout,
    AsyncSetup
    } from 'alsatian';

interface TestObject {
    foo: string;
    bar: number;
    baz: boolean;
}

@TestFixture("gearworks-cache")
export class GearworksCacheTestFixture {
    private get Value(): TestObject {
        return {
            foo: "Hello world!",
            bar: 117,
            baz: true
        }
    }

    private get SegmentName() {
        return "test-segment";
    }

    private get Key() {
        return "foo-key";
    }

    @AsyncSetup
    public async setup() {
        await Cache.initialize();
    }

    @AsyncTest(".initialize")
    @Timeout(5000)
    public async initializeTest() {
        let error;

        try {
            await Cache.initialize();
        } catch (e) {
            inspect("Error initializing:", e);

            error = e;
        }

        Expect(error).not.toBeDefined();
    }

    @AsyncTest(".setCacheValue")
    @Timeout(5000)
    public async setCacheValueTest() {
        let error;
        
        try {
            await Cache.setValue(this.SegmentName, this.Key, this.Value)
        } catch (e) {
            inspect("Error setting cache value:", e);

            error = e;
        }

        Expect(error).not.toBeDefined();
    }

    @AsyncTest(".getCacheValue")
    @Timeout(5000)
    public async getCacheValueTest() {
        await Cache.setValue(this.SegmentName, this.Key, this.Value);

        let value: Cache.CachedItem<TestObject>;
        let error;

        try {
            value = await Cache.getValue<TestObject>(this.SegmentName, this.Key);
        } catch (e) {
            inspect("Error getting cache value:", e);

            error = e;
        }

        Expect(error).not.toBeDefined();
        Expect(value).toBeDefined();
        Expect(value).not.toBeNull();
        Expect(value.stored).toBeGreaterThan(0);
        Expect(value.ttl).toBeGreaterThan(0);
        Expect(value.item.foo).toEqual(this.Value.foo);
        Expect(value.item.bar).toEqual(this.Value.bar);
        Expect(value.item.baz).toEqual(this.Value.baz);
    }

    @AsyncTest(".deleteCacheValue")
    @Timeout(5000)
    public async deleteCacheValueTest() {
        await Cache.setValue(this.SegmentName, this.Key, this.Value);

        let value: Cache.CachedItem<TestObject>;
        let error;

        try {
            await Cache.deleteValue(this.SegmentName, this.Key);
        } catch (e) {
            inspect("Error deleting cache value:", e);

            error = e;
        }

        Expect(error).not.toBeDefined();

        // If the value doesn't exist then this function returns undefined.
        value = await Cache.getValue<TestObject>(this.SegmentName, this.Key);

        Expect(value).not.toBeDefined();
    }
}