import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  API_SERVER = "http://localhost:3000/api";

  constructor(private httpClient : HttpClient) { }

  
  public getUserId(){
    return this.httpClient.get<number>(`${this.API_SERVER}/user-info`);
  }
}

// to delete