import { Routes } from '@angular/router';
import { LoginComponent } from './paginas/publicas/login/login.component';
import { authGuard } from './auth/auth.guard';
import { rolGuard } from './auth/rol.guard';

export const routes: Routes = [
  // Ruta pública de inicio de sesión
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Panel de Administrador (Con gestión global y aprobación de cuentas)
  { 
    path: 'admin/dashboard', 
    loadComponent: () => import('./paginas/privadas/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, rolGuard],
    data: { rol: 'ROLE_ADMIN' }
  },

  // Panel de Médico Con su agenda de citas asignadas
  { 
    path: 'medico/dashboard', 
    loadComponent: () => import('./paginas/privadas/medico/medico-dashboard.component').then(m => m.MedicoDashboardComponent),
    canActivate: [authGuard, rolGuard],
    data: { rol: 'ROLE_MEDICO' }
  },

  // Panel de Recepción Con el formulario funcional para agendar citas
  { 
    path: 'recepcion/dashboard', 
    loadComponent: () => import('./paginas/privadas/recepcion/recepcion-dashboard.component').then(m => m.RecepcionDashboardComponent),
    canActivate: [authGuard, rolGuard],
    data: { rol: 'ROLE_RECEPCION' }
  },

  // Panel de Paciente (Con la tabla de sus citas programadas)
  { 
    path: 'paciente/dashboard', 
    loadComponent: () => import('./paginas/privadas/paciente/paciente-dashboard.component').then(m => m.PacienteDashboardComponent),
    canActivate: [authGuard, rolGuard],
    data: { rol: 'ROLE_PACIENTE' }
  },

  // Redirección por defecto si la ruta no existe
  { path: '**', redirectTo: 'login' }
];