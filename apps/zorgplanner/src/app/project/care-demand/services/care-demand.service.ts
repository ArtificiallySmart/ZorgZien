import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Subject } from 'rxjs';
import {
  AddCareDemandList,
  CareDemandList,
  EditCareDemandList,
  RemoveCareDemandList,
} from '../../../shared/interfaces/care-demand';
import { ProjectService } from '../../services/project.service';
import { DataService } from '../../services/data.service';

export interface CareDemandState {
  careDemandLists: CareDemandList[];
  selectedCareDemandList: CareDemandList | null;
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class CareDemandService {
  private dataService = inject(DataService);
  private projectService = inject(ProjectService);

  project = this.projectService.project;

  //state
  public state = signal<CareDemandState>({
    careDemandLists: [],
    selectedCareDemandList: null,
    loaded: false,
    error: null,
  });

  //selectors
  careDemandLists = computed(() => this.state().careDemandLists);
  selectedCareDemandList = computed(() => this.state().selectedCareDemandList);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  //sources
  careDemandListsLoaded$ = new Subject<CareDemandList[]>();
  selectCareDemandListId$ = new Subject<string>();
  add$ = new Subject<CareDemandList>();
  edit$ = new Subject<EditCareDemandList>();
  remove$ = new Subject<RemoveCareDemandList>();
  clear$ = new Subject<void>();

  constructor() {
    this.careDemandListsLoaded$.pipe(takeUntilDestroyed()).subscribe({
      next: (careDemandLists) =>
        this.state.update((state) => ({
          ...state,
          careDemandLists: careDemandLists,
          loaded: true,
        })),
      error: (err) =>
        this.state.update((state) => ({
          ...state,
          error: err,
        })),
    });

    this.add$.pipe(takeUntilDestroyed()).subscribe((careDemandList) => {
      this.state.update((state) => ({
        ...state,
        careDemandLists: [...state.careDemandLists, careDemandList],
      }));
    });

    this.remove$.pipe(takeUntilDestroyed()).subscribe((id) =>
      this.state.update((state) => ({
        ...state,
        careDemandLists: state.careDemandLists.filter(
          (careDemandList) => careDemandList.id !== id
        ),
      }))
    );

    this.edit$.pipe(takeUntilDestroyed()).subscribe({
      next: (update) =>
        this.state.update((state) => ({
          ...state,
          careDemandLists: state.careDemandLists.map((careDemandList) =>
            careDemandList.id === update.id
              ? { ...careDemandList, ...update.data }
              : careDemandList
          ),
          selectedCareDemandList:
            state.selectedCareDemandList?.id === update.id
              ? { ...state.selectedCareDemandList, ...update.data }
              : state.selectedCareDemandList,
        })),
      error: (err) =>
        this.state.update((state) => ({
          ...state,
          error: err,
        })),
    });

    this.selectCareDemandListId$
      .pipe(takeUntilDestroyed())
      .subscribe((careDemandList) => {
        const selectedCareDemandList = this.careDemandLists().find(
          (list) => list.id == careDemandList
        );
        this.state.update((state) => ({
          ...state,
          selectedCareDemandList: selectedCareDemandList || null,
        }));
      });

    this.clear$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update((state) => ({
        ...state,
        careDemandLists: [],
        loaded: false,
      }))
    );

    effect(() => {
      if (this.project().id) {
        this.loadCareDemandLists(this.project().id);
        return;
      }
    });
  }

  updateCareDemandList(update: EditCareDemandList) {
    this.dataService.editCareDemandList(update).subscribe({
      next: () => {
        this.edit$.next(update);
      },
      error: (err) => this.edit$.next(err),
    });
  }

  loadCareDemandLists(projectId: number) {
    this.dataService.loadCareDemandLists(projectId).subscribe({
      next: (careDemandLists) => {
        this.careDemandListsLoaded$.next(careDemandLists);
      },
      error: (err) => this.careDemandListsLoaded$.next(err),
    });
  }

  addCareDemandList(careDemandList: Omit<AddCareDemandList, 'projectId'>) {
    const addCareDemandList: AddCareDemandList = {
      ...careDemandList,
      projectId: this.projectService.project().id,
    };

    this.dataService.addCareDemandList(addCareDemandList).subscribe({
      next: (careDemandList) => {
        this.add$.next(careDemandList);
      },
      error: (err) => this.add$.next(err),
    });
  }

  removeCareDemandList(id: RemoveCareDemandList) {
    this.dataService.removeCareDemandList(id).subscribe({
      next: (res) => {
        this.remove$.next(res.id);
      },
      error: (err) => this.remove$.next(err),
    });
  }
}
