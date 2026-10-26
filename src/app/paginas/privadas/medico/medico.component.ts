import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AutenticacionService } from '../../../servicios/autenticacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-medico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container" style="padding: 20px; font-family: Arial, sans-serif;">
      <h2>Panel Médico - Agenda de Citas Asignadas</h2>
      <button class="btn-logout" (click)="cerrarSesion()" style="background-color: #dc3545; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; float: right;">Cerrar Sesión</button>
      
      <div style="clear: both; margin-top: 20px;">
        <h3>Mis Citas Médicas Programadas</h3>
        <div *ngIf="errorMessage" class="error" style="color: red; margin-bottom: 10px;">{{ errorMessage }}</div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="border: 1px solid #ddd; padding: 10px;">Fecha y Hora</th>
              <th style="border: 1px solid #ddd; padding: 10px;">Paciente</th>
              <th style="border: 1px solid #ddd; padding: 10px;">Estado de la Cita</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cita of citas">
              <td style="border: 1px solid #ddd; padding: 10px;">{{ cita.fecha }}</td>
              <td style="border: 1px solid #ddd; padding: 10px;">{{ cita.pacienteNombre || 'Paciente Registrado' }}</td>
              <td style="border: 1px solid #ddd; padding: 10px;"><strong>{{ cita.estado }}</strong></td>
            </tr>
            <tr *ngIf="citas.length === 0">
              <td colspan="3" style="border: 1px solid #ddd; padding: 15px; text-align: center;">No tienes citas asignadas actualmente.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class MedicoComponent implements OnInit {
  citas: any[] = [];
  errorMessage = '';

  constructor(private authService: AutenticacionService, private http: HttpClient, private router: Router, private ngZone: NgZone) {}

  ngOnInit() {
    const token = (this.authService as any).getToken ? (this.authService as any).getToken() : (this.authService as any).obtenerToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:8080/api/citas/medico', { headers }).subscribe({
      next: (data) => this.ngZone.run(() => { this.citas = data; }),
      error: () => this.ngZone.run(() => { this.errorMessage = 'No se pudieron cargar las citas asignadas.'; })
    });
  }

  cerrarSesion() {
    if ((this.authService as any).logout) { (this.authService as any).logout(); }
    this.router.navigate(['/login']);
  }
}