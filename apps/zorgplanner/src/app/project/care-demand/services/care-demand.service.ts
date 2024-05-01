import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Subject, catchError, map, merge, of, tap } from 'rxjs';
import {
  AddCareDemandList,
  CareDemandList,
  EditCareDemandList,
  RemoveCareDemandList,
} from '../../../shared/interfaces/care-demand';
import { ProjectService } from '../../services/project.service';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../../shared/services/toast.service';
import { connect } from 'ngxtension/connect';

export interface CareDemandState {
  careDemandLists: CareDemandList[];
  selectedCareDemandList: CareDemandList[];
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class CareDemandService {
  private dataService = inject(DataService);
  private projectService = inject(ProjectService);
  private toastService = inject(ToastService);

  project = this.projectService.project;

  initialState: CareDemandState = {
    careDemandLists: [],
    selectedCareDemandList: [],
    loaded: false,
    error: null,
  };

  //state
  public state = signal<CareDemandState>(this.initialState);

  //selectors
  careDemandLists = computed(() => this.state().careDemandLists);
  selectedCareDemandList = computed(() => this.state().selectedCareDemandList);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  //sources
  add$ = new Subject<CareDemandList>();
  edit$ = new Subject<EditCareDemandList>();
  remove$ = new Subject<RemoveCareDemandList>();
  clear$ = new Subject<void>();

  careDemandListsLoaded$ = new Subject<CareDemandList[]>();
  selectCareDemandListId$ = new Subject<string>();

  constructor() {
    //reducers
    const nextStateCommonReducers$ = merge(
      this.add$.pipe(
        map((careDemandList) => ({
          careDemandLists: [...this.careDemandLists(), careDemandList],
        })),
        catchError((error) => of({ error }))
      ),
      this.edit$.pipe(
        map(({ id, data }) => {
          const careDemandLists = this.careDemandLists().map((careDemandList) =>
            careDemandList.id === id
              ? { ...careDemandList, ...data }
              : careDemandList
          );

          const selectedCareDemandList = this.selectedCareDemandList().map(
            (careDemandList) =>
              careDemandList.id === id
                ? { ...careDemandList, ...data }
                : careDemandList
          );

          return { careDemandLists, selectedCareDemandList };
        }),
        catchError((error) => of({ error }))
      ),
      this.remove$.pipe(
        map((id) => ({
          selectedCareDemandList: null,
          careDemandLists: this.careDemandLists().filter(
            (careDemandList) => careDemandList.id !== id
          ),
        })),
        catchError((error) => of({ error }))
      ),
      this.clear$.pipe(map(() => this.initialState))
    );
    const nextStateSpecialReducers$ = merge(
      this.careDemandListsLoaded$.pipe(
        map((careDemandLists) => ({
          ...this.initialState,
          careDemandLists: careDemandLists,
          loaded: true,
        })),
        catchError((error) => of({ error }))
      ),
      this.selectCareDemandListId$.pipe(
        map((id) => {
          const index = this.selectedCareDemandList().findIndex(
            (careDemandList) => careDemandList.id === id
          );
          if (index === -1) {
            const careDemandList = this.careDemandLists().find(
              (careDemandList) => careDemandList.id === id
            );
            return {
              selectedCareDemandList: [
                ...this.selectedCareDemandList(),
                careDemandList,
              ],
            };
          }
          console.log(this.selectedCareDemandList(), index);

          return {
            selectedCareDemandList: this.selectedCareDemandList().filter(
              (careDemandList) => careDemandList.id !== id
            ),
          };
        }),
        tap((state) => console.log(state))
      )
    );

    connect(this.state)
      .with(nextStateCommonReducers$)
      .with(nextStateSpecialReducers$);

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
        this.toastService.show('Wijzigingen opgeslagen', 'success');
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
        this.toastService.show('Zorgbehoefte lijst opgeslagen', 'success');
      },
      error: (err) => this.add$.next(err),
    });
  }

  removeCareDemandList(id: RemoveCareDemandList) {
    this.dataService.removeCareDemandList(id).subscribe({
      next: (res) => {
        this.remove$.next(res.id);
        this.toastService.show('Zorgbehoefte lijst verwijderd', 'success');
      },
      error: (err) => this.remove$.next(err),
    });
  }
}
