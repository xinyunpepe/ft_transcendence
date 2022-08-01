import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { environment } from 'src/environments/environment';
import { UserService } from '../../services/user/user.service';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	user: UserI = {};
	avatar: any;

	constructor(
		private http: HttpClient,
		private authService: AuthService,
		private userService: UserService
	) { }

	ngOnInit() {
		localStorage.setItem('access_token', this.authService.getAccessToken());
		this.user = this.authService.getLoggedInUser(); //subscribe???
		this.http.get(`${environment.baseUrl}/users/id/${this.user.id}`).subscribe({
			next: data => {
				if (!data) {
					return;
				}
				this.user = data;
				this.getAvatar(this.user.id);
			},
			error: error => {
				console.log(error);
			}
		});
	}

	createAvatar(image: Blob) {
		let reader = new FileReader();
		reader.addEventListener("load", () => {
			this.avatar = reader.result;
		}, false);
		if (image) {
			reader.readAsDataURL(image);
		}
	}

	getAvatar(userId: number) {
		this.userService.getAvatar(userId).subscribe(data => {
			this.createAvatar(data);
		});
	}
}
