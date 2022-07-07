import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/public/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	constructor(private authService: AuthService) {}

	ngOnInit(): void {
	}

	login() {
		this.authService.login();
	}
}
