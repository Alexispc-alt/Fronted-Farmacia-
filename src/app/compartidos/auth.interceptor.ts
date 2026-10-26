import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtenemos el token almacenado en el navegador tras el login
  const token = localStorage.getItem('token');

  // Si el token existe, clonamos la petición y le añadimos la cabecera de autorización
  if (token) {
    const peticionClonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(peticionClonada);
  }

  // Si no hay token, la petición se envía tal cual
  return next(req);
};