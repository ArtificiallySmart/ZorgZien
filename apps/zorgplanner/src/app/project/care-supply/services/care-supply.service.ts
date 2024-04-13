import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Subject, catchError, map, of } from 'rxjs';
import {
  AddCareSupplyList,
  CareSupplyList,
  EditCareSupplyList,
  RemoveCareSupplyList,
} from '../../../shared/interfaces/care-supply';
import { ToastService } from '../../../shared/services/toast.service';
import { DataService } from '../../services/data.service';
import { ProjectService } from '../../services/project.service';
import { connect } from 'ngxtension/connect';
import { merge } from 'rxjs';

export interface CareSupplyState {
  careSupplyLists: CareSupplyList[];
  selectedCareSupplyList: CareSupplyList | null;
  loaded: boolean;
  error: string | null;
}

export interface ChangeZipcodeForOrganisation {
  zipcode: string;
  oldOrganisationName: string | null;
  newOrganisationName: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class CareSupplyService {
  private dataService = inject(DataService);
  private projectService = inject(ProjectService);
  private toastService = inject(ToastService);

  project = this.projectService.project;

  initialState: CareSupplyState = {
    careSupplyLists: [],
    selectedCareSupplyList: null,
    loaded: false,
    error: null,
  };

  //state
  public state = signal<CareSupplyState>(this.initialState);

  //selectors
  careSupplyLists = computed(() => this.state().careSupplyLists);
  selectedCareSupplyList = computed(() => this.state().selectedCareSupplyList);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  //sources
  add$ = new Subject<CareSupplyList>();
  edit$ = new Subject<EditCareSupplyList>();
  remove$ = new Subject<RemoveCareSupplyList>();
  clear$ = new Subject<void>();

  careSupplyListsLoaded$ = new Subject<CareSupplyList[]>();
  selectCareSupplyListId$ = new Subject<string>();
  changeZipcodeForOrganisation$ = new Subject<ChangeZipcodeForOrganisation>();

  constructor() {
    //reducers
    const nextStateCommonReducers$ = merge(
      this.add$.pipe(
        map((careSupplyList) => ({
          careSupplyLists: [...this.careSupplyLists(), careSupplyList],
        })),
        catchError((error) => of({ error }))
      ),
      this.edit$.pipe(
        map(({ id, data }) => ({
          careSupplyLists: this.careSupplyLists().map((careSupplyList) =>
            careSupplyList.id === id
              ? { ...careSupplyList, ...data }
              : careSupplyList
          ),
          selectedCareSupplyList:
            this.selectedCareSupplyList()?.id === id
              ? { ...this.selectedCareSupplyList(), ...data }
              : this.selectedCareSupplyList(),
        })),
        catchError((error) => of({ error }))
      ),
      this.remove$.pipe(
        map((id) => ({
          selectedCareSupplyList: null,
          careSupplyLists: this.careSupplyLists().filter(
            (careSupplyList) => careSupplyList.id !== id
          ),
        })),
        catchError((error) => of({ error }))
      ),
      this.clear$.pipe(map(() => this.initialState))
    );

    const nextStateSpecialReducers$ = merge(
      this.careSupplyListsLoaded$.pipe(
        map((careSupplyLists) => ({
          ...this.initialState,
          loaded: true,
          careSupplyLists: careSupplyLists,
        })),
        catchError((error) => of({ error }))
      ),
      this.selectCareSupplyListId$.pipe(
        map((id) => ({
          selectedCareSupplyList:
            this.careSupplyLists().find((list) => list.id == id) || null,
        }))
      ),
      this.changeZipcodeForOrganisation$.pipe(
        map(({ zipcode, oldOrganisationName, newOrganisationName }) => ({
          selectedCareSupplyList: this.moveZipcode(
            zipcode,
            oldOrganisationName,
            newOrganisationName
          ),
        }))
      )
    );

    connect(this.state)
      .with(nextStateCommonReducers$)
      .with(nextStateSpecialReducers$);

    effect(() => {
      if (this.project().id) {
        this.loadCareSupplyLists(this.project().id);
        return;
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
      next: (careSupplyList) => {
        this.add$.next(careSupplyList);
        this.toastService.show('Zorgaanbod toegevoegd', 'success');
      },
      error: (err) => this.add$.error(err),
    });
  }

  editCareSupplyList({ id, data }: EditCareSupplyList) {
    this.dataService.editCareSupplyList({ id, data }).subscribe({
      next: () => {
        this.edit$.next({ id, data });
        this.toastService.show('Wijzigingen opgeslagen', 'success');
      },
      error: (err) => this.edit$.error(err),
    });
  }

  removeCareSupplyList(id: RemoveCareSupplyList) {
    this.dataService.removeCareSupplyList(id).subscribe({
      next: () => {
        this.remove$.next(id);
        this.toastService.show('Zorgaanbod verwijderd', 'success');
      },
      error: (err) => this.remove$.error(err),
    });
  }

  moveZipcode(zipcode: string, oldName: string, newName: string) {
    console.log('moveZipcode');
    // Clone the CareSupplyList to avoid mutating the original object directly
    const updatedList = JSON.parse(
      JSON.stringify(this.selectedCareSupplyList())
    );
    //const updatedList = this.selectedCareSupplyList();

    // Find the old CareSupplyEntry and remove the zipcode
    const oldEntryIndex = updatedList.careSupply.findIndex(
      (entry) => entry.name === oldName
    );
    if (
      oldEntryIndex !== -1 &&
      updatedList.careSupply[oldEntryIndex].areaZipcodes
    ) {
      const oldEntry = { ...updatedList.careSupply[oldEntryIndex] };
      oldEntry.areaZipcodes = oldEntry.areaZipcodes.filter(
        (z) => z !== zipcode
      );
      updatedList.careSupply[oldEntryIndex] = oldEntry;
    }

    // Find the new CareSupplyEntry and add the zipcode if not already present
    const newEntryIndex = updatedList.careSupply.findIndex(
      (entry) => entry.name === newName
    );
    if (newEntryIndex !== -1) {
      const newEntry = { ...updatedList.careSupply[newEntryIndex] };
      if (!newEntry.areaZipcodes) {
        newEntry.areaZipcodes = [];
      }
      if (!newEntry.areaZipcodes.includes(zipcode)) {
        newEntry.areaZipcodes.push(zipcode);
      }
      updatedList.careSupply[newEntryIndex] = newEntry;
    }
    console.log(this.selectedCareSupplyList());
    console.log(updatedList);
    return updatedList;
  }
}
