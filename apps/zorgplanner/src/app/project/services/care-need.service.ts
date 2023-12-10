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
import { ProjectService } from './project.service';
import { DataService } from './data.service';

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
  private dataService = inject(DataService);
  private projectService = inject(ProjectService);

  project = this.projectService.project;

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
  careNeedListsLoaded$ = new Subject<CareNeedList[]>();
  add$ = new Subject<CareNeedList>();
  edit$ = new Subject<EditCareNeedList>();
  remove$ = new Subject<RemoveCareNeedList>();
  clear$ = new Subject<void>();

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
        careNeedLists: [...state.careNeedLists, careNeedList],
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

    this.clear$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update((state) => ({
        ...state,
        careNeedLists: [],
        loaded: false,
      }))
    );

    effect(() => {
      if (this.project().id) {
        console.log('effect in care need service', this.project().id);
        this.loadCareNeedLists(this.project().id);
        return;
      }
    });
  }

  loadCareNeedLists(projectId: number) {
    this.dataService.loadCareNeedLists(projectId).subscribe({
      next: (careNeedLists) => {
        this.careNeedListsLoaded$.next(careNeedLists);
      },
      error: (err) => this.careNeedListsLoaded$.next(err),
    });
  }

  addCareNeedList(careNeedList: Omit<AddCareNeedList, 'projectId'>) {
    const addCareNeedList: AddCareNeedList = {
      ...careNeedList,
      projectId: this.projectService.project().id,
    };
    console.log(addCareNeedList);
    this.dataService.addCareNeedList(addCareNeedList).subscribe({
      next: (careNeedList) => {
        this.add$.next(careNeedList);
      },
      error: (err) => this.add$.next(err),
    });
  }
}
