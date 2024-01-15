import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  AddCareSupplyList,
  CareSupplyList,
  EditCareSupplyList,
  RemoveCareSupplyList,
} from '../../../shared/interfaces/care-supply';
import { DataService } from '../../services/data.service';
import { ProjectService } from '../../services/project.service';
import { Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface CareSupplyState {
  careSupplyLists: CareSupplyList[];
  selectedCareSupplyList: CareSupplyList | null;
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class CareSupplyService {
  private dataService = inject(DataService);
  private projectService = inject(ProjectService);

  project = this.projectService.project;

  //state
  public state = signal<CareSupplyState>({
    careSupplyLists: [],
    selectedCareSupplyList: null,
    loaded: false,
    error: null,
  });

  //selectors
  careSupplyLists = computed(() => this.state().careSupplyLists);
  selectedCareSupplyList = computed(() => this.state().selectedCareSupplyList);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  //sources
  careSupplyListsLoaded$ = new Subject<CareSupplyList[]>();
  selectCareSupplyListId$ = new Subject<string>();
  add$ = new Subject<CareSupplyList>();
  edit$ = new Subject<EditCareSupplyList>();
  remove$ = new Subject<RemoveCareSupplyList>();
  clear$ = new Subject<void>();

  constructor() {
    this.careSupplyListsLoaded$.pipe(takeUntilDestroyed()).subscribe({
      next: (careSupplyLists) =>
        this.state.update((state) => ({
          ...state,
          careSupplyLists: careSupplyLists,
          loaded: true,
        })),
      error: (err) =>
        this.state.update((state) => ({
          ...state,
          error: err,
        })),
    });

    this.add$.pipe(takeUntilDestroyed()).subscribe({
      next: (careSupplyList) =>
        this.state.update((state) => ({
          ...state,
          careSupplyLists: [...state.careSupplyLists, careSupplyList],
        })),
      error: (err) =>
        this.state.update((state) => ({
          ...state,
          error: err,
        })),
    });

    this.edit$.pipe(takeUntilDestroyed()).subscribe({
      next: ({ id, data }) =>
        this.state.update((state) => ({
          ...state,
          careSupplyLists: state.careSupplyLists.map((careSupplyList) =>
            careSupplyList.id === id
              ? { ...careSupplyList, ...data }
              : careSupplyList
          ),
          selectedCareSupplyList:
            state.selectedCareSupplyList?.id === id
              ? { ...state.selectedCareSupplyList, ...data }
              : state.selectedCareSupplyList,
        })),
      error: (err) =>
        this.state.update((state) => ({
          ...state,
          error: err,
        })),
    });

    this.remove$.pipe(takeUntilDestroyed()).subscribe({
      next: (id) =>
        this.state.update((state) => ({
          ...state,
          selectedCareSupplyList: null,
          careSupplyLists: state.careSupplyLists.filter(
            (careSupplyList) => careSupplyList.id !== id
          ),
        })),
      error: (err) =>
        this.state.update((state) => ({
          ...state,
          error: err,
        })),
    });

    this.selectCareSupplyListId$
      .pipe(takeUntilDestroyed())
      .subscribe((careSupplyList) => {
        const selectedCareSupplyList = this.careSupplyLists().find(
          (list) => list.id == careSupplyList
        );
        this.state.update((state) => ({
          ...state,
          selectedCareSupplyList: selectedCareSupplyList || null,
        }));
      });

    this.clear$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update(() => ({
        careSupplyLists: [],
        selectedCareSupplyList: null,
        loaded: false,
        error: null,
      }))
    );

    effect(() => {
      if (this.project().id) {
        this.loadCareSupplyLists(this.project().id);
      }
    });
  }

  loadCareSupplyLists(projectId: number) {
    this.dataService.loadCareSupplyLists(projectId).subscribe({
      next: (careSupplyLists) => {
        this.careSupplyListsLoaded$.next(careSupplyLists);
      },
      error: (err) => this.careSupplyListsLoaded$.next(err),
    });
  }

  addCareSupplyList(careSupplyList: Omit<AddCareSupplyList, 'projectId'>) {
    const addCareSupplyList: AddCareSupplyList = {
      ...careSupplyList,
      projectId: this.project().id,
    };

    this.dataService.addCareSupplyList(addCareSupplyList).subscribe({
      next: (careSupplyList) => this.add$.next(careSupplyList),
      error: (err) => this.add$.error(err),
    });
  }

  editCareSupplyList({ id, data }: EditCareSupplyList) {
    this.dataService.editCareSupplyList({ id, data }).subscribe({
      next: () => this.edit$.next({ id, data }),
      error: (err) => this.edit$.error(err),
    });
  }

  removeCareSupplyList(id: RemoveCareSupplyList) {
    this.dataService.removeCareSupplyList(id).subscribe({
      next: () => this.remove$.next(id),
      error: (err) => this.remove$.error(err),
    });
  }
}
