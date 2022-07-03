import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';
import { UserI } from 'src/app/model/user';
import { AuthService } from 'src/app/services/auth/auth.service';
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
		// get the current route from the browser
		private activatedRoute: ActivatedRoute,
		private authService: AuthService
	) {}

	// retrieve login from url, replace 'xli' in getUserData() later?
	userLogin = this.activatedRoute.params;

	getUserData() {
		// from the server
		this.http.get(`${environment.baseUrl}/users/xli`).subscribe({
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

	ngOnInit(): void {
		console.log('profile');
		this.getUserData();
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
