import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { ChannelI, ChannelPaginateI } from 'src/app/model/channel.interface';
import { UserI } from 'src/app/model/user.interface';
import { ChatService } from 'src/app/private/services/chat/chat.service';
import { AuthService } from 'src/app/public/services/auth/auth.service';

@Component({
  selector: 'app-dashboard-channel',
  templateUrl: './dashboard-channel.component.html',
  styleUrls: ['./dashboard-channel.component.css']
})
export class DashboardChannelComponent implements OnInit, AfterViewInit {

	// name$ convention for async value
	channels$: Observable<ChannelPaginateI> = this.chatService.getChannels();
	selectedChannel = null;

	constructor(
		private chatService: ChatService
	) {}

	ngOnInit() {
		this.chatService.emitPaginateChannel(10, 0);
	}

	ngAfterViewInit() {
		this.chatService.emitPaginateChannel(10, 0);
	}

	onSelectChannel(event: MatSelectionListChange) {
		this.selectedChannel = event.source.selectedOptions.selected[0].value;
	}

	onPaginateChannels(pageEvent: PageEvent) {
		this.chatService.emitPaginateChannel(pageEvent.pageSize, pageEvent.pageIndex);
	}
}
