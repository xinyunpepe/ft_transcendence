import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { map, Observable, switchMap, tap } from 'rxjs';
import { ChannelI, ChannelType } from 'src/app/model/channel.interface';
import { FriendStatus } from 'src/app/model/friend-request.interface';
import { HistoryI } from 'src/app/model/history.interface';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { ChatService } from '../../services/chat/chat.service';
import { FriendService } from '../../services/friend/friend.service';
import { MatchHistoryService } from '../../services/match-history/match-history.service';
import { UserService } from '../../services/user/user.service';

@Component({
	selector: 'app-profile-user',
	templateUrl: './profile-user.component.html',
	styleUrls: ['./profile-user.component.css']
})
export class ProfileUserComponent implements OnInit {

	user: UserI = null;
	currentUserId: number;
	avatar: any;
	requestStatus: number;
	requestId: number;
	directChannel: ChannelI = {};
	matchHistory: Observable<HistoryI>;

	private currentUserId$: Observable<number> = this.activatedRoute.params.pipe(
		map((params: Params) => parseInt(params['id']))
	)

	currentUser$: Observable<UserI> = this.currentUserId$.pipe(
		switchMap((userId: number) => this.userService.findById(userId))
	)

	constructor(
		private activatedRoute: ActivatedRoute,
		private authService: AuthService,
		private userService: UserService,
		private friendService: FriendService,
		private chatService: ChatService,
		private matchHistoryService: MatchHistoryService,
		private router: Router
	) { }

	ngOnInit() {
		this.authService.getUserId().pipe(
			switchMap((id: number) => this.userService.findById(id).pipe(
				tap((user) => {
					this.user = user;
					this.currentUser$.subscribe(currentUser => {
						//TODO || currentuser.ban?
						if (!currentUser) {
							this.router.navigate(['../../page-not-found'], { relativeTo: this.activatedRoute });
						}
						else if (currentUser.id == user.id) {
							this.router.navigate(['../../profile'], { relativeTo: this.activatedRoute });
						}
						else {
							this.currentUserId = currentUser.id;
							this.matchHistory = this.matchHistoryService.findMatchHistory(this.currentUserId);
							this.getRequestStatus();
							this.getAvatar(this.currentUserId);
						}
					})
				})
			))
		).subscribe();
	}

	createDirectChannel() {
		this.chatService.findDirectChannel(this.user.id, this.currentUserId).subscribe(
			channel => {
				if (channel) {
					// TODO redirect to the channel if possible?
					this.router.navigate(['../../dashboard-channel'], { relativeTo: this.activatedRoute });
				}
				else {
					this.userService.findById(this.currentUserId).pipe(
						tap((user: UserI) => {
							this.directChannel.name = 'Direct Channel ' + user.username + ' & ' + this.user.username;
							this.directChannel.users = [];
							this.directChannel.users.push(user);
							this.directChannel.type = ChannelType.PRIVATE;
							this.chatService.createDirectChannel(this.directChannel);
						})
					).subscribe();
					this.router.navigate(['../../dashboard-channel'], { relativeTo: this.activatedRoute });
				}
			}
		)
	}

	/*
	** 0: not-sent
	** 1: pending
	** 2: waiting-for-response
	** 3: accepted
	** 4: declined
	** 5: blocked
	** 6: not-found
	*/
	getRequestStatus() {
		this.requestStatus = 0;
		this.friendService.findRequestByUser(this.currentUserId).pipe(
			tap((request) => {
				if (request) {
					this.requestId = request.id;
					if (request.status == FriendStatus.PENDING) {
						if (request.creator.id === this.user.id) {
							this.requestStatus = 1;
						}
						else {
							this.requestStatus = 2;
						}
					}
					else if (request.status == FriendStatus.ACCEPTED) {
						this.requestStatus = 3;
					}
					else if (request.status === FriendStatus.DECLIEND) {
						this.requestStatus = 4;
					}
					else if (request.status === FriendStatus.WAITING) {
						this.requestStatus = 4;
					}
					else if (request.status === FriendStatus.BLOCKED) {
						if (request.creator.id === this.user.id) {
							this.requestStatus = 5;
						}
						else {
							this.requestStatus = 6;
						}
					}
				}
			})
		).subscribe();
	}

	addFriend() {
		this.friendService.sendFriendRequest(this.currentUserId).subscribe(
			(response) => {
				this.requestStatus = 1;
			}
		)
		// window.location.reload();
	}

	removeFriend() {
		this.friendService.removeFriendRequest(this.currentUserId).subscribe(
			(response) => {
				this.requestStatus = 0;
			}
		)
		// window.location.reload();
	}

	responseToRequest(response: string) {
		this.friendService.responseToRequest(this.requestId, response).subscribe(
			(response) => {
				if (response.status == FriendStatus.ACCEPTED) {
					this.requestStatus = 3;
				}
				if (response.status == FriendStatus.DECLIEND) {
					this.requestStatus = 4;
				}
			}
		)
		// window.location.reload();
	}

	blockUser() {
		this.friendService.blockUser(this.currentUserId).subscribe(
			(response) => {
				this.requestStatus = 5;
			}
		)
		// window.location.reload();
	}

	unblockUser() {
		this.friendService.unblockUser(this.currentUserId).subscribe(
			(response) => {
				this.requestStatus = 5;
			}
		)
		// window.location.reload();
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
			},
			err => {
				console.log(err);
			}
		);
	}
}
