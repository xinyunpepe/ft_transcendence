import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-select-users-channel',
  templateUrl: './select-users-channel.component.html',
  styleUrls: ['./select-users-channel.component.css']
})
export class SelectUsersChannelComponent implements OnInit {

	@Input() users: UserI[] = [];
	@Output() addUser: EventEmitter<UserI> = new EventEmitter<UserI>();
	@Output() removeUser: EventEmitter<UserI>= new EventEmitter<UserI>();

	searchUsername = new FormControl();
	user: UserI = this.authService.getLoggedInUser();
	filteredUsers: UserI[] = [];
	selectedUser: UserI = null!;

	constructor(
		private authService: AuthService,
		private userService: UserService
	) {}

	ngOnInit() {
		this.searchUsername.valueChanges.pipe(
			debounceTime(500),
			distinctUntilChanged(),

			switchMap((username: string) => this.userService.findByUsername(username).pipe(
				tap((users: UserI[]) => this.filteredUsers = users)
			))
		).subscribe();
	}

	addUserToForm() {
		this.addUser.emit(this.selectedUser);
		this.filteredUsers = [];
		this.selectedUser = null!;
		this.searchUsername.setValue(null);
	}

	setSelectedUser(user: UserI) {
		this.selectedUser = user;
	}

	removeUserFromForm(user: UserI) {
		this.removeUser.emit(user);
	}

	displayFn(user: UserI) {
		if (user) {
			return user.username;
		}
		else {
			return '';
		}
	}
}
