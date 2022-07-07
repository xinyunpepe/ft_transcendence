import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	baseUrl: string = environment.baseUrl;

	constructor(
		private http: HttpClient,
		private cookie: CookieService,
		private jwtService: JwtHelperService
	) {}

	login() {
		window.location.href = `${this.baseUrl}/auth/login`;
	}

	getAccessToken() {
		return this.cookie.get('accessToken');
	}

	getLoggedInUser() {
		// const helper = new JwtHelperService();
		// const decodedToken = helper.decodeToken(this.getAccessToken());

		const decodedToken = this.jwtService.decodeToken();
		return decodedToken.login;
	}

	logout() {
		return this.http.post(`${this.baseUrl}/auth/logout`, {}, {
			// withCredentials: true
		});
	}

	generate2fa() {
		return this.http.post(`${this.baseUrl}/auth/logout`, {}, {
			withCredentials: true
		})
	}
}
