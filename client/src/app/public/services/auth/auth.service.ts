import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { JwtHelperService } from "@auth0/angular-jwt";
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { UserI } from 'src/app/model/user.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	baseUrl: string = environment.baseUrl;

	constructor(
		private http: HttpClient,
		private cookie: CookieService,
		private jwtService: JwtHelperService,
		private snackbar: MatSnackBar
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

	logout(user: UserI): Observable<UserI> {
		return this.http.put(`${this.baseUrl}/auth/logout`, user).pipe(
			tap(() => {
				localStorage.removeItem('access_token');
				// TODO remove two factor
			})
		)
	}

	generate2fa(): Observable<string> {
		return this.http.post<string>(`${this.baseUrl}/auth/2fa/generate`, {});
	}

	getQrImage(): Observable<Blob> {
		return this.http.get(`${ environment.baseUrl }/auth/2fa/qrcode`, { responseType: 'blob' });
	}

	enable2fa(user: UserI, code: string) {
		return this.http.post(`${ environment.baseUrl }/auth/2fa/turn-on`, { user, code }).pipe(
			catchError(e => {
				this.snackbar.open(`ERROR: wrong code`, 'Close', {
					duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
				});
				return throwError(e);
			})
		)
	}

	disable2fa(user: UserI, code: string) {
		console.log("IN");
		return this.http.post(`${ environment.baseUrl }/auth/2fa/turn-off`, { user, code }).pipe(
			catchError(e => {
				this.snackbar.open(`ERROR: wrong code`, 'Close', {
					duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
				});
				return throwError(e);
			})
		)
	}
}
