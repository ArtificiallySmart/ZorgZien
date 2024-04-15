//** A list of zipcodes can not contain duplicates */

import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function areaZipcodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string[];
    const duplicates = findDuplicateIndices(value);

    const valid = duplicates.length === 0;
    return valid ? null : { duplicateZipcode: { duplicates } };
  };
}

function findDuplicateIndices(strings: string[]): number[][] {
  const indexMap = new Map<string, number[]>();
  const duplicates: number[][] = [];

  // Traverse the array and map indices to each string
  strings.forEach((str, index) => {
    if (!indexMap.has(str)) {
      indexMap.set(str, []);
    }
    indexMap.get(str)!.push(index);
  });

  // Collect indices of all duplicates
  for (const indices of indexMap.values()) {
    if (indices.length > 1) {
      duplicates.push(indices);
    }
  }

  return duplicates;
}
