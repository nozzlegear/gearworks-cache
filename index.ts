import * as Bluebird from 'bluebird';
import inspect from 'logspect';
import { Client } from 'catbox';
import CatboxMemory = require("catbox-memory");

const DefaultTTL = 60 * 60 * 1000; //60 minutes in milliseconds

const _client = new Client(CatboxMemory, {});

export interface CachedItem<T> {
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

/**
 * Async function that initializes the cache. Must be called before all other cache functions.
 */
export function initialize() {
    return new Bluebird<void>((res, rej) => {
        _client.start(error => {
            if (error) {
                inspect("Error starting cache client:", error);

                return rej(error);
            }

            return res();
        });
    });
}

/**
 * Async function that gets a value from the cache. Will return undefined if the value is not found.
 * @param segmentName Name of the segment that the value resides in, e.g. "auth-invalidation" or "recent-orders".
 * @param key Key/name of the value being retrieved.
 */
export function getValue<T>(segmentName: string, key: string) {
    return new Bluebird<CachedItem<T>>((resolve, reject) => {
        _client.get<T>({ id: key.toLowerCase(), segment: segmentName }, (error, value) => {
            if (error) {
                return reject(error);
            }

            return resolve(value || undefined);
        })
    })
}

/**
 * Async function that sets a value in the cache.
 * @param segmentName Name of the segment that the value will reside in, e.g. "auth-invalidation" or "recent-orders".
 * @param key Key/name of the value being set.
 * @param value Value to set in the cache. Must be json-serializable.
 * @param ttl (optional) Length of time that the value will reside in the cache, in milliseconds. Defaults to 60 minutes.
 */
export function setValue<T>(segmentName: string, key: string, value: T, ttl: number = DefaultTTL) {
    return new Bluebird<void>((resolve, reject) => {
        _client.set({ id: key.toLowerCase(), segment: segmentName }, value, ttl, (error) => {
            if (error) {
                return reject(error);
            }

            return resolve();
        })
    })
}

/**
 * Async function that deletes a value from the cache.
 * @param segmentName Name of the segment that the value resides in, e.g. "auth-invalidation" or "recent-orders".
 * @param key Key/name of the value being deleted.
 */
export function deleteValue<T>(segmentName: string, key: string) {
    return new Bluebird<void>((resolve, reject) => {
        _client.drop({ id: key.toLowerCase(), segment: segmentName }, (error) => {
            if (error) {
                return reject(error);
            }

            return resolve();
        });
    })
}