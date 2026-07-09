import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  contactForm = {
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
  };

  messageSent = false;

  sendMessage() {
    this.messageSent = true;
    this.contactForm = {
      nombre: '',
      email: '',
      asunto: '',
      mensaje: '',
    };
  }
}
