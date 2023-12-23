import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ParserService {
  constructor() {}

  //todo: make this a bit more robust
  parse(data: string) {
    const map = new Map<number, number>();
    const rows = data.split('\n');

    for (const row of rows) {
      const [key, value] = row.split('\t').map((item) => item.trim());
      map.set(parseInt(key), parseFloat(value.replace(',', '.')));
    }

    return map;
  }

  parseZipcodes(data: string) {
    const zipcodes = data.match(/(\d{4})/g);
    return zipcodes ?? [];
  }
}
