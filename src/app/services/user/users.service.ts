import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../models/user';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly API = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
  }

  getUsers(): Observable<User[]> {
    return this.http
      .get<any>(`${this.API}/users`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res?.data ?? res));
  }

  updateUserRole(userId: number, role: 'admin' | 'employee' | 'client'): Observable<User> {
    return this.http
      .patch<any>(
        `${this.API}/users/${userId}/role`,
        { role },
        { headers: this.getAuthHeaders() }
      )
      .pipe(map((res: any) => res?.data ?? res));
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.API}/users/${userId}`, { headers: this.getAuthHeaders() });
  }
}
