import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Subject } from 'rxjs';
import {
  AddCareNeedList,
  CareNeedList,
  EditCareNeedList,
  RemoveCareNeedList,
} from '../../shared/interfaces/care-need';
import { StorageService } from '../../shared/services/storage.service';

export interface CareNeedState {
  careNeedLists: CareNeedList[];
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class CareNeedService {
  private storageService = inject(StorageService);

  //state
  public state = signal<CareNeedState>({
    careNeedLists: [],
    loaded: false,
    error: null,
  });

  //selectors
  careNeed = computed(() => this.state().careNeedLists);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  //sources
  private careNeedListsLoaded$ = this.storageService.loadCareNeedLists();
  add$ = new Subject<AddCareNeedList>();
  edit$ = new Subject<EditCareNeedList>();
  remove$ = new Subject<RemoveCareNeedList>();

  constructor() {
    this.careNeedListsLoaded$.pipe(takeUntilDestroyed()).subscribe({
      next: (careNeedLists) =>
        this.state.update((state) => ({
          ...state,
          careNeedLists,
          loaded: true,
        })),
      error: (err) =>
        this.state.update((state) => ({
          ...state,
          error: err,
        })),
    });

    this.add$.pipe(takeUntilDestroyed()).subscribe((careNeedList) => {
      this.state.update((state) => ({
        ...state,
        careNeedLists: [
          ...state.careNeedLists,
          this.addIdToCareNeedList(careNeedList),
        ],
      }));
    });

    this.remove$.pipe(takeUntilDestroyed()).subscribe((id) =>
      this.state.update((state) => ({
        ...state,
        careNeedLists: state.careNeedLists.filter(
          (careNeedList) => careNeedList.id !== id
        ),
      }))
    );

    this.edit$.pipe(takeUntilDestroyed()).subscribe((update) =>
      this.state.update((state) => ({
        ...state,
        careNeedLists: state.careNeedLists.map((careNeedList) =>
          careNeedList.id === update.id
            ? { ...careNeedList, title: update.data.title }
            : careNeedList
        ),
      }))
    );

    effect(() => {
      if (this.loaded()) {
        console.log('effect');
      }
    });
  }

  private addIdToCareNeedList(careNeedList: AddCareNeedList): CareNeedList {
    return {
      ...careNeedList,
      id: Math.random().toString(36).substr(2, 9),
    };
  }
}
