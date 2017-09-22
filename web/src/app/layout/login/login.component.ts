import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { AuthService } from '../../services/auth.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  user = { email: '', password: '' };
  errors = {
    email: { message: '', touched: false },
    password: { message: '', touched: false }
  };
  signinButtonDisabled = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private backend: BackendService
  ) { }

  validateEmail() {
    let valid = false;
    this.errors.email.touched = true;

    if (!this.user.email) {
      this.errors.email.message = 'Email is Required';
    }
    else if (!/^\S+@\S+$/.test(this.user.email)) {
      this.errors.email.message = 'Email is not properly formatted';
    }
    else {
      valid = true;
      this.errors.email.message = '';
    }

    return valid;
  }

  validatePassword() {
    let valid = false;
    this.errors.password.touched = true;

    if (!this.user.password) {
      this.errors.password.message = 'Password is Required';
    }
    else {
      valid = true;
      this.errors.password.message = '';
    }

    return valid;
  }

  signin() {
    let email = this.validateEmail();
    let password = this.validatePassword();
    if (!email || !password || this.signinButtonDisabled) { return; }
    this.signinButtonDisabled = true;

    this.auth.signin(this.user)
    .then(() => { this.router.navigate(['/']); })
    .catch((err) => { this.signinButtonDisabled = false; });
  }
}
