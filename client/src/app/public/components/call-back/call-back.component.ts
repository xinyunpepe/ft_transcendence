import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
	selector: 'app-call-back',
	templateUrl: './call-back.component.html',
	styleUrls: ['./call-back.component.css']
})
export class CallBackComponent implements OnInit {

	constructor(
		private authService: AuthService,
		private router: Router,
		private snackbar: MatSnackBar
	) {}

	ngOnInit() {
		if (this.authService.isAuthenticated()) {
			this.router.navigate(['../../private/profile']);
			return ;
		}

		let uri: string = window.location.href;
		console.log(uri);

		let auth = "/api/auth/redirect";
		uri = uri.replace('public/', '');
		console.log(uri);

		let output = [uri.slice(0, 21), auth, uri.slice(21)].join('');
		uri = output;
		console.log(uri);

		this.authService.getCallback(uri).subscribe(
			(res: any) => {
				localStorage.setItem('access_token', res.token);
				if (res.isTwofactorAuthEnabled) {
					this.router.navigate(['../../public/two-factor-auth']);
				}
				else {
					this.router.navigate(['../../private/profile']);
				}
			},
			(error) => {
				this.snackbar.open(`ERROR: something went wrong`, 'Close', {
					duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
				})
				this.router.navigate(['../../public/login']);
			}
		)
	}
}
