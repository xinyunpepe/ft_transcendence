import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserI, UserStatus } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent {

	constructor(
		private authService: AuthService,
		private userService: UserService,
		private router: Router
	) {}

	logout() {
		this.userService.findById(this.authService.getLoggedInUser().id).subscribe(
			(user: UserI) => {
				user.status = UserStatus.OFF;
				this.authService.logout(user).subscribe();
				// TODO game logout?
			}
		)
		setTimeout(() => {
			this.router.navigate(['login']);
		}, 1000);
	}
}
