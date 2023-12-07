import { Injectable, computed, inject, signal } from '@angular/core';
import { GeoJsonProperties } from 'geojson';
import { Objects } from 'topojson-specification';
import { DataService } from './data.service';

export interface GeoDataState {
  geoData: TopoJSON.Topology<Objects<GeoJsonProperties>>;
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class GeodataService {
  private dataService = inject(DataService);

  //state
  public state = signal<GeoDataState>({
    geoData: {} as TopoJSON.Topology<Objects<GeoJsonProperties>>,
    loaded: false,
    error: null,
  });

  //selectors
  geoData = computed(() => this.state().geoData);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  //sources
  private geoDataLoaded$ = this.dataService.loadGeoData();

  constructor() {
    this.geoDataLoaded$.subscribe({
      next: (geoData) =>
        this.state.update((state) => ({
          ...state,
          geoData,
          loaded: true,
        })),
      error: (err) =>
        this.state.update((state) => ({
          ...state,
          error: err,
        })),
    });
  }
}
