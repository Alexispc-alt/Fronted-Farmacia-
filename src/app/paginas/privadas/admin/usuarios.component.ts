import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AutenticacionService } from '../../../servicios/autenticacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container" style="padding: 20px; font-family: Arial, sans-serif;">
      <h2>Panel de Administración - Control Total del Sistema</h2>
      <button class="btn-logout" (click)="cerrarSesion()" style="background-color: #dc3545; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; float: right;">Cerrar Sesión</button>
      
      <div style="clear: both; margin-top: 15px; margin-bottom: 20px;">
        <button (click)="cambiarVista('pendientes')" [style.background-color]="vistaActual === 'pendientes' ? '#007bff' : '#f8f9fa'" [style.color]="vistaActual === 'pendientes' ? 'white' : 'black'" style="padding: 8px 15px; border: 1px solid #ddd; cursor: pointer; border-radius: 4px 0 0 4px;">Cuentas Pendientes</button>
        <button (click)="cambiarVista('todos')" [style.background-color]="vistaActual === 'todos' ? '#007bff' : '#f8f9fa'" [style.color]="vistaActual === 'todos' ? 'white' : 'black'" style="padding: 8px 15px; border: 1px solid #ddd; cursor: pointer; border-radius: 0 4px 4px 0;">Gestión Global de Usuarios</button>
      </div>

      <div *ngIf="errorMessage" class="error" style="color: red; margin-bottom: 15px;">{{ errorMessage }}</div>
      <div *ngIf="successMessage" class="success" style="color: green; margin-bottom: 15px;">{{ successMessage }}</div>

      <!-- VISTA 1: CUENTAS PENDIENTES DE APROBACIÓN -->
      <div *ngIf="vistaActual === 'pendientes'">
        <h3>Cuentas Pendientes de Aprobación</h3>
        <table class="user-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="border: 1px solid #ddd; padding: 10px;">Nombre</th>
              <th style="border: 1px solid #ddd; padding: 10px;">Email</th>
              <th style="border: 1px solid #ddd; padding: 10px;">Rol Asignado</th>
              <th style="border: 1px solid #ddd; padding: 10px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of usuariosPendientes">
              <td style="border: 1px solid #ddd; padding: 10px;">{{ u.nombre }} {{ u.apellido }}</td>
              <td style="border: 1px solid #ddd; padding: 10px;">{{ u.email }}</td>
              <td style="border: 1px solid #ddd; padding: 10px;">{{ u.rol }}</td>
              <td style="border: 1px solid #ddd; padding: 10px;">
                <button (click)="cambiarEstado(u.id, 'APROBADO')" style="background-color: #28a745; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; margin-right: 5px;">Aprobar</button>
                <button (click)="cambiarEstado(u.id, 'RECHAZADA')" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Rechazar</button>
              </td>
            </tr>
            <tr *ngIf="usuariosPendientes.length === 0">
              <td colspan="4" style="border: 1px solid #ddd; padding: 15px; text-align: center;">No hay cuentas pendientes en este momento.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- VISTA 2: GESTIÓN GLOBAL (Médicos, Pacientes, Recepción, Admins) -->
      <div *ngIf="vistaActual === 'todos'">
        <h3>Gestión Global de Usuarios y Roles</h3>
        <p style="font-size: 14px; color: #666;">Aquí puedes visualizar a todo el personal y pacientes del centro médico, y modificar sus roles de forma directa si lo requieres.</p>
        
        <table class="user-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="border: 1px solid #ddd; padding: 10px;">ID</th>
              <th style="border: 1px solid #ddd; padding: 10px;">Nombre Completo</th>
              <th style="border: 1px solid #ddd; padding: 10px;">Email</th>
              <th style="border: 1px solid #ddd; padding: 10px;">Estado Actual</th>
              <th style="border: 1px solid #ddd; padding: 10px;">Rol</th>
              <th style="border: 1px solid #ddd; padding: 10px;">Acción de Rol</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of todosLosUsuarios">
              <td style="border: 1px solid #ddd; padding: 10px;">{{ u.id }}</td>
              <td style="border: 1px solid #ddd; padding: 10px;">{{ u.nombre }} {{ u.apellido }}</td>
              <td style="border: 1px solid #ddd; padding: 10px;">{{ u.email }}</td>
              <td style="border: 1px solid #ddd; padding: 10px;"><strong>{{ u.estado }}</strong></td>
              <td style="border: 1px solid #ddd; padding: 10px;">
                <select [(ngModel)]="u.nuevoRolSeleccionado" style="padding: 5px;">
                  <option value="ROLE_ADMIN">ADMIN</option>
                  <option value="ROLE_MEDICO">MEDICO</option>
                  <option value="ROLE_RECEPCION">RECEPCION</option>
                  <option value="ROLE_PACIENTE">PACIENTE</option>
                </select>
              </td>
              <td style="border: 1px solid #ddd; padding: 10px;">
                <button (click)="actualizarRol(u.id, u.nuevoRolSeleccionado)" style="background-color: #17a2b8; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Actualizar Rol</button>
              </td>
            </tr>
            <tr *ngIf="todosLosUsuarios.length === 0">
              <td colspan="6" style="border: 1px solid #ddd; padding: 15px; text-align: center;">No se encontraron usuarios en el sistema.</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  `
})
export class UsuariosComponent implements OnInit {
  vistaActual: 'pendientes' | 'todos' = 'pendientes';
  usuariosPendientes: any[] = [];
  todosLosUsuarios: any[] = [];
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AutenticacionService,
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cambiarVista(vista: 'pendientes' | 'todos') {
    this.vistaActual = vista;
    this.errorMessage = '';
    this.successMessage = '';
    this.cargarDatos();
  }

  cargarDatos() {
    const token = (this.authService as any).getToken ? (this.authService as any).getToken() : (this.authService as any).obtenerToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Cargar todos los usuarios para la gestión global y filtrar pendientes
    this.http.get<any[]>('http://localhost:8080/api/admin/usuarios', { headers }).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.todosLosUsuarios = data.map(u => ({
            ...u,
            nuevoRolSeleccionado: u.rol // Inicializamos el selector con el rol actual
          }));
          this.usuariosPendientes = data.filter(u => u.estado === 'PENDIENTE');
        });
      },
      error: (err) => {
        console.error('Error al cargar la lista general de usuarios:', err);
        this.ngZone.run(() => { 
          this.errorMessage = 'No se pudo conectar con el servidor para obtener los usuarios.'; 
        });
      }
    });
  }

  cambiarEstado(id: number, nuevoEstado: string) {
    this.errorMessage = '';
    this.successMessage = '';
    const token = (this.authService as any).getToken ? (this.authService as any).getToken() : (this.authService as any).obtenerToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`http://localhost:8080/api/admin/usuarios/${id}/estado`, { nuevoEstado }, { headers }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMessage = `Cuenta actualizada a estado: ${nuevoEstado} exitosamente.`;
          this.cargarDatos();
        });
      },
      error: (err) => {
        console.error('Error al cambiar el estado del usuario:', err);
        this.ngZone.run(() => {
          this.errorMessage = 'Error al actualizar el estado de la cuenta.';
        });
      }
    });
  }

  actualizarRol(id: number, nuevoRol: string) {
    this.errorMessage = '';
    this.successMessage = '';
    const token = (this.authService as any).getToken ? (this.authService as any).getToken() : (this.authService as any).obtenerToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Endpoint genérico o específico para actualizar el rol del usuario en tu backend
    this.http.put(`http://localhost:8080/api/admin/usuarios/${id}/rol`, { nuevoRol }, { headers }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMessage = `¡Rol actualizado a ${nuevoRol} con éxito!`;
          this.cargarDatos();
        });
      },
      error: (err) => {
        console.error('Error al actualizar el rol:', err);
        this.ngZone.run(() => {
          this.errorMessage = 'Error al actualizar el rol del usuario.';
        });
      }
    });
  }

  cerrarSesion() {
    if ((this.authService as any).logout) {
      (this.authService as any).logout();
    }
    this.router.navigate(['/login']);
  }
}