# Cómo añadir más contenido a B2 English Prep Suite

Esta guía explica cómo un administrador puede ampliar el banco de preguntas y la teoría diaria
**sin tocar código ni hacer un despliegue**, usando la sincronización con Google Sheets. También
explica qué tipo de contenido (los podcasts) queda fuera de este mecanismo y cómo añadirlo.

## Requisitos previos

- Tener una cuenta con rol de **administrador** (`admin@b2mastery.es` o la cuenta que se haya
  promovido a admin desde el panel de Usuarios).
- Las reglas de seguridad de Firestore (`firestore.rules`) deben estar publicadas en el proyecto de
  Firebase — si no, la sincronización fallará con un error de permisos al intentar guardar.

## El modelo de contenido, en una frase

El contenido (teoría, preguntas de práctica y exámenes de control) vive en Firestore, en la
colección `content` (un documento por módulo). La pestaña **"Sincronizar Sheets"** de la app lee
una hoja de Google Sheets publicada como CSV, la interpreta, y **añade** lo nuevo a esos documentos
— visible al instante para todos los alumnos, no solo para quien sincroniza.

## Paso a paso

1. Entra en la app como administrador y ve a la pestaña **"Sincronizar Sheets"** (menú lateral).
2. Pulsa **"Descargar Datos Actuales (Excel)"**. Esto genera un libro con dos solapas:
   - **"Instrucciones de Uso"**: la referencia de columnas (la misma que se resume más abajo).
   - **"Preguntas"**: todo el contenido actual de la app (teoría, prácticas y exámenes) ya
     formateado — es el punto de partida más cómodo para editar o añadir filas nuevas, en vez de
     empezar una hoja desde cero.
3. Sube ese Excel a Google Drive como Google Sheets (o copia la solapa "Preguntas" a una hoja nueva).
4. Añade tus filas nuevas al final (ver la referencia de columnas y los tres tipos de fila más abajo).
5. Publica la hoja: **Archivo > Compartir > Publicar en la Web**, eligiendo la hoja correcta y el
   formato **"Valores separados por comas (.csv)"**.
6. Copia el enlace publicado (termina en `output=csv`) y pégalo en el campo de la app. Pulsa
   **"Sincronizar Ahora"**.
7. La app te confirma cuántas preguntas y cuántas líneas de teoría nuevas se añadieron. Ya son
   visibles para todos los alumnos en ese mismo instante.

Puedes volver a sincronizar la misma hoja tantas veces como quieras después de seguir editándola:
solo se añade lo que sea realmente nuevo (ver "Cómo evita duplicados" más abajo).

## Referencia de columnas

| Columna          | Obligatoria                     | Descripción                                                                 |
|------------------|----------------------------------|------------------------------------------------------------------------------|
| `Module`         | Sí                                | Número de módulo, **1 a 4**.                                                 |
| `Day`            | Depende del tipo (ver abajo)      | Día dentro del módulo, **1 a 5**. Vacío para preguntas de examen de control. |
| `Type`           | Sí                                | `practice`, `test` o `theory`.                                              |
| `Question`       | Sí para `practice`/`test`         | Enunciado en inglés. Usa `________` para el hueco.                          |
| `Option_A`..`Option_D` | Sí para `practice`/`test`   | Las cuatro opciones de respuesta.                                           |
| `Correct_Option` | Sí para `practice`/`test`         | Letra en minúscula: `a`, `b`, `c` o `d`.                                    |
| `Explanation.`   | Recomendada                       | Explicación en español (se muestra al alumno y se usa como contexto para el Tutor IA). |
| `Theory_Content` | Sí para `theory`                  | Ver sección de teoría abajo.                                                |

Cabeceras insensibles a mayúsculas/espacios/puntos finales (`Explanation.` se reconoce igual que
`explanation`). El delimitador puede ser coma, punto y coma o tabulador — se detecta solo.

## Añadir preguntas de práctica diaria

Fila con `Type=practice`, `Module` y `Day` obligatorios. Se añade al final de las preguntas de
práctica de ese día concreto.

```
Module,Day,Type,Question,Option_A,Option_B,Option_C,Option_D,Correct_Option,Explanation.
1,3,practice,I ___ basketball for ten years and I still play now.,played,have played,play,had played,b,Usa Present Perfect para acciones iniciadas en el pasado que continúan hoy.
```

## Añadir preguntas de examen de control

Fila con `Type=test`, `Module` obligatorio y **`Day` vacío**. Se añade al examen de control de ese
módulo (el que se hace al terminar los 5 días).

```
Module,Day,Type,Question,Option_A,Option_B,Option_C,Option_D,Correct_Option,Explanation.
2,,test,She ___ to Paris three times.,go,went,has been,had gone,c,Present Perfect de experiencia.
```

## Añadir o ampliar teoría (la "chuleta" del día)

Fila con `Type=theory`, `Module` y `Day` obligatorios, y el contenido en `Theory_Content` —
deja vacías `Question`/`Option_*`/`Correct_Option` en estas filas. Cada línea (separada por salto de
línea dentro de la celda, o por `|` si prefieres una sola línea) se añade como una regla nueva a la
chuleta de ese día.

```
Module,Day,Type,Theory_Content
1,2,theory,"Usa Present Perfect con since/for
Evita ""used to"" justo antes de un gerundio"
```

O en una sola línea con `|`:

```
Module,Day,Type,Theory_Content
1,2,theory,Usa Present Perfect con since/for | Evita "used to" justo antes de un gerundio
```

Antes de esta funcionalidad, las filas `theory` de la hoja se ignoraban silenciosamente — si ya
tenías una hoja con ese tipo de filas de antes, simplemente vuelve a sincronizarla y ahora sí se
procesarán.

## Cómo evita duplicados

- **Preguntas**: se comparan por el texto de la pregunta (sin mayúsculas ni espacios sobrantes). Si
  ya existe una pregunta con el mismo texto en ese módulo/día, no se vuelve a añadir.
- **Teoría**: cada línea de `Theory_Content` se compara literalmente contra las reglas que ya tiene
  ese día. Si la línea ya está, no se duplica.

Esto significa que puedes mantener la hoja de Sheets como tu "maestro" de contenido e ir
sincronizando cada vez que añadas filas nuevas, sin miedo a duplicar lo que ya subiste antes.

## Restaurar el contenido por defecto

En la pestaña de Sincronizar Sheets, el botón de papelera (junto a "Sincronizar Ahora", solo
visible si ya se sincronizó algo) **sobrescribe** el contenido de Firestore con el banco estático
original (`src/data/b2Data.ts`), para todos los alumnos. Úsalo si una sincronización salió mal y
quieres empezar de cero.

## Lo que esto NO cubre: los podcasts

Los episodios de podcast (audio + transcripción) **no se sincronizan por Sheets**. Para añadir uno
nuevo:

1. Sube el archivo de audio manualmente a Firebase Storage (consola de Firebase → Storage).
2. Añade el episodio directamente en `src/data/b2Data.ts`, dentro de `podcastEpisodes` del módulo
   correspondiente, con su `audioStoragePath` apuntando al nombre exacto del archivo subido.
3. Si el módulo ya está sembrado en Firestore, hay que volver a sembrarlo (botón de papelera de
   "Restaurar Banco de Preguntas Predeterminado", o repetir el primer login de admin sobre un
   proyecto limpio) para que el nuevo episodio llegue a Firestore — o extender manualmente el
   documento `content/module_{n}` en la consola de Firebase.
4. Requiere desplegar código (no es un cambio en caliente como la sincronización de Sheets).

## Referencia técnica rápida

- Colección Firestore: `content`, un documento por módulo (`module_0` a `module_3`, 0-indexado).
- Reglas de seguridad: `firestore.rules` — lectura para cualquier usuario autenticado, escritura
  solo para el admin (`admin@b2mastery.es`).
- Lógica de fusión: `src/lib/content.ts` (`mergeSyncedContentIntoFirestore`).
- Parseo de la hoja de cálculo: `server.ts`, endpoint `POST /api/sheets/sync`.
- Ver [`CLAUDE.md`](../CLAUDE.md) para el resto de la arquitectura.
