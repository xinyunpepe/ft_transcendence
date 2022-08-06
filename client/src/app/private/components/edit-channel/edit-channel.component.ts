import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { ChannelI } from 'src/app/model/channel.interface';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { ChatService } from '../../services/chat/chat.service';
import { UserService } from '../../services/user/user.service';

@Component({
	selector: 'app-edit-channel',
	templateUrl: './edit-channel.component.html',
	styleUrls: ['./edit-channel.component.css']
})
export class EditChannelComponent implements OnInit {

	user: UserI = this.authService.getLoggedInUser();
	channel: ChannelI = {};
	radiocheck: boolean = true;
	beforeType: string = 'public';
	form: FormGroup = new FormGroup({
		id: new FormControl(''),
		password: new FormControl({ value: '', disabled: true }),
		owner: new FormControl(''),
		type: new FormControl(null ,[Validators.required]),
	});

	private channelId$: Observable<number> = this.activatedRoute.params.pipe(
		map((params: Params) => parseInt(params['id']))
	)

	channel$ = this.channelId$.pipe(
		switchMap((channelId: number) => this.chatService.findChannelById(channelId))
	)

	constructor(
		private activatedRoute: ActivatedRoute,
		private chatService: ChatService,
		private authService: AuthService,
		private userService: UserService,
		private snackbar: MatSnackBar,
		private router: Router
	) {}

	ngOnInit() {
		this.userService.findById(this.user.id).subscribe(user => {
			this.user = user;
			this.channel$.subscribe(channel => {
				this.channel = channel;
				this.channel$ = this.channel$.pipe(
					map(channel => {
						return {
							...channel,
							users: channel.users.filter(user => user.id !== this.user.id)
						};
					})
				)
				this.form.patchValue({
					id: this.channel.id,
					owner: this.channel.owner,
				});
			});
		});
	}

	modify() {
		if (this.form.valid) {
			this.chatService.changeType(this.form.getRawValue());
			this.snackbar.open(`You have motified the channel successfully`, 'Close', {
				duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
			});
			this.router.navigate(['../../dashboard-channel'], { relativeTo: this.activatedRoute });
		}
	}

	radioType($event: MatRadioChange) {
		if ($event.value == 'public') {
			this.form.get('password').clearValidators();
			this.form.get('password').disable();
			this.form.get('password').setValue('');
			this.form.get('type').setValue('public');
			this.beforeType = 'public';
		}
		else if ($event.value == 'private') {
			this.form.get('password').clearValidators();
			this.form.get('password').disable();
			this.form.get('password').setValue('');
			this.form.get('type').setValue('private');
			this.beforeType = 'private';
		}
		else {
			this.form.get('password').setValidators([Validators.required]);
			this.form.get('password').enable();
			this.form.get('type').setValue('protected');
			this.beforeType = 'protected';
		}
	}

	isOwner(user: UserI) {
		return this.channel.owner && this.channel.owner.id === user.id;
	}

	isAdmin(user: UserI) {
		return this.channel.admin && this.channel.admin.find(admin => admin.id === user.id);
	}

	isMute(user: UserI) {
		return this.channel.mute && this.channel.mute.find(mute => mute.id === user.id);
	}

	removeUser(user: UserI) {
		this.unsetAdmin(user);
		this.unmuteUser(user);
		if (user.id === this.channel.owner.id) {
			this.snackbar.open('You can\'t remove the owner', 'Close', {
				duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
			});
		}
		else {
			this.chatService.removeUser(this.channel, user);
			this.snackbar.open(`You have removed ${ user.username } from the channel`, 'Close', {
				duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
			});
		}
	}

	setAdmin(user: UserI) {
		this.chatService.setAdmin(this.channel, user);
		this.channel.admin.push(user);
		this.snackbar.open(`You have set ${ user.username } as admin`, 'Close', {
			duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
		});
	}

	unsetAdmin(user: UserI) {
		if (user.id === this.channel.owner.id) {
			this.snackbar.open('You can\'t unset admin for the owner', 'Close', {
				duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
			});
		}
		else {
			this.chatService.unsetAdmin(this.channel, user);
			this.channel.admin = this.channel.admin.filter(admin => admin.id !== user.id);
			this.snackbar.open(`You have unset ${ user.username } as admin`, 'Close', {
				duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
			});
		}
	}

	muteUser(user: UserI) {
		if (user.id === this.channel.owner.id) {
			this.snackbar.open('You can\'t mute the owner', 'Close', {
				duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
			});
		}
		else {
			this.chatService.muteUser(this.channel, user);
			this.channel.mute.push(user);
			this.snackbar.open(`You have muted ${ user.username }`, 'Close', {
				duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
			});
		}
	}

	unmuteUser(user: UserI) {
		this.chatService.unmuteUser(this.channel, user);
		this.channel.mute = this.channel.mute.filter(mute => mute.id !== user.id);
		this.snackbar.open(`You have unmuted ${ user.username }`, 'Close', {
			duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
		});
	}
}
