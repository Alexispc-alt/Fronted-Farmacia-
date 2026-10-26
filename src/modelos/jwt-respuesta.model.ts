export interface JwtRespuesta {
  token: string;
  tipo: string;
  email: string;
  rol: 'ROLE_ADMIN' | 'ROLE_MEDICO' | 'ROLE_RECEPCION' | 'ROLE_PACIENTE';
}