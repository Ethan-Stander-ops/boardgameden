import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, shareReplay, tap } from "rxjs/operators";
import { Product } from "src/models/Product";

export interface Paged<T> {
  page: number;
  pageSize: number;
  total: number;
  items: Product[];
}

@Injectable({ providedIn: 'root' })
export class BoardAPIService {
  constructor(private http: HttpClient) {
    const savedKey = sessionStorage.getItem(this.STORAGE_ACTIVE_KEY);
    if (savedKey) {
      const saved = sessionStorage.getItem(this.cacheStorageKey(savedKey));
      const savedTime = sessionStorage.getItem(this.cacheTimeKey(savedKey));
      if (saved && savedTime) {
        try {
          const obj = JSON.parse(saved) as Paged<Product>;
          const t = Number(savedTime);
          if (obj && Number.isFinite(t)) {
            this.cache.set(savedKey, obj);
            this.cacheTime.set(savedKey, t);
            this.lastKey = savedKey;
          }
        } catch {}
      }
    }
  }

  private baseUrl = '/api/boardgames';

  private cache = new Map<string, Paged<Product>>();
  private cacheTime = new Map<string, number>();
  private cacheDuration = 5 * 60 * 1000;

  private InProgress$?: Observable<Paged<Product>>;
  readonly loading$ = new BehaviorSubject<boolean>(false);
  private _servedFromCache = false;
  get servedFromCache() { return this._servedFromCache; }

  private lastKey: string | null = null;

  private readonly STORAGE_ACTIVE_KEY = 'boardgames_active_cache_key';

  private cacheStorageKey(key: string) { return `boardgames_cache_${key}`; }
  private cacheTimeKey(key: string) { return `boardgames_cache_time_${key}`; }

  getBoardGames(page = 1, pageSize = 20, search = '', forceRefresh = false): Observable<Paged<Product>> {
    const key = `${page}|${pageSize}|${(search || '').trim().toLowerCase()}`;
    const now = Date.now();

    const hit = this.cache.get(key);
    const t = this.cacheTime.get(key) ?? 0;
    if (!forceRefresh && hit && (now - t) < this.cacheDuration) {
      this._servedFromCache = true;
      this.lastKey = key;
      return of(hit);
    }

    if (this.InProgress$ && this.lastKey === key) {
      this._servedFromCache = false;
      return this.InProgress$;
    }

    this._servedFromCache = false;
    this.loading$.next(true);

    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('search', search || '');

    this.InProgress$ = this.http.get<Paged<Product>>(this.baseUrl, { params }).pipe(
      tap(res => {
        this.cache.set(key, res);
        this.cacheTime.set(key, Date.now());
        this.lastKey = key;
        try {
          sessionStorage.setItem(this.STORAGE_ACTIVE_KEY, key);
          sessionStorage.setItem(this.cacheStorageKey(key), JSON.stringify(res));
          sessionStorage.setItem(this.cacheTimeKey(key), String(Date.now()));
        } catch {}
      }),
      catchError(() => of({ page, pageSize, total: 0, items: [] as Product[] })),
      finalize(() => {
        this.loading$.next(false);
        this.InProgress$ = undefined;
      }),
      shareReplay(1)
    );

    return this.InProgress$;
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheTime.clear();
    const active = sessionStorage.getItem(this.STORAGE_ACTIVE_KEY);
    if (active) {
      sessionStorage.removeItem(this.cacheStorageKey(active));
      sessionStorage.removeItem(this.cacheTimeKey(active));
    }
    sessionStorage.removeItem(this.STORAGE_ACTIVE_KEY);
  }

  setCacheDuration(ms: number): void { this.cacheDuration = ms; }
}
