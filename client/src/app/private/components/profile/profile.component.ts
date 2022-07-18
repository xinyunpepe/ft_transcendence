import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	private subscription: Subscription = new Subscription();

	user: any;

	twoFactorAuthActive: boolean = false;

	twoFactorAuth: any = {};

	qrCode: string = '';

	constructor(
		private http: HttpClient,
		private authService: AuthService,
	) {}

	ngOnInit(): void {
		console.log('profile');
		localStorage.setItem('access_token', this.authService.getAccessToken());
		const user = this.authService.getLoggedInUser(); //subscribe???
		this.http.get(`${ environment.baseUrl }/users/${ user.login }`).subscribe({
			next: data => {
				if (!data) {
					return;
				}
				this.user = data;
				console.log(this.user);
				// console.log(this.user.login);
			},
			error: error => {
				console.log(error);
			}
		});
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	turnOn2FA() {
		this.authService.generate2fa().subscribe({
			next: data => {
				this.twoFactorAuth = data;
				console.log(this.twoFactorAuth);
				this.twoFactorAuthActive = true;
			},
			error: error => {
				console.log(error);
			}
		})
	}

	turnOff2FA() {
	}


}
