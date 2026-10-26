import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AutenticacionService } from '../../../servicios/autenticacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-paciente',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container" style="padding: 20px; font-family: Arial, sans-serif;">
      <h2>Mi Portal de Paciente - Citas Médicas</h2>
      <button class="btn-logout" (click)="cerrarSesion()" style="background-color: #dc3545; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; float: right;">Cerrar Sesión</button>
      
      <div style="clear: both; margin-top: 20px;">
        <h3>Mis Citas Programadas</h3>
        <div *ngIf="errorMessage" style="color: red; margin-bottom: 10px;">{{ errorMessage }}</div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="border: 1px solid #ddd; padding: 10px;">Fecha</th>
              <th style="border: 1px solid #ddd; padding: 10px;">Médico Asignado</th>
              <th style="border: 1px solid #ddd; padding: 10px;">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cita of misCitas">
              <td style="border: 1px solid #ddd; padding: 10px;">{{ cita.fecha }}</td>
              <td style="border: 1px solid #ddd; padding: 10px;">Dr. {{ cita.medicoNombre || 'Especialista' }}</td>
              <td style="border: 1px solid #ddd; padding: 10px;"><strong>{{ cita.estado }}</strong></td>
            </tr>
            <tr *ngIf="misCitas.length === 0">
              <td colspan="3" style="border: 1px solid #ddd; padding: 15px; text-align: center;">No tienes citas registradas actualmente.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PacienteComponent implements OnInit {
  misCitas: any[] = [];
  errorMessage = '';

  constructor(private authService: AutenticacionService, private http: HttpClient, private router: Router, private ngZone: NgZone) {}

  ngOnInit() {
    const token = (this.authService as any).getToken ? (this.authService as any).getToken() : (this.authService as any).obtenerToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:8080/api/citas/mis-citas', { headers }).subscribe({
      next: (data) => this.ngZone.run(() => { this.misCitas = data; }),
      error: () => this.ngZone.run(() => { this.errorMessage = 'No se pudieron cargar tus citas médicas.'; })
    });
  }

  cerrarSesion() {
    if ((this.authService as any).logout) { (this.authService as any).logout(); }
    this.router.navigate(['/login']);
  }
}