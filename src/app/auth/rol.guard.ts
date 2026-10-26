import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AutenticacionService } from '../servicios/autenticacion.service';

export const rolGuard: CanActivateFn = (route, state) => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);

  // Obtenemos el rol requerido que definiremos en las rutas (ej: 'ROLE_ADMIN')
  const rolEsperado = route.data['rol'] as string;
  const rolUsuario = authService.obtenerRol();

  if (authService.estaAutenticado() && rolUsuario === rolEsperado) {
    return true; // Acceso concedido si el rol coincide
  }

  // Si no tiene los permisos necesarios, lo redirige al login
  router.navigate(['/login']);
  return false;
};