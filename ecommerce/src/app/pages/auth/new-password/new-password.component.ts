import { Component, Input } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.css'
})
export class NewPasswordComponent {

  new_password:string='';
  isLoadingCode: any = null;
  @Input() code:any;
  constructor(
      public authService: AuthService,
      private toastr: ToastrService,
      private router: Router,
    ) { 
      
    }
  
    verifiedNewPassword() {
      if (!this.new_password) {
        this.toastr.error('Validacion', 'Necesitas ingresar el código de verificación');
      }
      let data = {
        new_password: this.new_password,
        code: this.code
      }
      this.authService.verifiedCode(data).subscribe((resp:any) => {
        console.log(resp);        
        this.toastr.success('Exito', 'La contraseña se ha cambiado correctamente');
        this.router.navigateByUrl('/login')
      });
    }
}
