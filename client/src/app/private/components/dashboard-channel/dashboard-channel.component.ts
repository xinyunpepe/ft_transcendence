import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UserI } from 'src/app/model/user.interface';
import { ChatService } from 'src/app/private/services/chat/chat.service';
import { AuthService } from 'src/app/public/services/auth/auth.service';

@Component({
  selector: 'app-dashboard-channel',
  templateUrl: './dashboard-channel.component.html',
  styleUrls: ['./dashboard-channel.component.css']
})
export class DashboardChannelComponent implements OnInit {

	// name$ convention for async value
	channels$ = this.chatService.getChannels();

	// channels: ChannelI[] = [];

	selectedChannel = null;
	user: UserI = this.authService.getLoggedInUser();

	constructor(
		private chatService: ChatService,
		private authService: AuthService
	) {}

	ngOnInit() {
		this.chatService.createChannel();
		// this.chatService.emitChannels();
	}

	// ngAfterViewInit() {
	// 	this.chatService.emitChannels();
	// }

}
