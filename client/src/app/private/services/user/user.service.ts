import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map, Observable } from 'rxjs';
import { UserI } from 'src/app/model/user.interface';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	constructor(private http: HttpClient) { }

	findById(id: number): Observable<UserI> {
		return this.http.get<UserI>(`${ environment.baseUrl }/users/id/${ id }`).pipe(
			map((user: UserI) => user)
		);
	}

	findByUsername(username: string): Observable<UserI[]> {
		return this.http.get<UserI[]>(`${ environment.baseUrl }/users/username/${ username }`);
	}

	getAvatar(id: number): Observable<Blob> {
		return this.http.get(`${ environment.baseUrl }/users/avatar/${ id }`, { responseType: 'blob' });
	}

	updateUsername(user: UserI): Observable<UserI> {
		return this.http.put<UserI>(`${ environment.baseUrl }/users/username/${ user.id }`, user);
	}

	uploadFile(avatar: FormData): Observable<UserI> {
		return this.http.post<UserI>(`${ environment.baseUrl }/users/avatar`, avatar);
	}
}
