# gearworks-cache
A simple in-memory cache used by Gearworks-based Shopify apps, backed by catbox and catbox-memory. [Gearworks](https://github.com/nozzlegear/gearworks) is the best way to get started with building Shopify applications!

## Installing

You can install this package from NPM with the NPM CLI or with Yarn (recommended):

```bash
# With NPM
npm install gearworks-cache --save

# With Yarn
yarn add gearworks-cache
```

## Importing

You can import the cache helpers either one function at a time, or all at once, via require or TypeScript's import:

```typescript
// Import all functions
import * as Cache from "gearworks-cache";

// Import just one function
import { setCacheValue } from "gearworks-cache";

// Import all functions via Node's require:
const Cache = require("gearworks-cache");

// Import just one function via Node's require:
const setCacheValue = require("gearworks-cache").setCacheValue;
```

## Async and Promises

All functions in `gearworks-cache` return Bluebird promises. If you're using TypeScript *or* transpiling your JS via Babel, you can use `await` to wait for the promise to run.

```typescript
// Wait for the promise with TypeScript/ES6 async/await:
await cache.initialize();

// Or wait for the promise with .then:
cache.initialize().then(() => {
    // Cache has been initialized.
})
```

## Usage

#### initialize(): Promise\<void\>

The cache must be initialized at application startup (or at least before you attempt to use any other function).

```typescript
await Cache.initialize();
```

#### setValue\<T\>(segmentName: string, key: string, value: \<T\>, ttl: number = 3600000): Promise\<void\>

Async function that saves the given value to the cache.

`segmentName`: Name of the segment that the value will reside in, e.g. "auth-invalidation" or "recent-orders".
`key`: Key/name of the value being set.
`value`: Value to set in the cache. Must be json-serializable.
`ttl`: (optional) Length of time that the value will reside in the cache, in milliseconds. Defaults to 60 minutes.

```typescript
const key = "key_that_can_be_used_to_lookup_value";
const value = {
    foo: "bar"
}
// 24 hours (60 minutes * 60 seconds * 1000 milliseconds * 24 hours).
const time = 60 * 60 * 1000 * 24; 

await Cache.setValue("foo-segment", key, value, time);
```

#### getValue\<T\>(segmentName: string, key: string): Promise\<CachedItem\<T\>\>

Async function that gets a value from the cache. Will return undefined if the value is not found.

`segmentName`: Name of the segment that the value resides in, e.g. "auth-invalidation" or "recent-orders".
`key`: Key/name of the value being retrieved.

```typescript
const key = "key_that_can_be_used_to_lookup_value";
const cachedItem = await Cache.getValue<{foo: string}>("foo-segment", key);
const value = cachedItem.item;
```

Returns a `CachedItem<T>` with the following interface: 

```typescript
interface CachedItem<T> {
    /**
     * The item's value.
     */
    item: T;

    /**
     * The timestamp when the item was stored in the cache (in milliseconds).
     */
    stored: number;

    /**
     * The remaining time-to-live (not the original value used when storing the object).
     */
    ttl: number;
}
```

#### deleteValue(segmentName: string, key: string): Promise\<void\>

Async function that deletes a value from the cache.

`segmentName`: Name of the segment that the value resides in, e.g. "auth-invalidation" or "recent-orders".
`key`: Key/name of the value being deleted.

```typescript
const key = "key_that_can_be_used_to_lookup_value";

await Cache.deleteValue("foo-segment", key);
```