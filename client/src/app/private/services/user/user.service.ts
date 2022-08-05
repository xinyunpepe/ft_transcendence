import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UserI } from 'src/app/model/user.interface';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	constructor(private http: HttpClient) {}

	findById(id: number): Observable<UserI> {
		return this.http.get<UserI>(`api/users/id/${ id }`).pipe(
			map((user: UserI) => user)
		);
	}

	findByUsername(username: string): Observable<UserI[]> {
		return this.http.get<UserI[]>(`api/users/username/${ username }`);
	}

	getAvatar(id: number): Observable<Blob> {
		return this.http.get(`api/users/avatar/${ id }`, { responseType: 'blob' });
	}

	updateUsername(user: UserI): Observable<UserI> {
		// return this.http.put<UserI>(`api/users/username/${ user.id }`, user);
		return this.http.put<UserI>(`api/users/username/${ user.id }`, user);
	}

	uploadFile(avatar: FormData): Observable<UserI> {
		return this.http.post<UserI>(`api/users/avatar`, avatar);
	}
}
