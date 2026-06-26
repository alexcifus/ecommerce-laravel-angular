import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';

declare global { interface Window { password_show_toggle?: () => void } }

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email = '';
  password = '';
  code_user = '';

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    public router: Router,
    public activedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      setTimeout(() => window.password_show_toggle?.(), 0);
    });
  }

  ngOnInit(): void {
    if (this.authService.hasValidSession()) {
      setTimeout(() => this.router.navigateByUrl('/'), 0);
      return;
    }

    this.authService.clearSession(false);

    this.activedRoute.queryParams.subscribe((resp: any) => {
      this.code_user = resp.code;
      if (this.code_user) {
        const data = { code_user: this.code_user };
        this.authService.verifiedAuth(data).subscribe((r: any) => {
          if (r.message == 403) this.toastr.error('Validacion', 'EL codigo no pertenece a ningun usuario');
          if (r.message == 200) {
            this.toastr.success('Exito', 'EL correo ha sido verificado, ingresar a la tienda');
            setTimeout(() => this.router.navigateByUrl('/login'), 500);
          }
        });
      }
    });
  }

  login() {
    if (!this.email || !this.password) {
      this.toastr.error('Validacion', 'Necesitas ingresar todos los campos');
      return;
    }
    this.authService.login(this.email, this.password).subscribe((resp: any) => {
      if (resp?.error?.error === 'Unauthorized') {
        this.toastr.error('Validacion', 'Las credenciales son incorrectas');
        return;
      }
      if (resp === true) {
        this.toastr.success('Exito', 'Bienvenido a la tienda');
        setTimeout(() => this.router.navigateByUrl('/'), 500);
      }
    }, (error) => console.log(error));
  }
}
