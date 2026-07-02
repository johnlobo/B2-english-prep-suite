import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'b2_database.json');

app.use(express.json());

// Initialize Local JSON Database
interface DatabaseSchema {
  users: { [id: string]: { id: string; email: string; name: string; passwordHash: string; createdAt: string } };
  progress: { [userId: string]: any };
}

function readDb(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = { users: {}, progress: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading database file, resetting', e);
    return { users: {}, progress: {} };
  }
}

function writeDb(db: DatabaseSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ----------------------------------------------------
// 1. Authentication Endpoints
// ----------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const db = readDb();
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = Object.values(db.users).find(u => u.email === normalizedEmail);
  if (existingUser) {
    return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
  }

  const userId = 'user_' + Math.random().toString(36).substr(2, 9);
  const newUser = {
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: password, // Simple plain text for this environment (mock/test app)
    createdAt: new Date().toISOString()
  };

  db.users[userId] = newUser;
  db.progress[userId] = {
    userId,
    completedTheory: [],
    practiceAttempts: {},
    examAttempts: []
  };

  writeDb(db);

  res.json({
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    progress: db.progress[userId]
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  const db = readDb();
  const normalizedEmail = email.toLowerCase().trim();

  const user = Object.values(db.users).find(u => u.email === normalizedEmail && u.passwordHash === password);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales incorrectas o usuario inexistente' });
  }

  // Find or create progress
  if (!db.progress[user.id]) {
    db.progress[user.id] = {
      userId: user.id,
      completedTheory: [],
      practiceAttempts: {},
      examAttempts: []
    };
    writeDb(db);
  }

  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    progress: db.progress[user.id]
  });
});

// ----------------------------------------------------
// 2. User Progress Endpoints
// ----------------------------------------------------
app.get('/api/progress/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const progress = db.progress[userId];
  if (!progress) {
    return res.status(404).json({ error: 'Progreso no encontrado' });
  }
  res.json(progress);
});

app.post('/api/progress/:userId', (req, res) => {
  const { userId } = req.params;
  const updatedProgress = req.body;
  if (!updatedProgress) {
    return res.status(400).json({ error: 'Progreso inválido' });
  }

  const db = readDb();
  db.progress[userId] = {
    ...db.progress[userId],
    ...updatedProgress,
    userId // preserve the correct ID
  };
  writeDb(db);

  res.json({ success: true, progress: db.progress[userId] });
});

// ----------------------------------------------------
// 3. AI Tutor Explanation (Gemini API)
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
// 4. Google Sheets Sync Proxy
// ----------------------------------------------------
app.post('/api/sheets/sync', async (req, res) => {
  const { sheetUrl } = req.body;
  if (!sheetUrl) {
    return res.status(400).json({ error: 'Falta la URL de Google Sheets' });
  }

  try {
    // If the URL contains /edit, we try to convert it to a CSV output url for ease of parsing!
    let csvUrl = sheetUrl;
    if (sheetUrl.includes('docs.google.com/spreadsheets')) {
      const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const spreadsheetId = match[1];
        // We look for a grid ID if supplied
        const gidMatch = sheetUrl.match(/gid=([0-9]+)/);
        const gid = gidMatch ? gidMatch[1] : '0';
        csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
      }
    }

    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Google Sheets respondió con código ${response.status}`);
    }

    const csvText = await response.text();
    
    // Parse CSV simple parser
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
        } else if (char === ',') {
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

    if (validRows.length < 2) {
      return res.status(400).json({ error: 'La hoja de cálculo está vacía o no tiene cabeceras' });
    }

    // Parse structures
    const headers = validRows[0].map(h => h.trim().toLowerCase());
    
    // We expect headers: module, day, type, question, option_a, option_b, option_c, option_d, correct_option, explanation, theory_content, title, focus
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

      if (item.type === 'practice' || item.type === 'test') {
        if (item.question && item.correct_option) {
          questions.push({
            id: `sheet_q_${rowIndex}`,
            moduleIndex: isNaN(moduleVal) ? 0 : moduleVal,
            dayIndex: dayVal !== undefined && isNaN(dayVal) ? undefined : dayVal,
            question: item.question,
            options: {
              a: item.option_a || '',
              b: item.option_b || '',
              c: item.option_c || '',
              d: item.option_d || ''
            },
            correctOption: item.correct_option.toLowerCase().trim() as 'a' | 'b' | 'c' | 'd',
            explanation: item.explanation || 'Respuesta correcta importada desde Google Sheets.'
          });
        }
      } else if (item.type === 'theory' && item.theory_content) {
        // Parse theory day
        // We'll collect these to update modules dynamically
        // ...
      }
    });

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
// 5. Serve Vite/Production App
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
