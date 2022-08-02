import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FriendRequestI } from 'src/app/model/friend-request.interface';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class FriendService {

	constructor(
		private http: HttpClient
	) {}

	findRequestByUser(userId: number): Observable<FriendRequestI> {
		return this.http.get<FriendRequestI>(`${ environment.baseUrl }/users/friend-request/status/${ userId }`);
	}

	findRequestsByCreator(userId: number): Observable<FriendRequestI[]> {
		return this.http.get<FriendRequestI[]>(`${ environment.baseUrl }/users/friend-request/creator/${ userId }`);
	}

	sendFriendRequest(userId: number): Observable<FriendRequestI | { error: string }> {
		return this.http.post<FriendRequestI | { error: string }>(`${ environment.baseUrl }/users/friend-request/send/${ userId }`, {});
	}

	removeFriendRequest(userId: number): Observable<FriendRequestI | { error: string }> {
		return this.http.post<FriendRequestI | { error: string }>(`${ environment.baseUrl }/users/friend-request/remove/${ userId }`, {});
	}

	responseToRequest(requestId: number, response: string): Observable<FriendRequestI> {
		return this.http.put<FriendRequestI>(`${ environment.baseUrl }/users/friend-request/response/${ requestId }`, { response });
	}

	blockUser(userId: number): Observable<FriendRequestI | { error: string } | { success: string }> {
		return this.http.post<FriendRequestI | { error: string } | { success: string }>(`${ environment.baseUrl }/users/friend-request/block/${ userId }`, {});
	}

	unblockUser(userId: number): Observable<FriendRequestI | { error: string } | { success: string }> {
		return this.http.post<FriendRequestI | { error: string } | { success: string }>(`${ environment.baseUrl }/users/friend-request/unblock/${ userId }`, {});
	}
}
