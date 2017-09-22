import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';
import { SessionService } from './session.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Headers, RequestOptions } from '@angular/http';

@Injectable()
export class AuthService {
  authed = false;
  redirectUrl: string;
  _auth: BehaviorSubject<any>;

  constructor(private session: SessionService, private backend: BackendService) {
    this._auth = new BehaviorSubject({});
  }

  getAuthObservable() {
    return this._auth.asObservable();
  }

  signup(user): Promise<void> {
    let body = { email: user.email, password: user.password };
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({ headers: headers });

    // this will set cookie
    return this.backend.signup(body, options)
    // set user session data
    .then((data) => { this.session.setUserData(data); return data; })
    .then((data) => { this._auth.next(data); })
    // turn authed on
    .then(() => { this.authed = true; });
  }

  signin(user): Promise<void> {
    let body = { login: user.email, password: user.password };
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({ headers: headers });

    // this will set cookie
    return this.backend.signin(body, options)
    // set user session data
    .then((data) => { this.session.setUserData(data); return data; })
    .then((data) => { this._auth.next(data); })
    // turn authed on
    .then(() => { this.authed = true; });
  }

  signout() {
    let body = { };
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({ headers: headers });

    return this.backend.signout(body, options)
    // clear session
    .then(() => { this.session.clearUserData(); })
    .then(() => { this._auth.next(false); })
    // turn off authed
    .then(() => { this.authed = false; });
  }
}
