import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';
import { FriendRequestI, FriendStatus } from 'src/app/model/friend-request.interface';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { FriendService } from '../../services/friend/friend.service';
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
	blockedIds: number[] = [];
	filteredUsers: UserI[] = [];
	selectedUser: UserI = null!;

	constructor(
		private authService: AuthService,
		private userService: UserService,
		private friendService: FriendService
	) {}

	ngOnInit() {
		this.friendService.findRequestsByCreator(this.user.id).pipe(
			map((requests: FriendRequestI[]) => requests && requests.length && requests.filter(request => request.status === FriendStatus.BLOCKED)),
			// tap((requests) => console.log(requests)),
			tap((requests: FriendRequestI[]) => requests.forEach((request) => {
				this.blockedIds.push(request.receiver.id)
			}))
		).subscribe();

		// console.log(this.blockedIds);

		// TODO filter out users whose id is in blockIds
		this.searchUsername.valueChanges.pipe(
			debounceTime(500),
			distinctUntilChanged(),

			switchMap((username: string) => this.userService.findByUsername(username).pipe(
				// map((users: UserI[]) => users && users.length && users.filter(user => !this.blockedIds.includes(user.id))),
				tap((users: UserI[]) => this.filteredUsers = users),
				// tap((users) => console.log(users))
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
