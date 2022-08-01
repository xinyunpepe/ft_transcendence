import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { UserService } from '../../services/user/user.service';

@Component({
	selector: 'app-enable-two-factor',
	templateUrl: './enable-two-factor.component.html',
	styleUrls: ['./enable-two-factor.component.css']
})
export class EnableTwoFactorComponent implements OnInit {

	@ViewChild('stepper') stepper;

	settingForm: FormGroup;
	qrCode: any;
	secret: string;

	constructor(
		private formBuilder: FormBuilder,
		private authService: AuthService,
		private userService: UserService,
		private router: Router,
		private snackbar: MatSnackBar
	) { }

	ngOnInit() {
		this.settingForm = this.formBuilder.group({
			id: [{ value: null, disabled: true }, [Validators.required]],
			username: [null, [Validators.required, Validators.maxLength(20)]],
			avatar: [null],
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
					this.settingForm.patchValue({
						id: user.id,
						username: user.username,
						avatar: user.avatar,
						isTwoFactorAuthEnabled: user.isTwoFactorAuthEnabled,
						twoFactorAuthSecret: user.twoFactorAuthSecret
					});
					this.secret = user.twoFactorAuthSecret;
					if (this.settingForm.value.isTwoFactorAuthEnabled) {
						this.router.navigate(['../../private/setting']);
						this.snackbar.open(`Two factor authentication is enabled`, 'Close', {
							duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
						})
					}
				})
			))
		).subscribe()
		this.getQrImage();
	}

	createQrImage(image: Blob) {
		let reader = new FileReader();
		reader.addEventListener("load", () => {
			this.qrCode = reader.result;
		}, false);
		if (image) {
			reader.readAsDataURL(image);
		}
	}

	getQrImage() {
		this.authService.getQrImage().subscribe(data => {
			this.createQrImage(data);
		});
	}

	enable2fa() {
		this.authService.enable2fa(this.settingForm.getRawValue(), this.settingForm.value.twoFactorAuthCode).subscribe(
			data => {
				this.snackbar.open(`Two factor authentication is enabled`, 'Close', {
					duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
				});
				this.stepper.next();
				setTimeout(() => {
					this.router.navigate(['../../private/profile-setting']);
				}, 3000);
			},
			error => {
				console.log(error);
			}
		)
	}
}
