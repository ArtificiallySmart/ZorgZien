//** A password must contain at least 8 characters, and should contain at least one lowercase and one uppercase letter, one number, and one special character */

import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    const regex = /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/;
    const valid = regex.test(value);
    return valid ? null : { invalidPassword: { value } };
  };
}
