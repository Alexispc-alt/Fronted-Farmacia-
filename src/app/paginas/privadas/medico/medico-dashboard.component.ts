import { Component, OnInit, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AutenticacionService } from '../../../servicios/autenticacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-medico-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medico-dashboard.component.html',
  styleUrls: ['./medico-dashboard.component.css']
})
export class MedicoDashboardComponent implements OnInit {
  listaCitas: any[] = [];
  filtroMedico: string = '';
  filtroEstado: string = 'TODOS';
  isDarkMode = false;
  fontSizeLarge = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AutenticacionService, private http: HttpClient, private router: Router, private ngZone: NgZone) {}

  ngOnInit() { this.cargarCitasMedico(); }

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
    return this.listaCitas.filter(c => {
      const matchTexto = `${c.id} ${c.fechaHora || c.fecha} ${c.estado} ${c.pacienteNombre || ''}`.toLowerCase().includes(this.filtroMedico.toLowerCase());
      const matchEstado = this.filtroEstado === 'TODOS' || (c.estado || '').toUpperCase() === this.filtroEstado;
      return matchTexto && matchEstado;
    });
  }

  obtenerTokenSeguro(): string {
    const s = this.authService as any;
    return s.getToken ? s.getToken() : (localStorage.getItem('token') || '');
  }

  cargarCitasMedico() {
    const token = this.obtenerTokenSeguro();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>('http://localhost:8080/api/citas', { headers }).subscribe({
      next: (data) => { this.ngZone.run(() => { this.listaCitas = data || []; }); },
      error: () => { this.ngZone.run(() => { this.errorMessage = 'No se pudieron cargar las citas asignadas.'; }); }
    });
  }

  atenderCita(idCita: number) {
    const token = this.obtenerTokenSeguro();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.put(`http://localhost:8080/api/citas/${idCita}/estado`, { estado: 'COMPLETADA' }, { headers }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMessage = `Cita #${idCita} completada con éxito.`;
          this.cargarCitasMedico();
        });
      },
      error: () => { this.ngZone.run(() => { this.errorMessage = 'No se pudo actualizar la cita.'; }); }
    });
  }

  cerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}