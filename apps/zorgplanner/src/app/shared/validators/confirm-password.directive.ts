import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function confirmPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const passwordConfirm = control.get('passwordConfirm');
    const valid =
      password && passwordConfirm && password.value === passwordConfirm.value;

    return valid
      ? null
      : { invalidPasswordConfirm: { value: passwordConfirm?.value } };
  };
}
