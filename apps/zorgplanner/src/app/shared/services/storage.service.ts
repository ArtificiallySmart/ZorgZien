import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CareNeedList } from '../interfaces/care-need';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  loadCareNeedLists() {
    return of([]) as Observable<CareNeedList[]>;
  }
}
