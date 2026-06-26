import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, of } from 'rxjs';
import { URL_SERVICIOS } from '../../../config/config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  token:string = '';
  user:any;

  private userSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.userSubject.asObservable();

  constructor(
    public http: HttpClient,
    public router: Router,
  ) { 
    this.initAuth();
  }

  initAuth(){
    this.clearLegacyLocalStorage();

    const token = this.getSessionItem("token");
    const user = this.getSessionItem("user");

    if(token && user && this.isTokenValid(token)){
      this.user = JSON.parse(user);
      this.token = token;
      this.userSubject.next(this.user);
      return;
    }

    this.clearSession(false);
  }

  login(email:string,password:string) {
    let URL = URL_SERVICIOS+"/auth/login_ecommerce";
    return this.http.post(URL,{email,password}).pipe(
      map((resp:any) => {
        console.log(resp);
        const result = this.saveSessionStorage(resp);
        return result;
      }),
      catchError((err:any) => {
        console.log(err);
        return of(err);
      })
    )
  }

  saveSessionStorage(resp:any){
    if(resp && resp.access_token){
      this.setSessionItem("token",resp.access_token);
      this.setSessionItem("user",JSON.stringify(resp.user));
      this.token = resp.access_token;
      this.user = resp.user;
      this.userSubject.next(this.user);
      return true;
    }
    return false;
  }

  register(data:any){
    let URL = URL_SERVICIOS+"/auth/register";
    return this.http.post(URL,data);
  }

  verifiedAuth(data:any){
    let URL = URL_SERVICIOS+"/auth/verified_auth";
    return this.http.post(URL,data);
  }

  verifiedMail(data:any){
    let URL = URL_SERVICIOS+"/auth/verified_email";
    return this.http.post(URL,data);
  }

  verifiedCode(data:any){
    let URL = URL_SERVICIOS+"/auth/verified_code";
    return this.http.post(URL,data);
  }

  verifiedNewPassword(data:any){
    let URL = URL_SERVICIOS+"/auth/new_password";
    return this.http.post(URL,data);
  }

  hasValidSession(): boolean {
    return !!this.user && !!this.token && this.isTokenValid(this.token);
  }

  clearSession(redirectToLogin:boolean = false){
    this.removeSessionItem("token");
    this.removeSessionItem("user");
    this.clearLegacyLocalStorage();
    this.user = null;
    this.token = '';
    this.userSubject.next(null);

    if(redirectToLogin){
      this.router.navigateByUrl("/login");
    }
  }

  logout(){
    this.clearSession(true);
  }

  handleUnauthorized(){
    this.clearSession(true);
  }

  private isTokenValid(token:string): boolean {
    try {
      const expiration = (JSON.parse(atob(token.split(".")[1]))).exp;
      return Math.floor((new Date).getTime() / 1000) <= expiration;
    } catch {
      return false;
    }
  }

  private getSessionItem(key:string): string | null {
    try {
      if(typeof sessionStorage === 'undefined') return null;
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private setSessionItem(key:string,value:string){
    try {
      if(typeof sessionStorage === 'undefined') return;
      sessionStorage.setItem(key,value);
    } catch {}
  }

  private removeSessionItem(key:string){
    try {
      if(typeof sessionStorage === 'undefined') return;
      sessionStorage.removeItem(key);
    } catch {}
  }

  private clearLegacyLocalStorage(){
    try {
      if(typeof localStorage === 'undefined') return;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {}
  }
}
