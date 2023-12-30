import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ParserService {
  constructor() {}

  //todo: make this a bit more robust
  parse(data: string): { arr: [number, number][]; message?: string } {
    const arr: [number, number][] = [];
    let message = '';

    const rows = data.split('\n');

    for (const row of rows) {
      const [key, value] = row.split('\t').map((item) => item.trim());
      arr.push([parseInt(key), parseFloat(value.replace(',', '.'))]);
    }
    if ([...new Set(arr)].length !== arr.length) {
      message = 'Duplicate zipcodes found';
    }
    return { arr, message };
  }

  parseZipcodes(data: string) {
    const zipcodes = data.match(/(\d{4})/g);
    return zipcodes ?? [];
  }
}
