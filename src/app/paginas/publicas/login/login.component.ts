import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AutenticacionService } from '../../../servicios/autenticacion.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  modo: 'login' | 'registro' | 'verificacion' = 'login';
  emailLogin = '';
  passwordLogin = '';
  nombre = '';
  apellido = '';
  emailRegistro = '';
  passwordRegistro = '';
  codigoVerificacion = '';
  emailParaVerificar = '';
  errorMessage = '';
  successMessage = '';
  cargando = false;
  isDarkMode = false;
  fontSizeLarge = false;

  constructor(private authService: AutenticacionService, private http: HttpClient, private router: Router, private ngZone: NgZone) {}

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme', this.isDarkMode);
  }

  alternarTamanioLetra() {
    this.fontSizeLarge = !this.fontSizeLarge;
    const root = document.documentElement;
    root.style.setProperty('--font-size-base', this.fontSizeLarge ? '1.15rem' : '1rem');
  }

  cambiarModo(nuevoModo: 'login' | 'registro' | 'verificacion') {
    this.modo = nuevoModo;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onLogin() {
    this.errorMessage = '';
    this.successMessage = '';
    this.cargando = true;
    this.authService.login({ email: this.emailLogin, password: this.passwordLogin }).subscribe({
      next: () => {
        const rol = (this.authService.obtenerRol() || '').toUpperCase();
        this.ngZone.run(() => {
          this.cargando = false;
          if (rol.includes('ADMIN')) this.router.navigate(['/admin/dashboard']);
          else if (rol.includes('MEDICO')) this.router.navigate(['/medico/dashboard']);
          else if (rol.includes('RECEPCION')) this.router.navigate(['/recepcion/dashboard']);
          else this.router.navigate(['/paciente/dashboard']);
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.cargando = false;
          this.errorMessage = 'Credenciales inválidas, cuenta pendiente o no verificada.';
        });
      }
    });
  }

  onRegistrar() {
    this.errorMessage = '';
    this.successMessage = '';
    this.cargando = true;
    this.http.post<any>('http://localhost:8080/api/auth/registro', {
      nombre: this.nombre, apellido: this.apellido, email: this.emailRegistro, password: this.passwordRegistro
    }).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.cargando = false;
          this.emailParaVerificar = res.email || this.emailRegistro;
          this.successMessage = '¡Registro exitoso! Código enviado a tu correo.';
          this.cambiarModo('verificacion');
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.cargando = false;
          this.errorMessage = 'Error al registrar. Verifica los datos.';
        });
      }
    });
  }

  onVerificarCodigo() {
    this.errorMessage = '';
    this.successMessage = '';
    this.cargando = true;
    this.http.post<any>('http://localhost:8080/api/auth/verificar', {
      email: this.emailParaVerificar, codigo: (this.codigoVerificacion || '').trim()
    }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.cargando = false;
          this.successMessage = '¡Cuenta verificada! A la espera de aprobación del Administrador.';
          this.cambiarModo('login');
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.cargando = false;
          this.errorMessage = 'Código incorrecto o expirado.';
        });
      }
    });
  }
}