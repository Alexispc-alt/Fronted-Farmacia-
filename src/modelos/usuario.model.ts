export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  rol: 'ROLE_ADMIN' | 'ROLE_MEDICO' | 'ROLE_RECEPCION' | 'ROLE_PACIENTE';
  token?: string;
}