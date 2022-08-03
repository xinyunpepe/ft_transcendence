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
		return this.http.get<FriendRequestI>(`api/users/friend-request/status/${ userId }`);
	}

	findRequestsByCreator(userId: number): Observable<FriendRequestI[]> {
		return this.http.get<FriendRequestI[]>(`api/users/friend-request/creator/${ userId }`);
	}

	findRequestsByReceiver(userId: number): Observable<FriendRequestI[]> {
		return this.http.get<FriendRequestI[]>(`api/users/friend-request/receiver/${ userId }`);
	}

	findPendingRequests(): Observable<FriendRequestI[]> {
		return this.http.get<FriendRequestI[]>(`api/users/friend-request/received/pending`);
	}

	findAcceptedRequests(): Observable<FriendRequestI[]> | undefined {
		return this.http.get<FriendRequestI[]>(`api/users/friend-request/received/accepted`);
	}

	sendFriendRequest(userId: number): Observable<FriendRequestI | { error: string }> {
		return this.http.post<FriendRequestI | { error: string }>(`api/users/friend-request/send/${ userId }`, {});
	}

	removeFriendRequest(userId: number): Observable<FriendRequestI | { error: string }> {
		return this.http.post<FriendRequestI | { error: string }>(`api/users/friend-request/remove/${ userId }`, {});
	}

	responseToRequest(requestId: number, response: string): Observable<FriendRequestI> {
		return this.http.put<FriendRequestI>(`api/users/friend-request/response/${ requestId }`, { response });
	}

	blockUser(userId: number): Observable<FriendRequestI | { error: string } | { success: string }> {
		return this.http.post<FriendRequestI | { error: string } | { success: string }>(`api/users/friend-request/block/${ userId }`, {});
	}

	unblockUser(userId: number): Observable<FriendRequestI | { error: string } | { success: string }> {
		return this.http.post<FriendRequestI | { error: string } | { success: string }>(`api/users/friend-request/unblock/${ userId }`, {});
	}
}
