import { BackendService } from './backend.service';
import { Injectable } from '@angular/core';

@Injectable()
export class SessionService {
  userFound = false;
  localStorage: any;
  user = {
    account: { id: '', email: '', confirmed: false, type: '' },
    privacy: { username: '', password: '' },
    secret: '',
    subscription: {
      active: false,
      renews: false,
      type: '',
      expiration: new Date()
    },
    priceModel: 0,
    payOption: 0,
    showGettingStarted: false
  };

  constructor(private backend: BackendService) {

    try {
      this.localStorage = window.localStorage;
      this.user.account.id = this.localStorage.getItem('account.id') || '';
      this.user.account.email = this.localStorage.getItem('account.email') || '';
      this.user.account.confirmed = this.localStorage.getItem('account.confirmed') === 'true';
      this.user.account.type = this.localStorage.getItem('account.type') || '';
      this.user.privacy.username = this.localStorage.getItem('privacy.username') || '';
      this.user.privacy.password = this.localStorage.getItem('privacy.password') || '';
      this.user.secret = this.localStorage.getItem('secret') || '';
      this.user.subscription.active = this.localStorage.getItem('subscription.active') || false;
      this.user.subscription.renews = this.localStorage.getItem('subscription.renews') || false;
      this.user.subscription.type = this.localStorage.getItem('subscription.type') || '';
      let expiration = this.localStorage.getItem('subscription.expiration');
      if (expiration === 'undefined' || !expiration) {
        this.user.subscription.expiration = undefined;
      }
      else { this.user.subscription.expiration = new Date(expiration.replace(/"/g, '')); }
      if (this.user.account.email && this.user.secret) { this.userFound = true; }
    }
    catch (e) {
      this.userFound = false;
      console.log(e);
    };
  }

  setUserData(user) {
    if (!user) { return; }

    if (user.privacy) {
      let username = user.privacy.username || '';
      this.user.privacy.username = username;
      this.localStorage.setItem('privacy.username', username);

      let password = user.privacy.password || '';
      this.user.privacy.password = password;
      this.localStorage.setItem('privacy.password', password);
    }

    if (user.account) {
      let id = user.account.id || '';
      this.user.account.id = id;
      this.localStorage.setItem('account.id', id);

      let email = user.account.email || '';
      this.user.account.email = email;
      this.localStorage.setItem('account.email', email);

      let confirmed = user.account.confirmed || false;
      this.user.account.confirmed = confirmed;
      this.localStorage.setItem('account.confirmed', confirmed);

      let type = user.account.type || '';
      this.user.account.type = type;
      this.localStorage.setItem('account.type', type);
    }

    if (user.subscription) {
      let active = user.subscription.active || false;
      this.user.subscription.active = active;
      this.localStorage.setItem('subscription.active', active);

      let renews = user.subscription.renews || false;
      this.user.subscription.renews = renews;
      this.localStorage.setItem('subscription.renews', renews);

      let type = user.subscription.type || '';
      this.user.subscription.type = type;
      this.localStorage.setItem('subscription.type', type);

      let expiration = user.subscription.expiration;
      if (!expiration || expiration === '0') { expiration = undefined; }
      else { expiration = new Date(expiration); }
      this.user.subscription.expiration = expiration;
      this.localStorage.setItem('subscription.expiration', JSON.stringify(expiration));
    }

    this.user.secret = user.secret || '';
    this.localStorage.setItem('secret', this.user.secret);
  }

  pullPlanData(secret?: string): Promise<any> {
    return this.backend.accountStatus(secret)
    .then((data) => {
      if (data.confirmed) { data.status = 'active'; }
      this.setUserData(data);
      return data;
    })
    .then((data) => {
      data.authed = true;
      return data;
    })
    .catch(() => { return { authed: false }; });
  }

  clearUserData() {
    this.user.secret = '';
    this.localStorage.removeItem('secret');

    this.user.privacy = { username: '', password: '' };
    this.localStorage.removeItem('privacy.username');
    this.localStorage.removeItem('privacy.password');

    this.user.account = { id: '', email: '', confirmed: false, type: '' };
    this.localStorage.removeItem('account.id');
    this.localStorage.removeItem('account.email');
    this.localStorage.removeItem('account.confirmed');
    this.localStorage.removeItem('account.type');

    this.user.subscription = {
      active: false,
      renews: false,
      type: '',
      expiration: undefined
    };
    this.localStorage.removeItem('subscription.active');
    this.localStorage.removeItem('subscription.renews');
    this.localStorage.removeItem('subscription.type');
    this.localStorage.removeItem('subscription.expiration');

    this.userFound = false;
  }
}
