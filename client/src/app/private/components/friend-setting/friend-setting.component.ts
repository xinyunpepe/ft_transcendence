import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelectionListChange } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Observable, switchMap, tap } from 'rxjs';
import { FriendRequestI } from 'src/app/model/friend-request.interface';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { FriendService } from '../../services/friend/friend.service';
import { UserService } from '../../services/user/user.service';

@Component({
	selector: 'app-friend-setting',
	templateUrl: './friend-setting.component.html',
	styleUrls: ['./friend-setting.component.css']
})
export class FriendSettingComponent implements OnInit {

	searchUsername = new FormControl();
	user: Observable<UserI>;
	filteredUsers: UserI[] = [];
	receivedRequests$: Observable<FriendRequestI[]> = this.friendService.findRequestsByReceiver()
	sentRequests$: Observable<FriendRequestI[]> = this.friendService.findRequestsByCreator()
	friends$: Observable<FriendRequestI[]> = this.friendService.findAcceptedRequests();
	blocks$: Observable<FriendRequestI[]> = this.friendService.findBlockedRequests();
	friendsList: UserI[] = [];

	constructor(
		private authService: AuthService,
		private userService: UserService,
		private friendService: FriendService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {}

	ngOnInit() {
		this.authService.getUserId().pipe(
			switchMap((id: number) => this.userService.findById(id).pipe(
				tap((user) => {
					this.user = this.userService.findById(user.id);
					this.friends$.pipe(
						tap((request) => {
							for (let i = 0; i < request.length; i++) {
								if (request[i].creator.id == user.id) {
									this.friendsList.push(request[i].receiver);
								}
								else {
									this.friendsList.push(request[i].creator);
								}
							}
						})
					).subscribe();
				})
			))
		).subscribe();

		this.searchUsername.valueChanges.pipe(
			debounceTime(500),
			distinctUntilChanged(),

			switchMap((username: string) => this.userService.findByUsername(username).pipe(
				tap((users: UserI[]) => this.filteredUsers = users)
			))
		).subscribe();
	}

	onSelectUser(user: UserI) {
		this.router.navigate(['../profile/' + user.id], { relativeTo: this.activatedRoute });
	}

	onSelectRequest(event: MatSelectionListChange) {
		this.user.pipe(
			tap((user) => {
				// if current user is receiver, go to creators page
				if (user.id == event.source.selectedOptions.selected[0].value.receiver.id) {
					this.router.navigate(['../profile/' + event.source.selectedOptions.selected[0].value.creator.id], { relativeTo: this.activatedRoute });
				}
				else {
					this.router.navigate(['../profile/' + event.source.selectedOptions.selected[0].value.receiver.id], { relativeTo: this.activatedRoute });
				}
			})
		).subscribe();
	}

	onSelectFriend(event: MatSelectionListChange) {
		this.router.navigate(['../profile/' + event.source.selectedOptions.selected[0].value.id], { relativeTo: this.activatedRoute });
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
