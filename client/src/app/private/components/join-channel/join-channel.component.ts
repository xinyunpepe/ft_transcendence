import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelI, ChannelType } from 'src/app/model/channel.interface';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { ChatService } from '../../services/chat/chat.service';

@Component({
	selector: 'app-join-channel',
	templateUrl: './join-channel.component.html',
	styleUrls: ['./join-channel.component.css']
})
export class JoinChannelComponent implements OnChanges {

	@Input() joinChannel: ChannelI;
	@Input() isJoined: boolean;
	user: UserI = this.authService.getLoggedInUser();
	protected = ChannelType.PROTECTED;

	password: FormControl = new FormControl({ value: '', disabled: false }, [Validators.required]);

	constructor(
		private authService: AuthService,
		private chatService: ChatService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private snackbar: MatSnackBar
	) {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['isJoined']) {
			this.isJoined = changes['isJoined'].currentValue;
		}
	}

	addUser() {
		if (this.isJoined) {
			return ;
		}
		if (this.password.value === undefined) {
			this.password.setValue('');
		}
		this.chatService.addUser(this.joinChannel, this.password.value);
		setTimeout(() => {
			if (this.joinChannel.type === this.protected) {
				// check backend if the user has been added to the room successfully
				this.chatService.joinProtectedChannel(this.joinChannel.id, this.user.id).subscribe();
			}
			else {
				this.router.navigate(['../dashboard-channel'], { relativeTo: this.activatedRoute });
				this.snackbar.open('You joined the channel', 'Close', {
					duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
				});
			}
		}, 500)
	}
}
