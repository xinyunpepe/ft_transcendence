import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	user: UserI = {};
	twoFactorAuthActive: boolean = false;
	twoFactorAuth: any = {};
	qrCode: string = '';

	constructor(
		private http: HttpClient,
		private authService: AuthService,
	) {}

	ngOnInit() {
		localStorage.setItem('access_token', this.authService.getAccessToken());
		this.user = this.authService.getLoggedInUser(); //subscribe???
		this.http.get(`${ environment.baseUrl }/users/${ this.user.login }`).subscribe({
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

	editProfile(user: UserI) {

	}

	editFriends(user: UserI) {

	}
}
