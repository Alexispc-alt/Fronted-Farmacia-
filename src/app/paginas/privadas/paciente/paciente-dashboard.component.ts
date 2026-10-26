import { Component, OnInit, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AutenticacionService } from '../../../servicios/autenticacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-paciente-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paciente-dashboard.component.html',
  styleUrls: ['./paciente-dashboard.component.css']
})
export class PacienteDashboardComponent implements OnInit {
  listaCitasPaciente: any[] = [];
  filtroBusqueda: string = '';
  isDarkMode = false;
  fontSizeLarge = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AutenticacionService, private http: HttpClient, private router: Router, private ngZone: NgZone) {}

  ngOnInit() { this.cargarCitasPaciente(); }

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
    return this.listaCitasPaciente.filter(c => `${c.id} ${c.fechaHora || c.fecha} ${c.estado} ${c.medicoNombre || ''}`.toLowerCase().includes(this.filtroBusqueda.toLowerCase()));
  }

  obtenerTokenSeguro(): string {
    const s = this.authService as any;
    return s.getToken ? s.getToken() : (localStorage.getItem('token') || '');
  }

  cargarCitasPaciente() {
    const token = this.obtenerTokenSeguro();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>('http://localhost:8080/api/citas', { headers }).subscribe({
      next: (data) => { this.ngZone.run(() => { this.listaCitasPaciente = data || []; }); },
      error: () => { this.ngZone.run(() => { this.errorMessage = 'No se pudieron cargar sus citas médicas.'; }); }
    });
  }

  cerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}