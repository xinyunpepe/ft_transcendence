import { Component, OnInit } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { ChannelI, ChannelPaginateI } from 'src/app/model/channel.interface';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { ChatService } from '../../services/chat/chat.service';

@Component({
	selector: 'app-explore-channel',
	templateUrl: './explore-channel.component.html',
	styleUrls: ['./explore-channel.component.css']
	})
	export class ExploreChannelComponent implements OnInit {

	user: UserI = this.authService.getLoggedInUser();
	channels$: Observable<ChannelPaginateI> = this.chatService.getChannels();
	selectedChannel: ChannelI = null;
	isJoined: boolean = false;

	constructor(
		private authService: AuthService,
		private chatService: ChatService
	) {}

	ngOnInit() {
		this.chatService.emitPaginateAllChannel(10, 0);
	}

	ngAfterViewInit() {
		this.chatService.emitPaginateAllChannel(10, 0);
	}

	onSelectChannel(event: MatSelectionListChange) {
		this.selectedChannel = event.source.selectedOptions.selected[0].value;
		this.chatService.findChannelById(this.selectedChannel.id).subscribe(channel => {
			this.selectedChannel = channel;
			if (this.selectedChannel.users && this.selectedChannel.users.find(user => user.id === this.user.id)) {
				this.isJoined = true;
			}
			else {
				this.isJoined = false;
			}
		})
	}

	onPaginateChannels(pageEvent: PageEvent) {
		this.chatService.emitPaginateAllChannel(pageEvent.pageSize, pageEvent.pageIndex);
	}
}
