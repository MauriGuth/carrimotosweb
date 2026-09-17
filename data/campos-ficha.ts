/**
 * Los campos de la ficha técnica, en el orden en que se muestran.
 *
 * Para agregar un campo nuevo: sumalo acá y agregá una columna con el mismo
 * `columna` en la hoja FICHA de la planilla. El resto —el tipo, el importador
 * y la tabla de la web— sale de esta lista.
 *
 * La garantía no va: aunque la planilla traiga una columna GARANTIA, no está
 * en esta lista, así que el importador la ignora y no aparece en ninguna ficha.
 */
export const CAMPOS_FICHA = [
  { clave: 'motor', etiqueta: 'Motor', columna: 'MOTOR' },
  { clave: 'refrigeracion', etiqueta: 'Refrigeración', columna: 'REFRIGERACION' },
  { clave: 'alimentacion', etiqueta: 'Alimentación', columna: 'ALIMENTACION' },
  { clave: 'cilindrada', etiqueta: 'Cilindrada', columna: 'CILINDRADA' },
  { clave: 'potencia', etiqueta: 'Potencia máxima', columna: 'POTENCIA' },
  { clave: 'velocidadMaxima', etiqueta: 'Velocidad máxima', columna: 'VELOCIDAD MAXIMA' },
  { clave: 'transmision', etiqueta: 'Transmisión', columna: 'TRANSMISION' },
  { clave: 'arranque', etiqueta: 'Arranque', columna: 'ARRANQUE' },
  { clave: 'frenoDelantero', etiqueta: 'Freno delantero', columna: 'FRENO DELANTERO' },
  { clave: 'frenoTrasero', etiqueta: 'Freno trasero', columna: 'FRENO TRASERO' },
  { clave: 'rodadoDelantero', etiqueta: 'Rodado delantero', columna: 'RODADO DELANTERO' },
  { clave: 'rodadoTrasero', etiqueta: 'Rodado trasero', columna: 'RODADO TRASERO' },
  { clave: 'tanque', etiqueta: 'Tanque', columna: 'TANQUE' },
  { clave: 'peso', etiqueta: 'Peso', columna: 'PESO' },
  { clave: 'largo', etiqueta: 'Largo', columna: 'LARGO' },
  { clave: 'ancho', etiqueta: 'Ancho', columna: 'ANCHO' },
  { clave: 'alto', etiqueta: 'Alto', columna: 'ALTO' },
  { clave: 'alturaAsiento', etiqueta: 'Altura del asiento', columna: 'ALTURA ASIENTO' },
  { clave: 'alarma', etiqueta: 'Alarma', columna: 'ALARMA' },
  { clave: 'equipamiento', etiqueta: 'Equipamiento', columna: 'EQUIPAMIENTO' },
] as const;

export type ClaveFicha = (typeof CAMPOS_FICHA)[number]['clave'];

/** Todos los campos son opcionales: se muestran sólo los que estén cargados. */
export type FichaTecnica = Partial<Record<ClaveFicha, string>>;
