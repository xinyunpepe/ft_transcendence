import { Component, OnInit } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { UserService } from '../../services/user/user.service';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	user: Observable<UserI>;
	avatar: any;

	constructor(
		private authService: AuthService,
		private userService: UserService
	) { }

	ngOnInit() {
		this.authService.getUserId().pipe(
			switchMap((id: number) => this.userService.findById(id).pipe(
				tap((user) => {
					this.user = this.userService.findById(user.id);
					this.getAvatar(user.id);
				})
			))
		).subscribe();

		// this.user = this.authService.getLoggedInUser(); //subscribe???
		// this.http.get(`${environment.baseUrl}/users/id/${this.user.id}`).subscribe({
		// 	next: data => {
		// 		if (!data) {
		// 			return;
		// 		}
		// 		this.user = data;
		// 		this.getAvatar(this.user.id);
		// 	},
		// 	error: error => {
		// 		console.log(error);
		// 	}
		// });
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
		this.userService.getAvatar(userId).subscribe(
			data => {
				this.createAvatar(data);
			}
		);
	}
}
