import 'rxjs/add/operator/toPromise';
import { Inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { GlobalsService } from './globals.service';
import { Http, RequestOptions, Response } from '@angular/http';

@Injectable()
export class BackendService {
  private errString = 'Bad Response from server';

  constructor(private http: Http, private globals: GlobalsService) { }

  // Admin functions

  userCounts(): Promise<any> {
    let url = this.globals.API_URL + '/admin/users/counts';
    let options = new RequestOptions({ withCredentials: true });
    return this.http.get(url, options).toPromise()
    .then(this.parseJson)
    .catch(this.catchFunction);
  }

  // User authentication

  signin(body, options): Promise<any> {
    // this will set cookie
    let url = this.globals.API_URL + '/account/authenticate/userpasswd';
    options.withCredentials = true;
    return this.http.post(url, body, options).toPromise()
    .then(this.parseJson)
    .catch(this.catchFunction);
  }

  accountStatus(secret?: string): Promise<any> {
    let url = this.globals.API_URL + '/account/status';
    let options = new RequestOptions({ withCredentials: true });
    if (secret) { url = url + '?secret=' + secret; }
    return this.http.get(url, options).toPromise()
    .then(this.parseJson);
  }

  signout(body, options): Promise<any> {
    let url = this.globals.API_URL + '/account/logout';
    options.withCredentials = true;
    return this.http.post(url, body, options).toPromise()
    .then((res: Response) => {
      try { return res.json(); }
      catch (e) { return {}; }
    });
  }

  signup(body, options): Promise<any> {
    // this will set cookie
    let url = this.globals.API_URL + '/account/register/signup';
    options.withCredentials = true;
    return this.http.post(url, body, options).toPromise()
    .then(this.parseJson)
    .catch(this.catchFunction);
  }

  invite(body, options): Promise<any> {
    let url = this.globals.API_URL + '/account/register/teaserShare';
    options.withCredentials = true;
    return this.http.post(url, body, options).toPromise()
    .then(this.parseJson)
    .catch(this.catchFunction);
  }

  recover(body, options): Promise<any> {
    let url = this.globals.API_URL + '/account/recover/email';
    options.withCredentials = true;
    return this.http.post(url, body, options).toPromise()
    .then(this.parseJson)
    .catch(this.catchFunction);
  }

  // User account apis

  pricingPlans(referralCode, options): Promise<any> {
    let url = this.globals.API_URL + '/pricing/plans';
    if (referralCode) { url += '/' + referralCode; }
    return this.http.get(url, options).toPromise()
    .then(this.parseJson)
    .catch(this.catchFunction);
  }

  billingReceipts(options): Promise<any> {
    let url = this.globals.API_URL + '/billing/receipts';
    options.withCredentials = true;
    return this.http.get(url, options).toPromise()
    .then(this.parseJson)
    .catch(this.catchFunction);
  }

  // public apis

  contactForm(body) {
    let url = this.globals.API_URL + '/support/request/new';
    return this.http.post(url, body).toPromise()
    .then(this.parseJson)
    .catch(this.catchFunction);
  }

  networkStatus() {
    let url = this.globals.API_URL + '/network/status';
    return this.http.get(url)
    .map(res => res.json());
  }

  locations() {
    let url = this.globals.API_URL + '/location/list/premium';
    return this.http.get(url)
    .map(res => res.json());
  }

  regions() {
    let url = this.globals.API_URL + '/location/world';
    return this.http.get(url)
    .map(res => res.json());
  }

  // helper functions

  parseJson(res: Response): Promise<any> {
    if (!res['_body']) { return; } // handle empty status 200 return
    try { return res.json(); }
    catch (e) {
      let error = 'Bad Response from server - ' + res;
      return Promise.reject(error);
    }
  }

  catchFunction(error): Promise<any> {
    try {
      let jsonError = error.json();
      return Promise.reject(jsonError);
    }
    catch (parseError) {
      let retError;
      if (error.status) { retError = { message: error._body }; }
      else { retError = { message: error }; }
      return Promise.reject(retError);
    }
  }
}
