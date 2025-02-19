import { Validators, ValidationErrors, FormGroup, FormControl, AbstractControl } from '@angular/forms';

export const LOGIN_FORM: any = {
  loginForm: new FormGroup({
    subject: new FormControl(''),
    password: new FormControl(''),
    remember: new FormControl(true),
  }),

  recoveryForm: new FormGroup({
    email: new FormControl('', [Validators.email]),
  }),

  registerForm: new FormGroup(
    {
      name: new FormControl(
        '',
        (control: AbstractControl): ValidationErrors => control.value && !/^[a-я]{2,12} [a-я]{2,12}$/i.test(control.value)
          ? { wrongFormat: true }
          : null
      ),
      username: new FormControl(
        '',
        (control: AbstractControl): ValidationErrors => control.value && !/^((?!^id\d))\w{3,26}$/.test(control.value)
          ? { noMatch: true }
          : null
      ),
      email: new FormControl('', [Validators.email]),
      password: new FormControl(''),
      passwordRepeat: new FormControl(''),
    },
    {
      validators: (group: FormGroup): ValidationErrors => group.controls.password.value !== group.controls.passwordRepeat.value
        ? { mismatch: true }
        : null
    },
  )
};
