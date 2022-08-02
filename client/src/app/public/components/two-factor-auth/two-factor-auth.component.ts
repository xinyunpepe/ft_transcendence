import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { UserService } from 'src/app/private/services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
	selector: 'app-two-factor-auth',
	templateUrl: './two-factor-auth.component.html',
	styleUrls: ['./two-factor-auth.component.css']
})
export class TwoFactorAuthComponent implements OnInit {

	twofactorForm: FormGroup;

	constructor(
		private formBuilder: FormBuilder,
		private authService: AuthService,
		private userService: UserService,
		private router: Router,
		private snackbar: MatSnackBar
	) {}

	ngOnInit() {
		this.twofactorForm = this.formBuilder.group({
			id: [{ value: null, disabled: true }, [Validators.required]],
			isTwoFactorAuthEnabled: [null],
			twoFactorAuthSecret: [null],
			twoFactorAuthCode: [null,[
				Validators.required,
				Validators.minLength(6),
				Validators.maxLength(6),
			]],
		})

		this.authService.getUserId().pipe(
			switchMap((id: number) => this.userService.findById(id).pipe(
				tap((user) => {
					this.twofactorForm.patchValue({
						id: user.id,
						isTwoFactorAuthEnabled: user.isTwoFactorAuthEnabled,
						twoFactorAuthSecret: user.twoFactorAuthSecret
					});
					if (!this.twofactorForm.value.isTwoFactorAuthEnabled) {
						this.router.navigate(['../../public/login']);
						this.snackbar.open(`Two factor authentication is inactive`, 'Close', {
							duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
						})
					}
				})
			))
		).subscribe()
	}

	onSubmit() {
		if (this.twofactorForm.valid) {
			this.authService.authenticate(this.twofactorForm.getRawValue(), this.twofactorForm.value.twoFactorAuthCode).subscribe(
				data => {
					this.snackbar.open(`Two factor authentication success`, 'Close', {
						duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
					});
					setTimeout(() => {
						this.router.navigate(['../../private/profile']);
					}, 3000);
				}
			);
		}
	}

	cancel() {
		localStorage.removeItem('access_token');
		this.router.navigate(['../../public/login']);
	}
}
