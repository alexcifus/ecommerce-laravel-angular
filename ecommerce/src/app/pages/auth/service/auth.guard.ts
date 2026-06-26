import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class PermisionAuth {
  constructor(
    public authService: AuthService,
    public router: Router,
  ) {
    
  }
  canActive(): boolean {
    if(!this.authService.hasValidSession()){
      this.authService.clearSession(false);
      this.router.navigateByUrl("/login");
      return false;
    }
    return true;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  return inject(PermisionAuth).canActive();
};
