import type { Dificultad } from '../core/guardado';
import { OPERATIVOS } from '../data/operativos';
import type { Caso, Categoria, IdCiudad, Operativo, Pista, Rasgo, Testigo } from '../data/tipos';

// Lógica pura de un caso (sin 3D ni pantallas), para poder probarla a fondo.

export type Seleccion = Partial<Record<Categoria, string>>;
export type ResultadoCrimeNet = 'identificado' | 'equivocado' | 'varios' | 'ninguno';

export const RANGOS = ['Novata', 'Exploradora', 'Investigadora', 'Agente especial', 'Detective estrella'];
const CASOS_POR_RANGO = [0, 1, 2, 4, 6];

export function rango(casosResueltos: number): string {
  let i = 0;
  while (i + 1 < CASOS_POR_RANGO.length && casosResueltos >= CASOS_POR_RANGO[i + 1]) i++;
  return RANGOS[i];
}

function barajar<T>(lista: T[], azar: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export class EstadoCaso {
  /** Índice de la parada actual; igual a `paradas.length` cuando se llega al final. */
  indiceParada = 0;
  errores = 0;
  identificado = false;
  /** Pistas escuchadas, en orden, para la libreta. */
  readonly pistas: Pista[] = [];
  readonly ciudadesVisitadas: IdCiudad[];
  private escuchados = new Set<number>();

  constructor(
    readonly caso: Caso,
    readonly nivel: Dificultad,
    private readonly azar: () => number = Math.random,
  ) {
    this.ciudadesVisitadas = [caso.paradas[0].ciudad];
  }

  get enFinal(): boolean {
    return this.indiceParada >= this.caso.paradas.length;
  }

  get ciudadActual(): IdCiudad {
    return this.enFinal ? this.caso.final : this.caso.paradas[this.indiceParada].ciudad;
  }

  /** Testigos de la ciudad actual que corresponden al nivel. */
  testigosActuales(): Testigo[] {
    if (this.enFinal) return [];
    return this.caso.paradas[this.indiceParada].testigos.filter(
      (t) => !t.nivel || t.nivel === this.nivel,
    );
  }

  /** Registra que se habló con el testigo `indice` y devuelve su pista. */
  hablarCon(indice: number): Pista {
    const pista = this.testigosActuales()[indice].pista;
    if (!this.escuchados.has(indice)) {
      this.escuchados.add(indice);
      this.pistas.push(pista);
    }
    return pista;
  }

  yaHablo(indice: number): boolean {
    return this.escuchados.has(indice);
  }

  /** true cuando se escucharon todos los testigos de la ciudad actual. */
  get pistasCompletas(): boolean {
    return this.testigosActuales().every((_, i) => this.escuchados.has(i));
  }

  destinoCorrecto(): IdCiudad {
    const siguiente = this.caso.paradas[this.indiceParada + 1];
    return siguiente ? siguiente.ciudad : this.caso.final;
  }

  /** 2 opciones en Aprendiz y 3 en Detective, en orden aleatorio. */
  opcionesDestino(): IdCiudad[] {
    const cantidad = this.nivel === 'aprendiz' ? 1 : 2;
    const senuelos = this.caso.paradas[this.indiceParada].senuelos.slice(0, cantidad);
    return barajar([this.destinoCorrecto(), ...senuelos], this.azar);
  }

  /** true si la ruta necesita pasar por la Crime Net antes de viajar. */
  get debeIdentificarAntesDeViajar(): boolean {
    return this.destinoCorrecto() === this.caso.final && !this.identificado;
  }

  /** Viaja si el destino es correcto; si no, suma un error y se queda. */
  elegirDestino(destino: IdCiudad): boolean {
    if (destino !== this.destinoCorrecto()) {
      this.errores++;
      return false;
    }
    this.indiceParada++;
    this.escuchados.clear();
    this.ciudadesVisitadas.push(destino);
    return true;
  }

  rasgosConocidos(): Rasgo[] {
    return this.pistas.flatMap((p) => (p.rasgo ? [p.rasgo] : []));
  }

  sospechosos(seleccion: Seleccion): Operativo[] {
    return Object.values(OPERATIVOS).filter((op) =>
      (Object.entries(seleccion) as [Categoria, string][]).every(
        ([categoria, valor]) => op.rasgos[categoria] === valor,
      ),
    );
  }

  identificar(seleccion: Seleccion): ResultadoCrimeNet {
    const quedan = this.sospechosos(seleccion);
    if (quedan.length === 0) return 'ninguno';
    if (quedan.length > 1) return 'varios';
    if (quedan[0].id !== this.caso.ladron) return 'equivocado';
    this.identificado = true;
    return 'identificado';
  }

  /** 3 estrellas sin errores; se pierde una por cada destino equivocado (mínimo 1). */
  estrellas(): number {
    return 3 - Math.min(2, this.errores);
  }
}
