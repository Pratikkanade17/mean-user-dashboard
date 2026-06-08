import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { User } from '../user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  private api = '/api';
  // backend exposes user routes at /api/users
  private usersApi = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  loadInitial(){
    this.loadingSubject.next(true);
    this.http.get<User[]>(this.usersApi).subscribe(users => {
      this.usersSubject.next(users);
      this.loadingSubject.next(false);
    }, () => this.loadingSubject.next(false));
  }

  addUser(user: User): Observable<User>{
    this.loadingSubject.next(true);
    return this.http.post<User>(this.usersApi, user).pipe(tap(added => {
      const current = this.usersSubject.getValue();
      this.usersSubject.next([added, ...current]);
      this.loadingSubject.next(false);
    }, () => this.loadingSubject.next(false)));
  }
}
