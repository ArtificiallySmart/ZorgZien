import { Injectable } from '@angular/core';
import { CareDemandEntry } from '../interfaces/care-demand';

@Injectable({
  providedIn: 'root',
})
export class ParserService {
  constructor() {}

  parse(data: string): Omit<CareDemandEntry, 'id' | 'careDemandListId'>[] {
    const demandValues: Omit<CareDemandEntry, 'id' | 'careDemandListId'>[] = [];

    const rows = data.split('\n');

    for (const row of rows) {
      const values = row.split('\t').map((item) => {
        return +item.trim().replace('.', '').replace(',', '.');
      });
      demandValues.push({
        zipcode: values[0],
        hours: values[1],
        clients: values[2],
      });
    }
    return demandValues;
  }

  parseZipcodes(data: string) {
    const zipcodes = data.match(/\b(\d{4})\b/g);
    return zipcodes ?? [];
  }
}
