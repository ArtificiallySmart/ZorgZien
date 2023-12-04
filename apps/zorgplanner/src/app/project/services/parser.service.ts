import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ParserService {
  constructor() {}

  parse(data: string) {
    console.log(data);
    const map = new Map<number, number>();
    const rows = data.split('\n');

    for (let row of rows) {
      const [key, value] = row.split('\t').map((item) => item.trim());
      map.set(parseInt(key), parseFloat(value.replace(',', '.')));
    }

    return map;
  }
}
