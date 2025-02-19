import { Component, OnInit } from '@angular/core';
import { FormGroup, ValidationErrors, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecoverPasswordService } from '@api/routes/recovery.service';

@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.component.html',
  styleUrls: ['./recovery.component.scss'],
})
export class RecoveryComponent implements OnInit {
  form: FormGroup;

  constructor(
    private readonly recovery: RecoverPasswordService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      password: ['', [Validators.required]],
      passwordRepeat: ['', [Validators.required]]
    }, {
      validators: (group: FormGroup): ValidationErrors | null => {
        if (group.controls.password.value === group.controls.passwordRepeat.value) {
          return null;
        }
        return { mismatch: true };
      },
    });
  }

  public onSubmit(): void {
    this.recovery.change$(
      this.route.snapshot.queryParams.code,
      this.route.snapshot.queryParams.email,
      this.form.get('password').value
    ).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
