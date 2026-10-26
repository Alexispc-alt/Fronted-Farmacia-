import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  // Método de login conectado con Spring Boot
  login(credenciales: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(respuesta => {
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('rol', respuesta.rol);
        localStorage.setItem('email', respuesta.email);
      })
    );
  }

  // Cerrar sesión borrando el almacenamiento local
  cerrarSesion(): void {
    localStorage.clear();
  }

  // Verificar si existe un token activo
  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }

  // Obtener el rol actual guardado (ej: ROLE_ADMIN, ROLE_MEDICO)
  obtenerRol(): string {
    return localStorage.getItem('rol') || '';
  }
}