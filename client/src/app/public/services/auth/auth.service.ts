import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from "@auth0/angular-jwt";
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { UserI } from 'src/app/model/user.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	constructor(
		private http: HttpClient,
		private jwtService: JwtHelperService,
		private snackbar: MatSnackBar
	) { }

	login() {
		window.location.href = `api/auth/login`;
	}

	getCallback(uri: string) {
		return this.http.get(uri);
	}

	getLoggedInUser() {
		const decodedToken = this.jwtService.decodeToken();
		return decodedToken.user;
	}

	getUserId(): Observable<number> {
		return of(localStorage.getItem('access_token')).pipe(
			switchMap((jwt: string) => of(this.jwtService.decodeToken(jwt)).pipe(
				map((jwt: any) => jwt.user.id)
			))
		);
	}

	putUserOnline(id: number): Observable<UserI>  {
		return this.http.put<UserI>(`api/users/online/${ id }`, {});
	}

	isAuthenticated(): boolean {
		const token = localStorage.getItem('access_token');
		return !this.jwtService.isTokenExpired(token);
	}

	isTwoFactorEnabled(): boolean {
		const decodedToken = this.jwtService.decodeToken();
		if (!decodedToken) {
			return false;
		}
		return decodedToken.user.isTwoFactorEnabled;
	}

	isTwoFactorAuthed(): boolean {
		if (!this.isTwoFactorEnabled()) {
			return true;
		}
		const token = localStorage.getItem('2fa_token');
		return !this.jwtService.isTokenExpired(token);
	}

	logout(user: UserI): Observable<UserI> {
		return this.http.put(`api/auth/logout`, user).pipe(
			tap(() => {
				localStorage.removeItem('access_token');
				if (this.isTwoFactorEnabled()) {
					localStorage.removeItem('2fa_token');
				}
			})
		);
	}

	generate2fa(): Observable<string> {
		return this.http.post<string>(`api/auth/2fa/generate`, {});
	}

	getQrImage(): Observable<Blob> {
		return this.http.get(`api/auth/2fa/qrcode`, { responseType: 'blob' });
	}

	enable2fa(user: UserI, code: string) {
		return this.http.post(`api/auth/2fa/turn-on`, { user, code }).pipe(
			catchError(e => {
				this.snackbar.open(`ERROR: wrong code`, 'Close', {
					duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
				});
				return throwError(e);
			})
		)
	}

	disable2fa(user: UserI, code: string) {
		return this.http.post(`api/auth/2fa/turn-off`, { user, code }).pipe(
			catchError(e => {
				this.snackbar.open(`ERROR: wrong code`, 'Close', {
					duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
				});
				return throwError(e);
			})
		)
	}

	authenticate(user: UserI, code: string) {
		return this.http.post<any>(`api/auth/2fa/authenticate`, { user, code }).pipe(
			tap(res => {
				console.log(res);
				localStorage.setItem('2fa_token', res.access_token)
			}),
			catchError(e => {
				this.snackbar.open(`ERROR: wrong code`, 'Close', {
					duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
				});
				return throwError(e);
			})
		)
	}
}
