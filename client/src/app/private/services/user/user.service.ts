import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { UserI } from 'src/app/model/user.interface';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	constructor(private http: HttpClient) { }

	findByUsername(username: string): Observable<UserI[]> {
		return this.http.get<UserI[]>(`${environment.baseUrl}/users/username/${username}`);
	}
}
