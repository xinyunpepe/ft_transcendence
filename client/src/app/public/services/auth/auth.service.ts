import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { JwtHelperService } from "@auth0/angular-jwt";
import { map, Observable, of, switchMap } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	baseUrl: string = environment.baseUrl;

	constructor(
		private http: HttpClient,
		private cookie: CookieService,
		private jwtService: JwtHelperService
	) { }

	login() {
		window.location.href = `${this.baseUrl}/auth/login`;
	}

	getAccessToken() {
		return this.cookie.get('accessToken');
	}

	getLoggedInUser() {
		const decodedToken = this.jwtService.decodeToken();
		return decodedToken.user;
	}

	getUserId(): Observable<number> {
		return of(localStorage.getItem('access_token')).pipe(
			switchMap((jwt: string) => of(this.jwtService.decodeToken(jwt)).pipe(
				map((jwt: any) => jwt.user.id)
			)));
	}

	isAuthenticated(): boolean {
		const token = localStorage.getItem('access_token');
		return !this.jwtService.isTokenExpired(token);
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
