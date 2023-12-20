//** A list of zipcodes can not contain duplicates */

import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function areaZipcodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string[];
    const valid = value.length === new Set(value).size;
    return valid ? null : { duplicateZipcode: { value } };
  };
}
