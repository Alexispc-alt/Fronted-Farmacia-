import { Component, OnInit, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AutenticacionService } from '../../../servicios/autenticacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recepcion-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recepcion-dashboard.component.html',
  styleUrls: ['./recepcion-dashboard.component.css']
})
export class RecepcionDashboardComponent implements OnInit {
  listaCitas: any[] = [];
  filtroRecepcion: string = '';
  mostrarFormularioCrear: boolean = false;
  nuevaCita = { fechaHora: '', pacienteId: '', medicoId: '', estado: 'PROGRAMADA' };
  isDarkMode = false;
  fontSizeLarge = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AutenticacionService, private http: HttpClient, private router: Router, private ngZone: NgZone) {}

  ngOnInit() { this.cargarCitas(); }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.altKey && event.key === 'd') {
      event.preventDefault();
      this.toggleTheme();
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme', this.isDarkMode);
  }

  alternarTamanioLetra() {
    this.fontSizeLarge = !this.fontSizeLarge;
    const root = document.documentElement;
    root.style.setProperty('--font-size-base', this.fontSizeLarge ? '1.15rem' : '1rem');
  }

  get citasFiltradas() {
    return this.listaCitas.filter(c => `${c.id} ${c.fechaHora || c.fecha} ${c.estado} ${c.pacienteNombre || ''}`.toLowerCase().includes(this.filtroRecepcion.toLowerCase()));
  }

  obtenerTokenSeguro(): string {
    const s = this.authService as any;
    return s.getToken ? s.getToken() : (localStorage.getItem('token') || '');
  }

  cargarCitas() {
    const token = this.obtenerTokenSeguro();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>('http://localhost:8080/api/citas', { headers }).subscribe({
      next: (data) => { this.ngZone.run(() => { this.listaCitas = data || []; }); },
      error: () => { this.ngZone.run(() => { this.errorMessage = 'No se pudieron cargar las citas.'; }); }
    });
  }

  crearCita() {
    const token = this.obtenerTokenSeguro();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post('http://localhost:8080/api/citas', this.nuevaCita, { headers }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMessage = '¡Cita médica creada con éxito!';
          this.mostrarFormularioCrear = false;
          this.nuevaCita = { fechaHora: '', pacienteId: '', medicoId: '', estado: 'PROGRAMADA' };
          this.cargarCitas();
        });
      },
      error: () => { this.ngZone.run(() => { this.errorMessage = 'Error al crear la cita.'; }); }
    });
  }

  cambiarEstado(id: number, estado: string) {
    const token = this.obtenerTokenSeguro();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.put(`http://localhost:8080/api/citas/${id}/estado`, { estado }, { headers }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMessage = `Cita #${id} actualizada a ${estado}.`;
          this.cargarCitas();
        });
      },
      error: () => { this.ngZone.run(() => { this.errorMessage = 'Error al actualizar estado.'; }); }
    });
  }

  cerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}