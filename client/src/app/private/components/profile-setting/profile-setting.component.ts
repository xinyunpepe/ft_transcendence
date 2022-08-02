import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { catchError, switchMap, tap, throwError } from 'rxjs';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { UserService } from '../../services/user/user.service';

@Component({
	selector: 'app-profile-setting',
	templateUrl: './profile-setting.component.html',
	styleUrls: ['./profile-setting.component.css']
})
export class ProfileSettingComponent implements OnInit {

	settingForm: FormGroup;
	selectedFile: File;

	constructor(
		private formBuilder: FormBuilder,
		private authService: AuthService,
		private userService: UserService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private snackbar: MatSnackBar
	) { }

	ngOnInit() {
		this.settingForm = this.formBuilder.group({
			id: [{ value: null, disabled: true }, [Validators.required]],
			username: [null, [Validators.required, Validators.maxLength(20)]],
			avatar: [null],
			isTwoFactorAuthEnabled: [null],
			twoFactorAuthSecret: { value: null, disabled: true }
		});

		this.authService.getUserId().pipe(
			switchMap((id: number) => this.userService.findById(id).pipe(
				tap((user) => {
					this.settingForm.patchValue({
						id: user.id,
						username: user.username,
						avatar: user.avatar,
						isTwoFactorAuthEnabled: user.isTwoFactorAuthEnabled,
						twoFactorAuthSecret: user.twoFactorAuthSecret
					})
				})
			))
		).subscribe()
	}

	getErrorMessageUser() {
		if (this.settingForm.controls['username'].hasError('required')) {
			return 'You must enter a username';
		}
		else if (this.settingForm.controls['username'].hasError('maxlength')) {
			return 'Username must be less than 20 characters';
		}
		return '';
	}

	updateUsername() {
		console.log(this.settingForm.getRawValue());
		this.userService.updateUsername(this.settingForm.getRawValue()).pipe(
			tap(() => this.snackbar.open(`Username updated`, 'Close', {
				duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
			})),
			catchError(e => {
				this.snackbar.open(`ERROR: Username already in use`, 'Close', {
					duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
				})
				return throwError(e);
			})
		).subscribe();
	}

	getAuthStatus() {
		if (this.settingForm.value.isTwoFactorAuthEnabled) {
			this.settingForm.controls['isTwoFactorAuthEnabled'].setValue(true);
			return 'Disable';
		}
		else {
			this.settingForm.controls['isTwoFactorAuthEnabled'].setValue(false);
			return 'Enable';
		}
	}

	getQrCode() {
		if (this.settingForm.value.isTwoFactorAuthEnabled) {
			this.router.navigate(['../disable-two-factor'], { relativeTo: this.activatedRoute });
		}
		else {
			this.authService.generate2fa().subscribe(
				data => {
					this.settingForm.patchValue({
						twoFactorAuthSecret: data
					});
					// update db?
				}
			)
			setTimeout(() => {
				this.router.navigate(['../enable-two-factor'], { relativeTo: this.activatedRoute })
			}, 200);
		}
	}

	onFileChange(event) {
		this.selectedFile = event.target.files[0];
	}

	uploadAvatar() {
		if (this.selectedFile) {
			const formData = new FormData();
			formData.append('file', this.selectedFile);
			this.userService.uploadFile(formData).pipe(
				tap(() => this.snackbar.open(`Avatar uploaded`, 'Close', {
						duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
				})),
				catchError(e => {
					this.snackbar.open(`ERROR: Upload failed`, 'Close', {
						duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
					})
					return throwError(e);
				})
			).subscribe();
		}
	}
}
