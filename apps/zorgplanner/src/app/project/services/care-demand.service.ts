import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Subject } from 'rxjs';
import {
  AddCareDemandList,
  CareDemandList,
  EditCareDemandList,
  RemoveCareDemandList,
} from '../../shared/interfaces/care-demand';
import { ProjectService } from './project.service';
import { DataService } from './data.service';

export interface CareDemandState {
  careDemandLists: CareDemandList[];
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
    loaded: false,
    error: null,
  });

  //selectors
  careDemandLists = computed(() => this.state().careDemandLists);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  //sources
  careDemandListsLoaded$ = new Subject<CareDemandList[]>();
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

    this.edit$.pipe(takeUntilDestroyed()).subscribe((update) =>
      this.state.update((state) => ({
        ...state,
        careDemandLists: state.careDemandLists.map((careDemandList) =>
          careDemandList.id === update.id
            ? { ...careDemandList, title: update.data.title }
            : careDemandList
        ),
      }))
    );

    this.clear$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update((state) => ({
        ...state,
        careDemandLists: [],
        loaded: false,
      }))
    );

    effect(() => {
      if (this.project().id) {
        console.log('effect in care need service', this.project().id);
        this.loadCareDemandLists(this.project().id);
        return;
      }
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
    console.log(addCareDemandList);
    this.dataService.addCareDemandList(addCareDemandList).subscribe({
      next: (careDemandList) => {
        this.add$.next(careDemandList);
      },
      error: (err) => this.add$.next(err),
    });
  }
}
