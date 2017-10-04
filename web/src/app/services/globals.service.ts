import { Injectable } from '@angular/core';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class GlobalsService {
  ENV = 'DEV';
  API_VERSION = 'v1';
  BACKEND_HOST: string;
  API_URL = '/api/' + this.API_VERSION;
  private devAPI = '';
  private testAPI = 'https://test-api.cypherpunk.engineering';
  private stagingAPI = 'https://api.cypherpunk.engineering';
  private prodAPI = 'https://api.cypherpunk.com';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    let browser_env = isPlatformBrowser(platformId);

    // Detect Environment
    if (browser_env) {
      let hostname = document.location.hostname;
      if (hostname.startsWith('localhost')) { this.ENV = 'DEV'; }
      else if (hostname.startsWith('test.cypherpunk')) { this.ENV = 'DEV'; }
      else if (hostname.startsWith('cypherpunk.engineering')) { this.ENV = 'STAGING'; }
      else { this.ENV = 'PROD'; }
    }

    // Detect BACKEND_HOST to use
    if (browser_env) {
      let hostname = document.location.hostname;
      if (hostname.startsWith('localhost')) { this.BACKEND_HOST = this.devAPI; }
      else if (hostname.startsWith('test.cypherpunk')) { this.BACKEND_HOST = this.testAPI; }
      else if (hostname.startsWith('cypherpunk.engineering')) { this.BACKEND_HOST = this.stagingAPI; }
      else { this.BACKEND_HOST = this.prodAPI; }
    }
    else { this.BACKEND_HOST = this.devAPI; }

    this.API_URL = this.BACKEND_HOST + '/api/' + this.API_VERSION;
  }
}
