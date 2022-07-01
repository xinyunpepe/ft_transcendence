import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';
import { UserI } from 'src/app/model/user';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	constructor(
		// get the current route from the browser
		private activatedRoute: ActivatedRoute,
		private userService: UserService
	) {}

	userData : any = {};
	userLogin = this.activatedRoute.params;

	ngOnInit(): void {
		this.userService.findOneUser("xli").subscribe((user: any) => {
			console.log(user);
			this.userData = user;
		}, (error: any) => {
			console.log(error);
		})
	}

}
