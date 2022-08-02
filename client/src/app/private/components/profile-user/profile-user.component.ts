import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { map, Observable, switchMap, tap } from 'rxjs';
import { FriendRequestI, FriendStatus } from 'src/app/model/friend-request.interface';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { FriendService } from '../../services/friend/friend.service';
import { UserService } from '../../services/user/user.service';

@Component({
	selector: 'app-profile-user',
	templateUrl: './profile-user.component.html',
	styleUrls: ['./profile-user.component.css']
})
export class ProfileUserComponent implements OnInit {

	user: UserI = this.authService.getLoggedInUser();
	avatar: any;
	currentUser: UserI = {};
	friendRequest: FriendRequestI = {};

	/*
	** 0: pending
	** 1: waiting-for-response
	** 2: accepted
	** 3: declined
	** 4: blocked
	** 5: not-sent
	*/
	requestStatus: number;
	requestId: number;

	private userId$: Observable<number> = this.activatedRoute.params.pipe(
		map((params: Params) => parseInt(params['id']))
	)

	currentUser$ = this.userId$.pipe(
		switchMap((userId: number) => this.userService.findById(userId))
	)

	friendRequest$ = this.userId$.pipe(
		switchMap((userId: number) => this.friendService.findRequestByUser(userId))
	)

	constructor(
		private activatedRoute: ActivatedRoute,
		private authService: AuthService,
		private userService: UserService,
		private friendService: FriendService,
		private router: Router
	) {}

	ngOnInit() {
		// this.currentUser$.subscribe(currentUser => {
		// 	this.currentUser = currentUser;
		// 	if (!this.currentUser) {
		// 		this.router.navigate(['../../page-not-found'], { relativeTo: this.activatedRoute });
		// 	}
		// 	else if (this.currentUser.id == this.user.id) {
		// 		this.router.navigate(['../../profile'], { relativeTo: this.activatedRoute });
		// 	}
		// })

		this.authService.getUserId().pipe(
			switchMap((id: number) => this.userService.findById(id).pipe(
				tap((user) => {
					this.currentUser$.subscribe(currentUser => {
						//TODO || currentuser.ban?
						if (!currentUser) {
							this.router.navigate(['../../page-not-found'], { relativeTo: this.activatedRoute });
						}
						else if (currentUser.id == user.id) {
							this.router.navigate(['../../profile'], { relativeTo: this.activatedRoute });
						}
						else {
							this.currentUser = currentUser;
							this.getAvatar(this.currentUser.id);
						}
					})
				})
			))
		).subscribe();

		this.friendRequest$.subscribe(friendRequest => {
			this.friendRequest = friendRequest;
		})
	}

	isCreator() {
		return this.friendRequest.creator.id === this.user.id;
	}

	isFriend() {
		if (this.friendRequest) {
			this.requestId = this.friendRequest.id;
			if (this.friendRequest.status === FriendStatus.PENDING) {
				if (this.isCreator()) {
					this.requestStatus = 0;
				}
				else {
					this.requestStatus = 1;
				}
			}
			else if (this.friendRequest.status === FriendStatus.ACCEPTED) {
				this.requestStatus = 2;
			}
			else if (this.friendRequest.status === FriendStatus.DECLIEND) {
				this.requestStatus = 3;
			}
			else if (this.friendRequest.status === FriendStatus.BLOCKED) {
				if (this.isCreator()) {
					this.requestStatus = 4;
				}
				else {
					return false;
				}
			}
			else {
				this.requestStatus = 5;
			}
		}
		return true;
	}

	// TODO better solution than window reload?
	addFriend() {
		this.friendService.sendFriendRequest(this.currentUser.id).subscribe(
			() => {
				this.requestStatus = 1;
			}
		)
		window.location.reload();
	}

	removeFriend() {
		this.friendService.removeFriendRequest(this.currentUser.id).subscribe(
			() => {
				this.requestStatus = 5;
			}
		)
		window.location.reload();
	}

	responseToRequest(response: string) {
		this.friendService.responseToRequest(this.requestId, response).subscribe(
			(response) => {
				if (response.status == FriendStatus.ACCEPTED) {
					this.requestStatus = 2;
				}
				if (response.status == FriendStatus.DECLIEND) {
					this.requestStatus = 3;
				}
			}
		)
		window.location.reload();
	}

	blockUser() {
		this.friendService.blockUser(this.currentUser.id).subscribe(
			() => {
				this.requestStatus = 4;
			}
		)
		window.location.reload();
	}

	unblockUser() {
		this.friendService.unblockUser(this.currentUser.id).subscribe(
			() => {
				this.requestStatus = 5;
			}
		)
		window.location.reload();
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
