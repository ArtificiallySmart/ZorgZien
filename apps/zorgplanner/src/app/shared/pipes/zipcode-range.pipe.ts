import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'zipcodeRange',
  standalone: true,
})
export class ZipcodeRangePipe implements PipeTransform {
  transform(value: number, interval: number, last: boolean): string {
    if (last && value + interval < 10000) {
      return `${value} - ${value + interval}`;
    }
    return `${value} - ${value + interval - 1}`;
  }
}
