import { stripTime } from './utils/dates';

export namespace cache {

  /**
   * The base Cache interface.
   *
   * The interface is limited to string keys and values for compatibility with cache types offered to Google Apps scripts:
   * https://developers.google.com/apps-script/reference/cache
   */
  export interface Cache<T> {

    put<K extends keyof T & string>(key: K, value: T[K]): void;

    get<K extends keyof T & string>(key: K): T[K] | undefined;
  }


  export class NullCache implements Cache<any> {

    put(key: string, value: any): void { }

    get(key: string): undefined { return undefined; }
  }
  export namespace NullCache {

    export const instance = new NullCache();
  }


  export abstract class ChainableCache<T> implements Cache<T> {

    constructor(protected underlyingCache: Cache<T>) { }

    put<K extends keyof T & string>(key: K, value: T[K]): void {
      this.underlyingCache.put(key, value);
      this.thisPut(key, value);
    }

    protected abstract thisPut<K extends keyof T & string>(key: K, value: T[K]): void;

    get<K extends keyof T & string>(key: K): T[K] | undefined {
      let result = this.thisGet(key);
      if (result === undefined) {
        result = this.underlyingCache.get(key);
        if (result !== undefined)
          this.thisPut(key, result);
      }
      return result;
    }

    protected abstract thisGet<K extends keyof T & string>(key: K): T[K] | undefined;
  }


  export let useDocumentCache = true;

  /**
   * Returns the default cache expiration timeout in seconds.
   *
   * The default is to invalidate the cache at the start of the next day (00:00:00 in local time).
   */
  function getDefaultCacheExpiration(): number {
    const now = new Date();
    let expirationDate = new Date(now);
    expirationDate.setDate(expirationDate.getDate() + 1);
    expirationDate = stripTime(expirationDate);
    const seconds = (expirationDate.valueOf() - now.valueOf()) / 1000;
    return seconds;
  }

  export class DocumentCache<T extends {[key: string]: string}> extends ChainableCache<T> {

    // NOTE: CacheService doesn't exist when running tests
    protected documentCache = typeof CacheService !== 'undefined' ? CacheService.getDocumentCache() : null;

    protected thisPut<K extends keyof T & string>(key: K, value: T[K]): void {
      if (useDocumentCache && this.documentCache)
        this.documentCache.put(key, value, getDefaultCacheExpiration());
    }

    protected thisGet<K extends keyof T & string>(key: K): T[K] | undefined {
      if (useDocumentCache && this.documentCache) {
        const result = this.documentCache.get(key);
        if (result != null)
          return result as T[K];
      }
      return undefined;
    }
  }

  export abstract class SerializingDocumentCache<T extends {[key: string]: unknown}> extends ChainableCache<T> {

    // NOTE: CacheService doesn't exist when running tests
    protected documentCache = typeof CacheService !== 'undefined' ? CacheService.getDocumentCache() : null;

    protected thisPut<K extends keyof T & string>(key: K, value: T[K]): void {
      if (useDocumentCache && this.documentCache)
        this.documentCache.put(key, this.serializeValue(key, value), getDefaultCacheExpiration());
    }

    protected thisGet<K extends keyof T & string>(key: K): T[K] | undefined {
      if (useDocumentCache && this.documentCache) {
        const result = this.documentCache.get(key);
        if (result != null)
          return this.deserializeValue(key, result);
      }
      return undefined;
    }

    protected abstract serializeValue<K extends keyof T & string>(key: K, value: T[K]): string;

    protected abstract deserializeValue<K extends keyof T & string>(key: K, serializedValue: string): T[K];
  }

  export class JsonDocumentCache<T extends {[key: string]: unknown}> extends SerializingDocumentCache<T> {

    protected serializeValue<K extends keyof T & string>(key: K, value: T[K]): string {
      return JSON.stringify(value);
    }

    protected deserializeValue<K extends keyof T & string>(key: K, serializedValue: string): T[K] {
      return JSON.parse(serializedValue);
    }
  }


  export class MemoryCache<T> extends ChainableCache<T> {

    private value: Partial<T>;

    constructor(underlyingCache: Cache<T>, initialValue: Partial<T>) {
      super(underlyingCache);
      this.value = initialValue;
    }

    protected thisPut<K extends keyof T & string>(key: K, value: T[K]): void {
      this.value[key] = value;
    }

    protected thisGet<K extends keyof T & string>(key: K): T[K] | undefined {
      return this.value[key];
    }
  }


  export function newDefaultCache<T extends {[key: string]: string}>(initialValue: Partial<T>) {
    return new MemoryCache<T>(
      new DocumentCache<T>(
        NullCache.instance,
      ),
      initialValue,
    )
  }

  export function newDefaultJsonCache<T extends {[key: string]: unknown}>(initialValue: Partial<T>) {
    return new MemoryCache<T>(
      new JsonDocumentCache<T>(
        NullCache.instance,
      ),
      initialValue,
    )
  }
}
