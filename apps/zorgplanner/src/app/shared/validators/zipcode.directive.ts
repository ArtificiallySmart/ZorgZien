//** A zipcode must contain only four digits, and must match with the projects area */

import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function zipcodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    const valid = /^\d{4}$/.test(value);
    return valid ? null : { invalidZipcode: { value } };
  };
}
