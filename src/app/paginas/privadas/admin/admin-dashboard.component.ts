import { Component, OnInit, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AutenticacionService } from '../../../servicios/autenticacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  vistaActual: 'pendientes' | 'todos' = 'pendientes';
  todosLosUsuarios: any[] = [];
  
  filtroTexto: string = '';
  filtroTextoPendientes: string = '';
  isDarkMode: boolean = false;
  fontSizePercent: number = 100;
  
  idiomaActual: 'es' | 'en' = 'es';

  reconocimientoVoz: any = null;
  escuchandoVoz: boolean = false;
  mensajeVoz: string = 'Haz clic en el micrófono y habla';

  errorMessage = '';
  successMessage = '';

  t: any = {
    es: {
      shortcuts: '⌨️ Atajos: Alt+1 Pendientes | Alt+2 Global | Alt+D Tema',
      voiceBtn: '🎙️ Control por Voz',
      listening: '🔴 Escuchando...',
      title: 'Panel de Administración - Control Total',
      subtitle: 'Supervisión de cuentas, roles y estadísticas del sistema médico',
      logout: 'Cerrar Sesión',
      medicos: 'Médicos Activos',
      pacientes: 'Pacientes',
      recepcion: 'Recepción',
      admins: 'Administradores',
      tabPendientes: 'Cuentas Pendientes',
      tabGlobal: 'Gestión Global de Usuarios',
      searchPendientes: '🔍 Buscar cuentas pendientes por nombre o correo...',
      searchGlobal: '🔍 Buscar en gestión global por nombre o correo...',
      thId: 'ID',
      thNombre: 'Nombre',
      thNombreCompleto: 'Nombre Completo',
      thEmail: 'Correo electrónico',
      thRol: 'Rol',
      thEstado: 'Estado',
      thAcciones: 'Acciones',
      thAccionEstado: 'Acción Estado',
      thModificarRol: 'Modificar Rol',
      aprobar: 'Aprobar',
      rechazar: 'Rechazar',
      suspender: 'Suspender',
      guardar: 'Guardar',
      noPendientes: 'No hay cuentas pendientes que coincidan con la búsqueda.',
      noUsuarios: 'No se encontraron usuarios registrados.'
    },
    en: {
      shortcuts: '⌨️ Shortcuts: Alt+1 Pending | Alt+2 Global | Alt+D Theme',
      voiceBtn: '🎙️ Voice Control',
      listening: '🔴 Listening...',
      title: 'Admin Dashboard - Total Control',
      subtitle: 'Supervision of accounts, roles, and medical system statistics',
      logout: 'Log Out',
      medicos: 'Active Doctors',
      pacientes: 'Patients',
      recepcion: 'Reception',
      admins: 'Administrators',
      tabPendientes: 'Pending Accounts',
      tabGlobal: 'Global User Management',
      searchPendientes: '🔍 Search pending accounts by name or email...',
      searchGlobal: '🔍 Search in global management by name or email...',
      thId: 'ID',
      thNombre: 'Name',
      thNombreCompleto: 'Full Name',
      thEmail: 'Email',
      thRol: 'Role',
      thEstado: 'Status',
      thAcciones: 'Actions',
      thAccionEstado: 'Status Action',
      thModificarRol: 'Modify Role',
      aprobar: 'Approve',
      rechazar: 'Reject',
      suspender: 'Suspend',
      guardar: 'Save',
      noPendientes: 'No pending accounts match the search.',
      noUsuarios: 'No registered users found.'
    }
  };

  constructor(
    private authService: AutenticacionService, 
    private http: HttpClient, 
    private router: Router, 
    private ngZone: NgZone
  ) {}

  ngOnInit() { 
    this.cargarDatos(); 
    this.inicializarControlVoz();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.altKey && event.key === '1') {
      event.preventDefault();
      this.cambiarVista('pendientes');
    } else if (event.altKey && event.key === '2') {
      event.preventDefault();
      this.cambiarVista('todos');
    } else if (event.altKey && event.key === 'd') {
      event.preventDefault();
      this.toggleTheme();
    }
  }

  toggleIdioma() {
    this.idiomaActual = this.idiomaActual === 'es' ? 'en' : 'es';
  }

  tr(key: string): string {
    return this.t[this.idiomaActual][key] || key;
  }

  inicializarControlVoz() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.reconocimientoVoz = new SpeechRecognition();
      this.reconocimientoVoz.lang = this.idiomaActual === 'es' ? 'es-ES' : 'en-US';
      this.reconocimientoVoz.continuous = false;
      this.reconocimientoVoz.interimResults = false;

      this.reconocimientoVoz.onresult = (event: any) => {
        const textoTranscrito = event.results[0][0].transcript.toLowerCase().trim();
        this.ngZone.run(() => {
          this.mensajeVoz = `Escuché: "${textoTranscrito}"`;
          this.procesarComandoVoz(textoTranscrito);
        });
      };

      this.reconocimientoVoz.onerror = () => {
        this.ngZone.run(() => { this.escuchandoVoz = false; });
      };

      this.reconocimientoVoz.onend = () => {
        this.ngZone.run(() => { this.escuchandoVoz = false; });
      };
    }
  }

  toggleEscuchaVoz() {
    if (!this.reconocimientoVoz) return;
    if (this.escuchandoVoz) {
      this.reconocimientoVoz.stop();
      this.escuchandoVoz = false;
    } else {
      try {
        this.reconocimientoVoz.start();
        this.escuchandoVoz = true;
        this.mensajeVoz = '🎤 Escuchando...';
      } catch (e) {
        console.error(e);
      }
    }
  }

  private procesarComandoVoz(comando: string) {
    if (comando.includes('pendientes') || comando.includes('pending')) {
      this.cambiarVista('pendientes');
    } else if (comando.includes('global') || comando.includes('usuarios') || comando.includes('users')) {
      this.cambiarVista('todos');
    } else if (comando.includes('oscuro') || comando.includes('dark') || comando.includes('tema')) {
      this.toggleTheme();
    }
  }

  cambiarVista(vista: 'pendientes' | 'todos') {
    this.ngZone.run(() => {
      this.vistaActual = vista;
      this.errorMessage = '';
      this.successMessage = '';
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme', this.isDarkMode);
  }

  cambiarTamanioRango(valor: number) {
    this.fontSizePercent = Number(valor);
    const root = document.documentElement;
    root.style.setProperty('--font-size-base', `${this.fontSizePercent / 100}rem`);
  }

  aumentarFuente() {
    if (this.fontSizePercent < 140) {
      this.fontSizePercent += 10;
      this.cambiarTamanioRango(this.fontSizePercent);
    }
  }

  disminuirFuente() {
    if (this.fontSizePercent > 80) {
      this.fontSizePercent -= 10;
      this.cambiarTamanioRango(this.fontSizePercent);
    }
  }

  // BOTÓN DE RESTABLECER TAMAÑO DE LETRA
  resetFuente() {
    this.fontSizePercent = 100;
    this.cambiarTamanioRango(100);
  }

  private obtenerRolUsuario(u: any): string {
    const val = u.rol || u.role || u.papel || u.tipo || u.authority || '';
    return String(val).toUpperCase();
  }

  // GETTERS EXACTOS QUE SÍ FUNCIONAN PARA LOS CONTADORES
  get totalMedicos(): number {
    return this.todosLosUsuarios.filter(u => {
      const r = this.obtenerRolUsuario(u);
      return r.includes('MEDICO') || r.includes('DOCTOR');
    }).length;
  }

  get totalPacientes(): number {
    return this.todosLosUsuarios.filter(u => {
      const r = this.obtenerRolUsuario(u);
      return r.includes('PACIENTE');
    }).length;
  }

  get totalRecepcion(): number {
    return this.todosLosUsuarios.filter(u => {
      const r = this.obtenerRolUsuario(u);
      return r.includes('RECEPCION');
    }).length;
  }

  get totalAdmins(): number {
    return this.todosLosUsuarios.filter(u => {
      const r = this.obtenerRolUsuario(u);
      return r.includes('ADMIN');
    }).length;
  }

  get usuariosPendientesFiltrados() {
    return this.todosLosUsuarios.filter(u => {
      const estadoStr = String(u.estado || u.status || '').toUpperCase();
      const esPendiente = estadoStr === 'PENDIENTE' || estadoStr === 'PENDING';
      const texto = `${u.nombre || ''} ${u.apellido || ''} ${u.email || ''}`.toLowerCase();
      return esPendiente && texto.includes(this.filtroTextoPendientes.toLowerCase());
    });
  }

  get todosLosUsuariosFiltrados() {
    return this.todosLosUsuarios.filter(u => {
      const texto = `${u.id || ''} ${u.nombre || ''} ${u.apellido || ''} ${u.email || ''} ${this.obtenerRolUsuario(u)}`.toLowerCase();
      return texto.includes(this.filtroTexto.toLowerCase());
    });
  }

  obtenerTokenSeguro(): string {
    const s = this.authService as any;
    if (typeof s.getToken === 'function') return s.getToken();
    if (typeof s.obtenerToken === 'function') return s.obtenerToken();
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  }

  cargarDatos() {
    const token = this.obtenerTokenSeguro();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<any>('http://localhost:8080/api/admin/usuarios', { headers }).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          let lista: any[] = [];
          if (Array.isArray(data)) lista = data;
          else if (data && Array.isArray(data.content)) lista = data.content;
          else if (data && Array.isArray(data.usuarios)) lista = data.usuarios;
          else if (data && Array.isArray(data.data)) lista = data.data;

          this.todosLosUsuarios = lista.map(u => ({
            ...u,
            rol: u.rol || u.role || u.papel || 'ROLE_PACIENTE',
            nuevoRolSeleccionado: u.rol || u.role || u.papel || 'ROLE_PACIENTE',
            estado: u.estado || u.status || 'APROBADA'
          }));
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.errorMessage = 'No se pudieron cargar los usuarios del servidor.';
        });
      }
    });
  }

  aprobarUsuario(id: number) { this.cambiarEstado(id, 'APROBADA'); }
  rechazarUsuario(id: number) { this.cambiarEstado(id, 'RECHAZADA'); }

  private cambiarEstado(id: number, nuevoEstado: string) {
    const token = this.obtenerTokenSeguro();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.put(`http://localhost:8080/api/admin/usuarios/${id}/estado`, { estado: nuevoEstado, nuevoEstado }, { headers }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMessage = `Usuario ID #${id} actualizado a ${nuevoEstado}.`;
          this.cargarDatos();
        });
      },
      error: () => {
        this.http.put(`http://localhost:8080/api/admin/usuarios/${id}/estado?estado=${nuevoEstado}`, {}, { headers }).subscribe({
          next: () => { this.ngZone.run(() => { this.cargarDatos(); }); }
        });
      }
    });
  }

  actualizarRol(id: number, nuevoRol: string) {
    const token = this.obtenerTokenSeguro();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.put(`http://localhost:8080/api/admin/usuarios/${id}/rol`, { rol: nuevoRol, nuevoRol }, { headers }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMessage = `Rol actualizado a ${nuevoRol}.`;
          this.cargarDatos();
        });
      }
    });
  }

  cerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}