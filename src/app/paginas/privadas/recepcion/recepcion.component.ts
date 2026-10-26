import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AutenticacionService } from '../../../servicios/autenticacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recepcion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container" style="padding: 20px; font-family: Arial, sans-serif;">
      <h2>Panel de Recepción - Gestión de Citas y Pacientes</h2>
      <button class="btn-logout" (click)="cerrarSesion()" style="background-color: #dc3545; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; float: right;">Cerrar Sesión</button>
      
      <div style="clear: both; margin-top: 20px; max-width: 500px; background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h3>Agendar Nueva Cita Médica</h3>
        
        <div *ngIf="successMessage" style="color: green; margin-bottom: 10px;">{{ successMessage }}</div>
        <div *ngIf="errorMessage" style="color: red; margin-bottom: 10px;">{{ errorMessage }}</div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px;">Fecha de la Cita:</label>
          <input type="datetime-local" [(ngModel)]="fechaCita" style="width: 100%; padding: 8px;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px;">ID del Paciente:</label>
          <input type="text" [(ngModel)]="pacienteId" placeholder="Ej. 1" style="width: 100%; padding: 8px;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px;">ID del Médico:</label>
          <input type="text" [(ngModel)]="medicoId" placeholder="Ej. 2" style="width: 100%; padding: 8px;">
        </div>
        
        <button (click)="agendarCita()" style="background-color: #28a745; color: white; border: none; padding: 10px 15px; cursor: pointer; border-radius: 4px; width: 100%;">Registrar Cita en el Sistema</button>
      </div>
    </div>
  `
})
export class RecepcionComponent {
  fechaCita = '';
  pacienteId = '';
  medicoId = '';
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AutenticacionService, private http: HttpClient, private router: Router, private ngZone: NgZone) {}

  agendarCita() {
    this.successMessage = '';
    this.errorMessage = '';
    const token = (this.authService as any).getToken ? (this.authService as any).getToken() : (this.authService as any).obtenerToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { fecha: this.fechaCita, pacienteId: this.pacienteId, medicoId: this.medicoId };

    this.http.post('http://localhost:8080/api/citas', body, { headers }).subscribe({
      next: () => this.ngZone.run(() => { this.successMessage = '¡Cita agendada con éxito!'; }),
      error: () => this.ngZone.run(() => { this.errorMessage = 'Error al agendar cita. Verifique los IDs y la fecha.'; })
    });
  }

  cerrarSesion() {
    if ((this.authService as any).logout) { (this.authService as any).logout(); }
    this.router.navigate(['/login']);
  }
}