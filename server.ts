import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import * as XLSX from 'xlsx';
import { DEFAULT_B2_DATA } from './src/data/b2Data';

const app = express();
const PORT = 3000;

app.use(express.json());

// ----------------------------------------------------
// 1. AI Tutor Explanation (Gemini API)
// ----------------------------------------------------
app.post('/api/tutor/explain', async (req, res) => {
  const { question, options, selectedOption, correctOption, contextInfo } = req.body;

  if (!question || !options || !correctOption) {
    return res.status(400).json({ error: 'Faltan parámetros de la pregunta' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'La clave de la API de Gemini (GEMINI_API_KEY) no está configurada.' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const isCorrect = selectedOption === correctOption;

    const prompt = `
Actúa como un tutor de inglés experto y preparador del examen oficial Cambridge B2 First.
Explica detalladamente la siguiente pregunta tipo test de Use of English / Gramática.

Pregunta: "${question}"
Opciones disponibles:
- a) ${options.a}
- b) ${options.b}
- c) ${options.c}
- d) ${options.d}

La respuesta correcta es la opción: "${correctOption}" (${options[correctOption]})
El alumno seleccionó la opción: "${selectedOption || 'Ninguna'}" (${selectedOption ? options[selectedOption] : 'Ninguna'})
Estado de la respuesta: ${isCorrect ? '¡CORRECTO!' : 'INCORRECTO (Ha caído en la trampa)'}

Información de contexto teórica: ${contextInfo || 'No hay contexto adicional.'}

Por favor, estructura tu respuesta en español de forma elegante y amigable en formato Markdown, siguiendo esta estructura exacta:
1. **Análisis de la Pregunta**: Desglosa la frase, identifica palabras clave de descarte o marcadores temporales (como "yesterday", "since", "yet", etc.).
2. **Por qué la opción ${correctOption.toUpperCase()} es la correcta**: Explica matemáticamente y gramaticalmente la regla que obliga a usar esta opción.
3. **Por qué las otras opciones son incorrectas (Trampas y Distractores)**: Explica por qué el alumno puede haberse equivocado con ellas (especialmente la seleccionada si era incorrecta).
4. **Consejo Pro para el Examen**: Da un truco de 1 frase para memorizar esta regla para el día del examen.

Evita tecnicismos excesivos, habla de forma motivadora y clara. ¡Hazlo muy instructivo!
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Error al contactar con el Tutor de IA: ' + error.message });
  }
});

// ----------------------------------------------------
// 2. Export Current Data as Excel (Multiple Sheets)
// ----------------------------------------------------
app.get('/api/export-excel', (req, res) => {
  try {
    // 1. Instructions Sheet Data
    const instructionsData = [
      ['GUÍA DE ESTRUCTURA Y FORMATO PARA EL BANCO DE PREGUNTAS (GOOGLE SHEETS / EXCEL)'],
      [],
      ['Esta hoja de cálculo contiene dos solapas:'],
      ['  1. "Instrucciones de Uso" (esta solapa): Explicación del formato, columnas y reglas de validación.'],
      ['  2. "Preguntas": El banco completo de preguntas actual de la aplicación, listo para ser copiado y usado.'],
      [],
      ['DESCRIPCIÓN DE LAS COLUMNAS EN LA SOLAPA "Preguntas"'],
      ['Nombre de Columna', '¿Es Obligatorio?', 'Tipo de Datos', 'Descripción', 'Ejemplos de Valores Válidos'],
      [
        'Module', 
        'SÍ', 
        'Número (1 - 5)', 
        'Número del módulo (ej. 1 para Módulo 1, 2 para Módulo 2, etc.)', 
        '1, 2, 3, 4, 5'
      ],
      [
        'Day', 
        'SÍ (para tipo "practice")', 
        'Número (1 - 5) o vacío', 
        'Día del módulo al que pertenece la pregunta práctica (1 al 5). Déjalo VACÍO si el Type es "test".', 
        '1, 2, 3, 4, 5, o vacío'
      ],
      [
        'Type', 
        'SÍ', 
        'Texto ("practice" o "test")', 
        'Tipo de pregunta. "practice" para preguntas diarias, "test" para exámenes de control del módulo.', 
        'practice, test'
      ],
      [
        'Question', 
        'SÍ', 
        'Texto largo', 
        'El enunciado de la pregunta en inglés. Usa guiones bajos (ej. ________) para denotar el hueco a rellenar.', 
        'I ________ working today'
      ],
      [
        'Option_A', 
        'SÍ', 
        'Texto corto', 
        'Opción de respuesta A. Debe coincidir con la respuesta correcta si Correct_Option es "a".', 
        'have been'
      ],
      [
        'Option_B', 
        'SÍ', 
        'Texto corto', 
        'Opción de respuesta B.', 
        'have being'
      ],
      [
        'Option_C', 
        'SÍ', 
        'Texto corto', 
        'Opción de respuesta C.', 
        'was'
      ],
      [
        'Option_D', 
        'SÍ', 
        'Texto corto', 
        'Opción de respuesta D.', 
        'am'
      ],
      [
        'Correct_Option', 
        'SÍ', 
        'Texto de una letra (a, b, c, d)', 
        'Letra que representa la opción correcta (en minúsculas obligatoriamente: a, b, c o d).', 
        'a'
      ],
      [
        'Explanation.', 
        'NO (Recomendado)', 
        'Texto largo', 
        'Explicación didáctica o gramatical en español que el estudiante verá tras responder o pedir ayuda al Tutor IA.', 
        'El tiempo verbal correcto es Present Perfect Continuous...'
      ],
      [],
      ['REGLAS MUY IMPORTANTES PARA EVITAR ERRORES DE SINCRONIZACIÓN:'],
      ['1. No modifiques ni renombres las cabeceras de la solapa "Preguntas". Deben ser exactamente de la fila 1.'],
      ['2. Las letras de la columna "Correct_Option" deben estar en minúsculas (a, b, c, d). Nunca en mayúsculas.'],
      ['3. El delimitador final cuando publiques la hoja de Google Sheets como CSV debe ser la coma (,).'],
      [],
      ['CÓMO PUBLICAR TU HOJA EN GOOGLE SHEETS PARA SINCRONIZARLA DE VUELTA:'],
      ['1. Crea una hoja de cálculo nueva en blanco en tu Google Drive.'],
      ['2. Selecciona y copia toda la tabla de la solapa "Preguntas" de este archivo Excel.'],
      ['3. Pégala en la primera celda (A1) de tu nueva hoja de Google Sheets.'],
      ['4. Haz clic en "Archivo" > "Compartir" > "Publicar en la Web".'],
      ['5. En la configuración de publicación, selecciona únicamente la hoja que contiene las preguntas (ej. "Hoja 1")'],
      ['   y cámbiala de "Página Web" a "Valores separados por comas (.csv)".'],
      ['6. Haz clic en "Publicar" y copia el enlace largo generado (empieza por docs.google.com/spreadsheets/d/e/... y termina con output=csv).'],
      ['7. Pega ese enlace en la herramienta de sincronización de la aplicación. ¡Listo!']
    ];

    // 2. Questions Sheet Data
    const questionsHeader = ['Module', 'Day', 'Type', 'Question', 'Option_A', 'Option_B', 'Option_C', 'Option_D', 'Correct_Option', 'Explanation.'];
    const questionsRows: any[][] = [questionsHeader];

    DEFAULT_B2_DATA.forEach((module) => {
      const moduleNum = module.index + 1;

      // 1. Practice questions from each day
      module.days.forEach((day, dayIdx) => {
        const dayNum = dayIdx + 1;
        day.practiceQuestions.forEach((q) => {
          questionsRows.push([
            moduleNum,
            dayNum,
            'practice',
            q.question || '',
            q.options.a || '',
            q.options.b || '',
            q.options.c || '',
            q.options.d || '',
            q.correctOption || '',
            q.explanation || ''
          ]);
        });
      });

      // 2. Control exams (test questions)
      if (module.controlExam && Array.isArray(module.controlExam)) {
        module.controlExam.forEach((q) => {
          questionsRows.push([
            moduleNum,
            '', // Empty day for exam questions
            'test',
            q.question || '',
            q.options.a || '',
            q.options.b || '',
            q.options.c || '',
            q.options.d || '',
            q.correctOption || '',
            q.explanation || ''
          ]);
        });
      }
    });

    // Create Excel Workbook
    const wb = XLSX.utils.book_new();
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    const wsQuestions = XLSX.utils.aoa_to_sheet(questionsRows);

    // Adjust columns width to make it pretty
    wsInstructions['!cols'] = [
      { wch: 25 },
      { wch: 18 },
      { wch: 18 },
      { wch: 50 },
      { wch: 35 }
    ];
    wsQuestions['!cols'] = [
      { wch: 8 },
      { wch: 6 },
      { wch: 10 },
      { wch: 45 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 55 }
    ];

    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instrucciones de Uso');
    XLSX.utils.book_append_sheet(wb, wsQuestions, 'Preguntas');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="plantilla_b2_english.xlsx"');
    return res.status(200).send(buffer);
  } catch (error: any) {
    console.error('Error generating Excel file:', error);
    return res.status(500).send('Error al generar el archivo Excel');
  }
});

// ----------------------------------------------------
// 3. Google Sheets Sync Proxy
// ----------------------------------------------------
app.post('/api/sheets/sync', async (req, res) => {
  const { sheetUrl } = req.body;
  if (!sheetUrl) {
    return res.status(400).json({ error: 'Falta la URL de Google Sheets' });
  }

  try {
    let cleanUrl = sheetUrl.trim();
    
    // Fix typical typos/errors with http/https prefix
    if (cleanUrl.startsWith('dohttps://')) {
      cleanUrl = cleanUrl.replace('dohttps://', 'https://');
    } else if (cleanUrl.startsWith('httpshttps://')) {
      cleanUrl = cleanUrl.replace('httpshttps://', 'https://');
    } else if (cleanUrl.startsWith('https:/') && !cleanUrl.startsWith('https://')) {
      cleanUrl = cleanUrl.replace('https:/', 'https://');
    } else if (cleanUrl.startsWith('http:/') && !cleanUrl.startsWith('http://')) {
      cleanUrl = cleanUrl.replace('http:/', 'http://');
    }
    
    // Ensure it starts with https:// if it has docs.google.com
    if (cleanUrl.includes('docs.google.com') && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    // SSRF guard: only ever fetch from docs.google.com. Everything below derives
    // csvUrl from validated pieces of parsedUrl instead of trusting cleanUrl directly,
    // since a substring check like cleanUrl.includes('docs.google.com/...') can be
    // satisfied by an attacker-controlled host (e.g. evil.com/docs.google.com/spreadsheets).
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(cleanUrl);
    } catch {
      return res.status(400).json({ error: 'La URL proporcionada no es válida.' });
    }

    if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== 'docs.google.com' || !parsedUrl.pathname.startsWith('/spreadsheets/')) {
      return res.status(400).json({ error: 'Solo se permiten enlaces de Google Sheets (https://docs.google.com/spreadsheets/...).' });
    }

    let csvUrl: string;
    if (parsedUrl.pathname.includes('/d/e/')) {
      // It's a published Google Sheet (e.g. https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv)
      // Keep it as is, but make sure it outputs CSV instead of HTML
      if (parsedUrl.pathname.endsWith('/pubhtml')) {
        parsedUrl.pathname = parsedUrl.pathname.replace('/pubhtml', '/pub');
        parsedUrl.searchParams.set('output', 'csv');
      } else if (parsedUrl.searchParams.get('output') !== 'csv') {
        parsedUrl.searchParams.set('output', 'csv');
      }
      csvUrl = parsedUrl.toString();
    } else {
      // It's a standard Google Sheet URL (e.g. /d/SPREADSHEET_ID/edit)
      const match = parsedUrl.pathname.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!match || !match[1] || match[1] === 'e') {
        return res.status(400).json({ error: 'No se pudo extraer el ID de la hoja de cálculo de la URL proporcionada.' });
      }
      const spreadsheetId = match[1];
      // gid may be in the query string or, for standard "edit" links, in the URL hash (#gid=123)
      const gidMatch = cleanUrl.match(/gid=([0-9]+)/);
      const gid = gidMatch ? gidMatch[1] : '0';
      csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
    }

    const response = await fetch(csvUrl);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Google Sheets respondió con código ${response.status} (No autorizado). Asegúrate de que la hoja de cálculo esté publicada en la web (Archivo > Compartir > Publicar en la web como CSV) y de que el enlace sea correcto.`);
      }
      throw new Error(`Google Sheets respondió con código ${response.status}`);
    }

    const csvText = await response.text();
    
    // Auto-detect delimiter by counting , ; and \t in the first line
    const firstLine = csvText.split(/\r?\n/)[0] || '';
    let delimiter = ',';
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;

    if (semicolonCount > commaCount && semicolonCount > tabCount) {
      delimiter = ';';
    } else if (tabCount > commaCount && tabCount > semicolonCount) {
      delimiter = '\t';
    }

    // Parse CSV with auto-detected delimiter
    const rows: string[][] = [];
    let currentField = '';
    let inQuotes = false;
    let currentRow: string[] = [];

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (inQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            currentField += '"';
            i++; // skip next quote
          } else {
            inQuotes = false;
          }
        } else {
          currentField += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === delimiter) {
          currentRow.push(currentField);
          currentField = '';
        } else if (char === '\r' || char === '\n') {
          if (char === '\r' && nextChar === '\n') {
            i++;
          }
          currentRow.push(currentField);
          rows.push(currentRow);
          currentRow = [];
          currentField = '';
        } else {
          currentField += char;
        }
      }
    }
    if (currentRow.length > 0 || currentField) {
      currentRow.push(currentField);
      rows.push(currentRow);
    }

    // Filter empty rows
    const validRows = rows.filter(r => r.length > 0 && r.some(cell => cell.trim() !== ''));

    if (validRows.length === 0) {
      return res.status(400).json({ 
        error: 'El archivo descargado está completamente vacío. Asegúrate de que el enlace de Google Sheets sea correcto y de que esté publicado como CSV.' 
      });
    }

    // Parse headers with normalization to match perfectly even with trailing dots, spaces, or cases
    const rawHeaders = validRows[0];
    const headers = rawHeaders.map(h => {
      // Trim, lowercase, and remove non-alphanumeric characters (except underscores)
      // This maps "Explanation." -> "explanation", "Option_A" -> "option_a"
      return h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    });

    if (validRows.length < 2) {
      return res.status(400).json({ 
        error: `¡Conexión establecida con éxito! Hemos detectado la fila de cabeceras correctamente: [${rawHeaders.join(', ')}]. ` +
               `Sin embargo, no hay filas de datos debajo de ellas todavía. Asegúrate de haber añadido filas de preguntas o temas debajo de la fila de cabeceras. ` +
               `Nota: Si acabas de escribir datos o publicar el documento, Google Sheets suele tardar de 2 a 5 minutos en propagar los nuevos datos en el enlace de publicación pública.`
      });
    }

    // Parse structures
    const dataRows = validRows.slice(1);
    
    const questions: any[] = [];
    const theories: any[] = [];

    dataRows.forEach((row, rowIndex) => {
      const item: { [key: string]: string } = {};
      headers.forEach((header, index) => {
        item[header] = row[index] || '';
      });

      const moduleVal = parseInt(item.module || '1', 10) - 1; // 0-indexed
      const dayVal = item.day ? parseInt(item.day, 10) - 1 : undefined; // 0-indexed
      const typeVal = (item.type || '').trim().toLowerCase();

      if (typeVal === 'practice' || typeVal === 'test') {
        if (item.question && item.correct_option) {
          questions.push({
            id: `sheet_q_${rowIndex}`,
            moduleIndex: isNaN(moduleVal) ? 0 : moduleVal,
            dayIndex: dayVal !== undefined && isNaN(dayVal) ? undefined : dayVal,
            question: item.question.trim(),
            options: {
              a: (item.option_a || '').trim(),
              b: (item.option_b || '').trim(),
              c: (item.option_c || '').trim(),
              d: (item.option_d || '').trim()
            },
            correctOption: item.correct_option.toLowerCase().trim() as 'a' | 'b' | 'c' | 'd',
            explanation: item.explanation ? item.explanation.trim() : 'Respuesta correcta importada desde Google Sheets.'
          });
        }
      } else if (typeVal === 'theory' && item.theory_content) {
        // Parse theory day
        // We'll collect these to update modules dynamically
        // ...
      }
    });

    if (questions.length === 0 && theories.length === 0) {
      return res.status(400).json({
        error: `Se leyó la hoja de cálculo con éxito (${dataRows.length} filas), pero ninguna fila pudo ser procesada como pregunta o tema. ` +
               `Asegúrate de que la columna 'type' contenga 'practice' o 'test' para preguntas, y que tengan texto en la columna 'question' y una opción correcta ('a', 'b', 'c', 'd') en 'correct_option'. ` +
               `Cabeceras leídas y normalizadas: [${headers.join(', ')}]`
      });
    }

    res.json({
      success: true,
      recordsSynced: validRows.length - 1,
      questionsCount: questions.length,
      questions
    });

  } catch (error: any) {
    console.error('Error syncing Google Sheet:', error);
    res.status(500).json({ error: 'Error al sincronizar Google Sheets: ' + error.message });
  }
});

// ----------------------------------------------------
// 4. Serve Vite/Production App
// ----------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
