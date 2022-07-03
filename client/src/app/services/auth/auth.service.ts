import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	baseUrl: string = environment.baseUrl;

	// TEST ONLY
	testUrl: string = 'http://localhost:4200'

	// helper = new JwtHelperService();

	// currentUser: UserI = {
	// 	login: ''
	// };

	constructor(private http: HttpClient) {}

	getLogin() {
		window.location.href = `${this.testUrl}/private/profile/xli`;
	}

	generate2fa() {
		return this.http.post(`${this.baseUrl}/auth/2fa/generate`, {}, {
			// withCredentials: true
		})
	}
}
