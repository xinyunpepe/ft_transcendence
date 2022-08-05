import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HistoryI } from 'src/app/model/history.interface';

@Injectable({
	providedIn: 'root'
})
export class MatchHistoryService {

	constructor(private http: HttpClient) { }

	findMatchHistory(id: number): Observable<HistoryI> {
		return this.http.get<HistoryI>(`api/history/${ id }`).pipe(
			map((history: HistoryI) => history)
		);
	}
}
