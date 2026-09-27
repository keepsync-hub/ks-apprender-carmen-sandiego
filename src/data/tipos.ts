// Tipos del contenido del juego. Los casos se describen como datos: agregar una
// misión nueva no requiere tocar el motor.

import type { Dificultad } from '../core/guardado';

export type IdCiudad =
  | 'san-francisco'
  | 'ciudad-de-mexico'
  | 'buenos-aires'
  | 'lima'
  | 'tokio'
  | 'santiago'
  | 'rio-de-janeiro'
  | 'quito';

export type IdOperativo = 'le-chevre' | 'el-topo' | 'tigress' | 'paperstar' | 'neal';

/** Rasgos que se cruzan en la Crime Net. */
export type Categoria = 'pasatiempo' | 'ropa';

export interface Rasgo {
  categoria: Categoria;
  valor: string;
}

export interface Operativo {
  id: IdOperativo;
  nombre: string;
  rasgos: Record<Categoria, string>;
  /** Color de la ropa del modelo 3D (coincide con el rasgo «ropa»). */
  color: number;
  /** Cómo escapa en la persecución final. */
  huida: 'saltar' | 'excavar';
  accesorio: 'cuernos' | 'casco' | 'ninguno';
}

export interface TemaCiudad {
  cielo: number;
  edificios: number[];
  hito: 'puente' | 'piramide' | 'obelisco' | 'cristo' | 'mitad-del-mundo' | 'ninguno';
}

export interface Ciudad {
  id: IdCiudad;
  nombre: string;
  pais: string;
  /** Posición aproximada para el mapamundi (grados). */
  lat: number;
  lon: number;
  /** Ícono grande que representa al país en las tarjetas del mapa. */
  icono: string;
  datoCurioso: string;
  tema: TemaCiudad;
}

export interface Pista {
  /** Texto para Detective (8–9 años). */
  texto: string;
  /** Texto corto para Aprendiz (6–7 años). */
  aprendiz: string;
  /** Emoji, `bandera:<id de ciudad>` o `color:#rrggbb` (muestra de color). */
  imagen: string;
  /** Si la pista revela un rasgo del ladrón, cuál es. */
  rasgo?: Rasgo;
}

export interface Testigo {
  nombre: string;
  /** Una computadora de V.I.L.E. se hackea con el labial en vez de conversar. */
  tipo?: 'persona' | 'computadora';
  pista: Pista;
  /** Si se indica, el testigo solo aparece en ese nivel. */
  nivel?: Dificultad;
  /** Color de la ropa del testigo en 3D. */
  color: number;
}

export interface Parada {
  ciudad: IdCiudad;
  testigos: Testigo[];
  /** Destinos falsos que se ofrecen en el mapa junto al correcto. */
  senuelos: IdCiudad[];
}

export interface Caso {
  id: string;
  titulo: string;
  tesoro: string;
  iconoTesoro: string;
  /** Lo que dice el ladrón al ser atrapado. */
  fraseLadron: { texto: string; aprendiz: string };
  ladron: IdOperativo;
  /** Ciudades con pistas, en orden. La última de la lista es donde se atrapa al ladrón. */
  paradas: Parada[];
  final: IdCiudad;
}
