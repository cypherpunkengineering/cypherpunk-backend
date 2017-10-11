import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private auth: AuthService,
    private location: Location,
    private session: SessionService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {
    const user = this.session.user;
    const validUserType = [
      'developer',
      'staff'
    ];

    if (user && validUserType.includes(user.account.type)) {
      return Promise.resolve(true);
    }
    else {
      this.router.navigate(['/signin']);
      return Promise.resolve(false);
    }
  }
}
