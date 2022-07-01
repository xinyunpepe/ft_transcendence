import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserI } from 'src/app/model/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

	constructor(private http: HttpClient) {}

	findOneUser(login: string): Observable<UserI> {
		return this.http.get('/api/users/' + login);
	}
}
