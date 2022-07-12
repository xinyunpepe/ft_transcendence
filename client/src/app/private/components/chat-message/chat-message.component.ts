import { Component, Input, OnInit } from '@angular/core';
import { MessageI } from 'src/app/model/message.interface';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth/auth.service';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent {

	@Input() message: MessageI;
	userLogin: string = this.authService.getLoggedInUser();

	constructor(private authService: AuthService) {}
}
