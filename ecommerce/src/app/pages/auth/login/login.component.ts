import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { FormsModule } from '@angular/forms';

declare function password_show_toggle(): any;
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  code_user: string = '';

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    public activedRoute: ActivatedRoute,
  ) { }
  
  ngOnInit(): void {
    // this.toastr.success('Hello world!', 'Toastr fun!');
    // this.showSuccess();
    if(this.authService.token && this.authService.user) {
      setTimeout(() => {
        this.router.navigateByUrl('/');
    }, 500);
    return;
  }
  this.activedRoute.queryParams.subscribe((resp:any) => {
    this.code_user = resp.code;
})

setTimeout(() => {
  password_show_toggle();
}, 50);

if(this.code_user) {
  let data = {
    code_user: this.code_user, 
  }
  this.authService.verifiedAuth(data).subscribe((resp:any) => {
    console.log(resp);
    if(resp.message == 403) {
      this.toastr.error('Validacion', 'El codigo no pertencee a ningun usuario');
    }
    if(resp.message == 200) {
      this.toastr.success('Exito', 'El correo ha sido verificado, puedes iniciar sesion');
      setTimeout(() => {
        this.router.navigateByUrl('/login');
      }, 500);
    }
  })
}
  }

  login() {
    if (!this.email || !this.password) {
      this.toastr.error('Validacion', 'Necesitas ingresar todos los campos');
      return;
    }
    this.authService.login(this.email, this.password).subscribe((resp: any) => {
      console.log('respuesta del backend',resp);
      if(resp.error && resp.error.error == 'Unauthorized') {
        this.toastr.error('Validacion', 'Las credenciales son incorrectas');
        return;
      }
      if(resp == true) {
        this.toastr.success('Exito', 'Bienvenido a la tienda');
        setTimeout(() => {
          this.router.navigateByUrl("/");
        }, 500);
      }
    }, (error) => {
      console.log(error);
    })
  }

  showSuccess() {
    this.toastr.success('Hello world!', 'Toastr fun!');
  }
}
