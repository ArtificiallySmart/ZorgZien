import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fteToHours',
  standalone: true,
})
export class FteToHoursPipe implements PipeTransform {
  transform(value: number): number {
    return value * 36;
  }
}
