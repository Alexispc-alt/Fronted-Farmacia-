import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AutenticacionService } from '../servicios/autenticacion.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true; // Permite el paso si hay sesión iniciada
  }

  // Si no está autenticado, lo redirige al login
  router.navigate(['/login']);
  return false;
};