import { ModuleData, Question } from '../types';

export const DEFAULT_B2_DATA: ModuleData[] = [
  {
    index: 0,
    title: "Módulo 1: Tiempos Verbales y Estructuras Narrativas",
    description: "Dominar la precisión temporal entre el Past Simple, Present Perfect, Pasados Perfectos y Continuos, formas avanzadas de futuro, hábitos en el pasado y la matriz de concordancia temporal.",
    days: [
      {
        title: "Día 1: Presente Perfecto vs. Pasado Simple",
        focus: "Diferencia entre eventos concluidos (Past Simple) y eventos conectados con el presente (Present Perfect).",
        cheatSheet: [
          "Past Simple (Acciones Finitas): Considera la acción como un evento cerrado, aislado en un espacio de tiempo que ya ha concluido.",
          "Present Perfect Simple (Acciones Puente): Considera la acción pasada como algo que tiene relevancia, consecuencias directas o continuidad en el momento actual.",
          "Time Markers Past Simple: yesterday, ago, last week/year, in 2018, when I was at school.",
          "Time Markers Present Perfect: already, yet, just, ever, never, so far, recently, up to now.",
          "For vs. Since: For indica duración total (for 5 years), Since marca el punto exacto de inicio (since 2021).",
          "Been vs. Gone: 'Has been to' significa que fue y ya regresó. 'Has gone to' significa que fue y aún no ha vuelto."
        ],
        practiceQuestions: [
          {
            id: "m1d1_1",
            moduleIndex: 0,
            dayIndex: 0,
            question: "I _________ basketball for ten years, and I still play twice a week now.",
            options: {
              a: "played",
              b: "have played",
              c: "played recently",
              d: "play"
            },
            correctOption: "b",
            explanation: "Usa el Present Perfect ('have played') porque indica una acción que empezó en el pasado y continúa o tiene relevancia en el presente, reforzado por 'and I still play'."
          },
          {
            id: "m1d1_2",
            moduleIndex: 0,
            dayIndex: 0,
            question: "The team _________ the championship game last night in a dramatic final.",
            options: {
              a: "has won",
              b: "won",
              c: "wins",
              d: "had won"
            },
            correctOption: "b",
            explanation: "El marcador temporal 'last night' es específico del pasado, lo que obliga a utilizar el Pasado Simple ('won')."
          },
          {
            id: "m1d1_3",
            moduleIndex: 0,
            dayIndex: 0,
            question: "Lucas _________ to Germany in 2022, but he returned to Spain a few months ago.",
            options: {
              a: "has moved",
              b: "moved",
              c: "moves",
              d: "had moved"
            },
            correctOption: "b",
            explanation: "El año 'in 2022' es un momento temporal cerrado, por lo que exige el uso de Pasado Simple ('moved')."
          },
          {
            id: "m1d1_4",
            moduleIndex: 0,
            dayIndex: 0,
            question: "\"Have you finished the project report?\" - \"No, I haven't completed it _________.\"",
            options: {
              a: "already",
              b: "ago",
              c: "just",
              d: "yet"
            },
            correctOption: "d",
            explanation: "'Yet' se utiliza típicamente al final de oraciones negativas e interrogativas en presente perfecto."
          },
          {
            id: "m1d1_5",
            moduleIndex: 0,
            dayIndex: 0,
            question: "Since he _________ Project Lead, the department's efficiency has increased by 20%.",
            options: {
              a: "became",
              b: "has become",
              c: "becomes",
              d: "had become"
            },
            correctOption: "a",
            explanation: "Detrás de 'since' introduciendo un hito temporal en pasado se emplea Pasado Simple ('became'), mientras que la frase principal lleva Presente Perfecto."
          }
        ]
      },
      {
        title: "Día 2: Pasado Perfecto, Pasado Continuo y Mecánica Narrativa",
        focus: "Establecer el orden cronológico correcto de acciones superpuestas o secuenciales en el relato pasado.",
        cheatSheet: [
          "Pasado Continuo (was/were + V-ing): Expresa acciones largas en desarrollo que sirven de trasfondo (background) o son interrumpidas.",
          "Estructura típica: While + Pasado Continuo, Pasado Simple (interrupción).",
          "Pasado Perfecto Simple (had + Participio): Expresa el 'antes del pasado' (un evento que ocurrió antes de otro hito pasado).",
          "Estructura típica de test: By the time + Pasado Simple, Pasado Perfecto ('Para cuando ocurrió X, ya había ocurrido Y')."
        ],
        practiceQuestions: [
          {
            id: "m1d2_1",
            moduleIndex: 0,
            dayIndex: 1,
            question: "While the players _________ on the court, the coach was taking notes on his clipboard.",
            options: {
              a: "warmed up",
              b: "were warming up",
              c: "had warmed up",
              d: "have warmed up"
            },
            correctOption: "b",
            explanation: "La conjunción 'while' introduce una acción continua en desarrollo en el pasado, por tanto se requiere Pasado Continuo ('were warming up')."
          },
          {
            id: "m1d2_2",
            moduleIndex: 0,
            dayIndex: 1,
            question: "By the time the referee blew the final whistle, the team _________ three goals.",
            options: {
              a: "scored",
              b: "was scoring",
              c: "had scored",
              d: "has scored"
            },
            correctOption: "c",
            explanation: "La expresión 'By the time + Pasado Simple' exige Pasado Perfecto ('had scored') para indicar la acción que ocurrió con anterioridad."
          },
          {
            id: "m1d2_3",
            moduleIndex: 0,
            dayIndex: 1,
            question: "I couldn't log into the corporate server because I _________ my password at home.",
            options: {
              a: "forgot",
              b: "had forgotten",
              c: "have forgotten",
              d: "was forgetting"
            },
            correctOption: "b",
            explanation: "Olvidar la contraseña ocurrió cronológicamente antes del intento fallido de inicio de sesión, lo que requiere Pasado Perfecto ('had forgotten')."
          },
          {
            id: "m1d2_4",
            moduleIndex: 0,
            dayIndex: 1,
            question: "When the meeting started, the manager realized she _________ the updated slides.",
            options: {
              a: "hadn't printed",
              b: "didn't print",
              c: "was printing",
              d: "hasn't printed"
            },
            correctOption: "a",
            explanation: "La omisión de imprimir las diapositivas ocurrió antes de que empezara la reunión, exigiendo Pasado Perfecto Negativo ('hadn't printed')."
          },
          {
            id: "m1d2_5",
            moduleIndex: 0,
            dayIndex: 1,
            question: "Marta reached for her phone, but she suddenly remembered she _________ it in the car.",
            options: {
              a: "left",
              b: "was leaving",
              c: "has left",
              d: "had left"
            },
            correctOption: "d",
            explanation: "Dejar el teléfono en el coche ocurrió con anterioridad a recordar el hecho, requiriendo el uso de Pasado Perfecto ('had left')."
          }
        ]
      },
      {
        title: "Día 3: Expresión de Futuro, Aspecto Perfecto y Agendas",
        focus: "Matices del futuro (Will, Going to, Present Simple, Present Continuous, y Future Perfect) según certezas y agendas.",
        cheatSheet: [
          "Present Simple: Horarios oficiales, calendarios o transporte (The train leaves at 8:00).",
          "Present Continuous: Planes confirmados y agendados con otra persona o entidad (I am meeting the director at 4:00).",
          "Be going to: Intenciones internas o predicciones basadas en evidencias físicas actuales (Look at those clouds! It is going to rain).",
          "Will: Decisiones espontáneas en el momento de hablar, promesas o predicciones subjetivas.",
          "Future Perfect (will have + Participio): Acción que habrá concluido antes de un momento futuro límite marcado habitualmente por 'By + [fecha/hora]'."
        ],
        practiceQuestions: [
          {
            id: "m1d3_1",
            moduleIndex: 0,
            dayIndex: 2,
            question: "Don't worry about the technical issue on the server; I _________ it right now.",
            options: {
              a: "'m going to fix",
              b: "'ll fix",
              c: "fix",
              d: "'m fixing"
            },
            correctOption: "b",
            explanation: "Se trata de una decisión espontánea tomada en el mismo momento de hablar, lo que exige el uso de 'will' ('ll fix')."
          },
          {
            id: "m1d3_2",
            moduleIndex: 0,
            dayIndex: 2,
            question: "Our flight to Frankfurt _________ at exactly 6:45 AM tomorrow morning.",
            options: {
              a: "is leaving",
              b: "will have left",
              c: "leaves",
              d: "leave"
            },
            correctOption: "c",
            explanation: "Para horarios de vuelos, trenes y transporte oficial se utiliza el Presente Simple ('leaves')."
          },
          {
            id: "m1d3_3",
            moduleIndex: 0,
            dayIndex: 2,
            question: "By the end of this intensive training program, the students _________ over 200 test questions.",
            options: {
              a: "will complete",
              b: "are completing",
              c: "will have completed",
              d: "complete"
            },
            correctOption: "c",
            explanation: "La expresión temporal límite 'By the end of...' requiere de forma característica el Futuro Perfecto ('will have completed')."
          },
          {
            id: "m1d3_4",
            moduleIndex: 0,
            dayIndex: 2,
            question: "\"Why are you turning on the computer?\" - \"I _________ some emails regarding the project.\"",
            options: {
              a: "'ll write",
              b: "'m going to write",
              c: "write",
              d: "will have written"
            },
            correctOption: "b",
            explanation: "Muestra una intención o plan previo al acto de encender el ordenador, por lo que se utiliza 'be going to' ('m going to write')."
          },
          {
            id: "m1d3_5",
            moduleIndex: 0,
            dayIndex: 2,
            question: "I can't meet you for lunch on Thursday afternoon because I _________ a client at 1:30 PM.",
            options: {
              a: "'m meeting",
              b: "meet",
              c: "will have met",
              d: "going to meet"
            },
            correctOption: "a",
            explanation: "Se trata de una cita o plan agendado y confirmado con otra persona en el futuro, requiriendo Presente Continuo ('m meeting')."
          }
        ]
      },
      {
        title: "Día 4: Hábitos en el Pasado y Adaptación al Entorno",
        focus: "Diferenciar de forma infalible las estructuras Used to, Would, y Be/Get Used to.",
        cheatSheet: [
          "Used to + Infinitivo: Hábitos o estados en el pasado que ya no son reales. (I used to play basketball). Negativa: didn't use to.",
          "Would + Infinitivo: Rutinas repetidas en el pasado (narraciones nostálgicas). RESTRICCIÓN: Nunca se puede usar con verbos de estado (be, have, love, live).",
          "Be / Get used to + GERUNDIO (-ing) o Sustantivo: Estar familiarizado con algo (be) o en proceso de adaptarse a algo nuevo (get). 'To' es preposición pura, exige -ing.",
          "Tip de Examen: Si ves un hueco seguido de un verbo en -ing, descarta 'used to' a secas y busca la opción con be o get."
        ],
        practiceQuestions: [
          {
            id: "m1d4_1",
            moduleIndex: 0,
            dayIndex: 3,
            question: "When we lived near the stadium, we _________ go to every home game on Saturdays.",
            options: {
              a: "used to",
              b: "would",
              c: "were used to",
              d: "both a and b are correct"
            },
            correctOption: "d",
            explanation: "Al tratarse de una acción dinámica y repetida en el pasado (go), se puede utilizar tanto 'used to' como 'would' indistintamente."
          },
          {
            id: "m1d4_2",
            moduleIndex: 0,
            dayIndex: 3,
            question: "Although the new project management tool was complicated, she quickly got used to _________ it.",
            options: {
              a: "use",
              b: "using",
              c: "used",
              d: "be using"
            },
            correctOption: "b",
            explanation: "La estructura 'got used to' requiere que el verbo que la sucede adopte de forma obligatoria la forma de gerundio ('using')."
          },
          {
            id: "m1d4_3",
            moduleIndex: 0,
            dayIndex: 3,
            question: "I _________ living in a quiet village, so moving to the center of Madrid was quite a shock at first.",
            options: {
              a: "didn't use to",
              b: "wasn't used to",
              c: "wouldn't",
              d: "used to"
            },
            correctOption: "b",
            explanation: "Significa 'no estaba acostumbrado a' y antecede a un gerundio ('living'), por lo que encaja la estructura 'wasn't used to'."
          },
          {
            id: "m1d4_4",
            moduleIndex: 0,
            dayIndex: 3,
            question: "Years ago, that company _________ own three separate offices in the financial district.",
            options: {
              a: "would",
              b: "used to",
              c: "was used to",
              d: "used"
            },
            correctOption: "b",
            explanation: "El verbo 'own' (poseer) es un verbo de estado, lo que imposibilita el uso de 'would'. Exige 'used to'."
          },
          {
            id: "m1d4_5",
            moduleIndex: 0,
            dayIndex: 3,
            question: "It took the young basketball player several months to get used to _________ with the senior team.",
            options: {
              a: "train",
              b: "training",
              c: "trained",
              d: "have trained"
            },
            correctOption: "b",
            explanation: "Nuevamente, 'get used to' funciona con la preposición 'to', exigiendo un verbo posterior en -ing ('training')."
          }
        ]
      },
      {
        title: "Día 5: Estrategias de Descarte y Coherencia Temporal",
        focus: "Técnicas sintácticas para detectar distractores de test basándonos en la concordancia de tiempos verbales.",
        cheatSheet: [
          "Matriz de combinaciones:",
          "1. Pasado Simple combina con Pasado Continuo (Interrupción) o Pasado Perfecto (Anterioridad).",
          "2. Presente Simple combina con Futuro con Will (Condición o Predicción).",
          "3. Presente Perfecto conecta con Pasado Simple a través de 'Since'.",
          "Bloqueo de Will: En oraciones subordinadas temporales de futuro (when, as soon as, by the time), está terminantemente prohibido usar 'will'. Se usa Present Simple."
        ],
        practiceQuestions: [
          {
            id: "m1d5_1",
            moduleIndex: 0,
            dayIndex: 4,
            question: "Look at the traffic on the highway! We _________ the kickoff of the match.",
            options: {
              a: "will miss",
              b: "'re going to miss",
              c: "miss",
              d: "will have missed"
            },
            correctOption: "b",
            explanation: "La exclamación 'Look at the traffic!' aporta una prueba física objetiva y presente, lo que obliga a emplear 'be going to'."
          },
          {
            // By next June
            id: "m1-d5-q2",
            moduleIndex: 0,
            dayIndex: 4,
            question: "By next June, my son _________ his second year of secondary school (2º ESO).",
            options: {
              a: "finishes",
              b: "will finish",
              c: "will have finished",
              d: "is finishing"
            },
            correctOption: "c",
            explanation: "El marcador temporal futuro con fecha límite 'By next June' requiere invariablemente el uso de Futuro Perfecto ('will have finished')."
          },
          {
            id: "m1d5_3",
            moduleIndex: 0,
            dayIndex: 4,
            question: "I dropped my keys while I _________ out of the office yesterday evening.",
            options: {
              a: "was walking",
              b: "walked",
              c: "had walked",
              d: "have walked"
            },
            correctOption: "a",
            explanation: "La conjunción 'while' y el sentido de la frase describen una acción en desarrollo en el pasado que se ve interrumpida por un hecho puntual (dropped), lo que requiere Pasado Continuo ('was walking')."
          },
          {
            id: "m1d5_4",
            moduleIndex: 0,
            dayIndex: 4,
            question: "We _________ have any automated deployment servers when I joined the company in 2023.",
            options: {
              a: "didn't used to",
              b: "didn't use to",
              c: "wouldn't",
              d: "weren't used to"
            },
            correctOption: "b",
            explanation: "La forma negativa correcta del hábito en pasado es 'didn't use to' (sin la '-d' final porque ya está presente el auxiliar 'didn't')."
          },
          {
            id: "m1d5_5",
            moduleIndex: 0,
            dayIndex: 4,
            question: "I _________ four emails to the client this morning, but I haven't received a reply yet.",
            options: {
              a: "wrote",
              b: "have written",
              c: "was writing",
              d: "had written"
            },
            correctOption: "b",
            explanation: "La acción tiene una consecuencia directa en el presente ('I haven't received a reply yet') y la mañana aún continúa, requiriendo Presente Perfecto ('have written')."
          }
        ]
      }
    ],
    resources: [
      {
        id: "r1_1",
        name: "Gramática B2: Tiempos Verbales y Narrativa.pdf",
        description: "Cheat sheet completo en PDF con activadores visuales, fórmulas gramaticales y ejemplos interactivos de Past Simple, Present Perfect y Hábitos pasados.",
        fileSize: "1.2 MB",
        type: "pdf",
        content: "CONTENIDO DESCARGABLE: GUÍA DE TIEMPOS VERBALES B2\n\n1. Past Simple vs Present Perfect\n- Marcadores Past Simple: yesterday, ago, last year, when I was...\n- Marcadores Present Perfect: yet, already, ever, never, since, for.\n\n2. Narrative Tenses\n- Past Continuous: was/were + V-ing. (While I was coding...)\n- Past Perfect: had + Past Participle. (By the time they arrived...)\n\n3. Habits\n- Used to + Infinitive: Past habits/states.\n- Would + Infinitive: Past habits (no states).\n- Be/Get used to + -ing: Accustomed to."
      },
      {
        id: "r1_2",
        name: "Matriz de Coherencia Temporal de Examen.xlsx",
        description: "Hoja de cálculo interactiva para practicar la concordancia de tiempos verbales de forma mecánica, simulando las reglas de Cambridge First (FCE).",
        fileSize: "680 KB",
        type: "spreadsheet",
        content: "MATRIZ DE COHERENCIA TEMPORAL B2\n\nCláusula 1\tNexo\tCláusula 2\tEstructura correcta\tEjemplo\nPast Simple\tWhile\tPast Continuous\twas/were -ing\tWhile she was training, she hurt her ankle.\nPresent Perfect\tSince\tPast Simple\tVerb -ed / Irregular\tI haven't seen Martín since he left school.\nBy the time\tPast Simple\tPast Perfect\thad + Participio\tBy the time the whistle blew, they had scored."
      }
    ],
    podcastEpisodes: [
      {
        id: "p1_1",
        audioStoragePath: "El_Marco_Gramatical_B2.mp4",
        title: "Episodio 1: El Marco Gramatical B2 y el Gran Error",
        duration: "4:15",
        description: "Análisis sobre por qué no debes confiar únicamente en la intuición o en el 'me suena bien' para aprobar el examen tipo test de B2.",
        transcript: [
          { speaker: "Profesor", text: "¡Hola! Bienvenidos al análisis del Marco Gramatical B2. Hoy analizaremos un error crítico que comete el noventa por ciento de los candidatos: confiar ciegamente en la intuición." },
          { speaker: "Estudiante", text: "Es verdad, siempre usamos el 'me suena bien' o 'me suena natural' en el Use of English." },
          { speaker: "Profesor", text: "Exacto, pero los examinadores de Cambridge diseñan las preguntas de opción múltiple específicamente con trampas o 'distractores' que suenan muy bien al oído pero rompen reglas de coherencia gramatical. Por eso, aprobar exige un enfoque estratégico y mecánico." }
        ]
      },
      {
        id: "p1_2",
        audioStoragePath: "Lógica_matemática_para_los_verbos_B2.m4a",
        title: "Episodio 2: El Enigma de 'Used to' y 'Would'",
        duration: "3:40",
        description: "Explicación detallada con trucos de examen para distinguir 'Used to', 'Would' y 'Be/Get used to' sin equivocarte.",
        transcript: [
          { speaker: "Profesor", text: "Hoy dissectamos la tríada del hábito: Used to, Would y Be/Get Used to. Esta última es la favorita de los caza-bobos de examen." },
          { speaker: "Estudiante", text: "¿Cuál es el principal factor en el que debemos fijarnos?" },
          { speaker: "Profesor", text: "El entorno sintáctico del hueco. Si ves un gerundio en -ing justo después, ¡descarta 'used to' a secas! Automáticamente busca la opción que lleve 'be' o 'get'. Además, recuerda que 'would' jamás se junta con verbos de estado como have, live, own o love." }
        ]
      }
    ],
    controlExam: [
      {
        id: "m1c_1",
        moduleIndex: 0,
        question: "We _________ each other since we worked together on that software project three years ago.",
        options: {
          a: "didn't see",
          b: "haven't seen",
          c: "don't see",
          d: "hadn't seen"
        },
        correctOption: "b",
        explanation: "Usa el Presente Perfecto porque el nexo 'since' conecta una acción puntual pasada ('since we worked') con un estado que continúa en el presente ('we haven't seen')."
      },
      {
        id: "m1c_2",
        moduleIndex: 0,
        question: "The presentation _________ at 9:00 AM sharp tomorrow, so please don't be late.",
        options: {
          a: "will start",
          b: "is starting",
          c: "starts",
          d: "will have started"
        },
        correctOption: "c",
        explanation: "Para eventos programados por un calendario u horario fijo (como una reunión corporativa formal o tren), se emplea Presente Simple ('starts')."
      },
      {
        id: "m1c_3",
        moduleIndex: 0,
        question: "When I arrived at the court, I realized I _________ the wrong basketball shoes.",
        options: {
          a: "packed",
          b: "have packed",
          c: "was packing",
          d: "had packed"
        },
        correctOption: "d",
        explanation: "La acción de meter las zapatillas equivocadas en la mochila ocurrió antes de llegar a la cancha, requiriendo Pasado Perfecto ('had packed')."
      },
      {
        id: "m1c_4",
        moduleIndex: 0,
        question: "I'm afraid I can't assist you this afternoon because I _________ a team meeting from 3 to 5 PM.",
        options: {
          a: "attend",
          b: "'ll attend",
          c: "'m attending",
          d: "will have attended"
        },
        correctOption: "c",
        explanation: "Se emplea el Presente Continuo con valor de futuro ('m attending') para planes ya organizados y fijados en la agenda."
      },
      {
        id: "m1c_5",
        moduleIndex: 0,
        question: "As a child, he _________ spend hours practicing his free throws in the backyard.",
        options: {
          a: "would",
          b: "used to",
          c: "was used to",
          d: "both a and b are correct"
            },
        correctOption: "d",
        explanation: "Ambas estructuras son correctas para expresar un hábito dinámico de acción repetida en el pasado ('spend hours practicing')."
      },
      {
        id: "m1c_6",
        moduleIndex: 0,
        question: "It's the first time our company _________ such a large-scale project in Madrid.",
        options: {
          a: "managed",
          b: "has managed",
          c: "is managing",
          d: "manages"
        },
        correctOption: "b",
        explanation: "La estructura formal 'It is the first/second time...' exige obligatoriamente ir acompañada de Presente Perfecto ('has managed')."
      },
      {
        id: "m1c_7",
        moduleIndex: 0,
        question: "By the time the code-server environment was fully configured, the developer _________ working for eight hours.",
        options: {
          a: "was",
          b: "has been",
          c: "had been",
          d: "is"
        },
        correctOption: "c",
        explanation: "'By the time + Pasado Simple' exige un Pasado Perfecto en la otra cláusula, en este caso Pasado Perfecto Continuo ('had been') para indicar duración."
      },
      {
        id: "m1c_8",
        moduleIndex: 0,
        question: "I found it very difficult to get used to _________ on the left side of the road when I visited the UK.",
        options: {
          a: "drive",
          b: "driving",
          c: "drove",
          d: "be driving"
        },
        correctOption: "b",
        explanation: "La expresión 'get used to' exige que cualquier verbo posterior tome de forma obligatoria la forma de gerundio en -ing ('driving')."
      },
      {
        id: "m1c_9",
        moduleIndex: 0,
        question: "\"Where is Sarah?\" - \"She _________ to the server room to check the router. She'll be back in five minutes.\"",
        options: {
          a: "has been",
          b: "has gone",
          c: "went",
          d: "had gone"
        },
        correctOption: "b",
        explanation: "'Has gone to' indica que la persona ha ido a un sitio y todavía está allí o de camino. 'Has been to' significaría que fue y ya regresó."
      },
      {
        id: "m1c_10",
        moduleIndex: 0,
        question: "Alexander _________ his ankle yesterday while he was running for a rebound.",
        options: {
          a: "twisted",
          b: "has twisted",
          c: "was twisting",
          d: "had twisted"
        },
        correctOption: "a",
        explanation: "La palabra 'yesterday' sitúa la acción en un tiempo pasado cerrado. Además, interrumpe una acción continua en Pasado Continuo ('was running'), por lo que va en Pasado Simple."
      }
    ]
  },
  {
    index: 1,
    title: "Módulo 2: Conectores, Condicionales y Estructuras Avanzadas",
    description: "Dominar los tres tipos básicos de condicionales, los condicionales mixtos, conectores de contraste y concesión, nexos causales y de propósito, y expresiones con Wish/If Only.",
    days: [
      {
        title: "Día 1: Condicionales Reales e Imaginarios (0, 1st, 2nd)",
        focus: "Uso y estructura de los condicionales básicos y nexos alternativos como unless, provided that, y as long as.",
        cheatSheet: [
          "Condicional Tipo 0: Verdades generales (If + Present, Present).",
          "Condicional Tipo 1: Probabilidad futura (If + Present, Will + Inf).",
          "Condicional Tipo 2: Hipótesis o fantasía presente (If + Past, Would + Inf). Se prefiere 'were' para todas las personas del verbo to be.",
          "Nexos alternativos: Unless (A menos que), Provided (that) (Siempre que), As long as (Siempre y cuando).",
          "REGLA DE ORO: No uses 'will' inmediatamente detrás de these nexos."
        ],
        practiceQuestions: [
          {
            id: "m2d1_1",
            moduleIndex: 1,
            dayIndex: 0,
            question: "We will launch the new corporate application next week _________ the developers find any critical bugs.",
            options: {
              a: "if",
              b: "as long as",
              c: "unless",
              d: "provided that"
            },
            correctOption: "c",
            explanation: "'Unless' significa 'a menos que' (if not). Lanzaremos la aplicación a menos que se encuentren errores críticos."
          },
          {
            id: "m2d1_2",
            moduleIndex: 1,
            dayIndex: 0,
            question: "If I _________ more experience in project management, I would apply for the Lead position.",
            options: {
              a: "have",
              b: "had",
              c: "would have",
              d: "will have"
            },
            correctOption: "b",
            explanation: "Es un condicional de Tipo 2 (situación hipotética actual): 'If + Past Simple, would + infinitivo'. Requiere 'had'."
          },
          {
            id: "m2d1_3",
            moduleIndex: 1,
            dayIndex: 0,
            question: "Provided that the client _________ the budget today, we will start setting up the server tomorrow.",
            options: {
              a: "approves",
              b: "will approve",
              c: "approved",
              d: "would approve"
            },
            correctOption: "a",
            explanation: "Detrás de 'provided that' se utiliza el Presente Simple ('approves') para expresar una condición de futuro real (Tipo 1)."
          },
          {
            id: "m2d1_4",
            moduleIndex: 1,
            dayIndex: 0,
            question: "If he _________ chosen for the regional basketball team, he would have to practice four days a week.",
            options: {
              a: "is",
              b: "were",
              c: "will be",
              d: "is being"
            },
            correctOption: "b",
            explanation: "En condicionales de Tipo 2, se prefiere formalmente 'were' en lugar de 'was' para todas las personas del verbo to be."
          },
          {
            id: "m2d1_5",
            moduleIndex: 1,
            dayIndex: 0,
            question: "You can join the intensive training session tomorrow as long as you _________ your seat in advance.",
            options: {
              a: "'ll reserve",
              b: "reserve",
              c: "reserved",
              d: "would reserve"
            },
            correctOption: "b",
            explanation: "La locución condicional 'as long as' requiere Presente Simple ('reserve') y prohíbe el uso de futuro con 'will' detrás de ella."
          }
        ]
      },
      {
        title: "Día 2: Tercer Condicional y Condicionales Mixtos",
        focus: "Lamentar el pasado (Tipo 3) y combinar pasado y presente (Condicionales Mixtos).",
        cheatSheet: [
          "Condicional Tipo 3: Hipótesis de pasado (If + Past Perfect, Would have + Participio).",
          "Condicional Mixto (Past Condition -> Present Result): Hipótesis de pasado que cambia el presente.",
          "Fórmula: If + Had + Participio (Past Perfect), ... Would + Infinitivo.",
          "Clave del test: El examen colocará marcadores de presente como 'now', 'today' o 'at the moment' al final de la oración principal."
        ],
        practiceQuestions: [
          {
            id: "m2d2_1",
            moduleIndex: 1,
            dayIndex: 1,
            question: "If the referee _________ that foul in the final seconds, our team would have won the match.",
            options: {
              a: "called",
              b: "would call",
              c: "had called",
              d: "has called"
            },
            correctOption: "c",
            explanation: "Se trata de un tercer condicional puro sobre un hecho del pasado, por lo que requiere Pasado Perfecto ('had called') en la cláusula del 'if'."
          },
          {
            id: "m2d2_2",
            moduleIndex: 1,
            dayIndex: 1,
            question: "If you _________ your password on a sticky note, your account wouldn't be blocked today.",
            options: {
              a: "hadn't written",
              b: "didn't write",
              c: "wouldn't write",
              d: "have written"
            },
            correctOption: "a",
            explanation: "Es un condicional mixto: una condición pasada ('hadn't written') con una consecuencia en el presente ('wouldn't be blocked today')."
          },
          {
            id: "m2d2_3",
            moduleIndex: 1,
            dayIndex: 1,
            question: "We would have completed the server migration on time if we _________ into those technical issues.",
            options: {
              a: "didn't run",
              b: "hadn't run",
              c: "wouldn't have run",
              d: "haven't run"
            },
            correctOption: "b",
            explanation: "Cláusula con 'if' en un tercer condicional de pasado. Requiere Pasado Perfecto en forma negativa ('hadn't run')."
          },
          {
            id: "m2d2_4",
            moduleIndex: 1,
            dayIndex: 1,
            question: "If Martín _________ his ankle last month, he would be playing in the tournament finals this afternoon.",
            options: {
              a: "didn't injure",
              b: "hadn't injured",
              c: "wouldn't injure",
              d: "hasn't injured"
            },
            correctOption: "b",
            explanation: "Condicional mixto: se lesionó en el pasado ('hadn't injured last month') lo que influye en su estado actual de esta tarde ('would be playing this afternoon')."
          },
          {
            id: "m2d2_5",
            moduleIndex: 1,
            dayIndex: 1,
            question: "I _________ you to the airport yesterday if my car hadn't broken down.",
            options: {
              a: "would drive",
              b: "will drive",
              c: "would have driven",
              d: "drove"
            },
            correctOption: "c",
            explanation: "Tercer condicional puro: describe un hecho y una consecuencia hipotéticos totalmente situados en el pasado ('would have driven')."
          }
        ]
      },
      {
        title: "Día 3: Conectores de Contraste y Concesión",
        focus: "Saber descartar conectores basándonos en la estructura sintáctica posterior al hueco.",
        cheatSheet: [
          "Seguidos de Sujeto + Verbo: Although, Even though, Though (Aunque).",
          "Seguidos de Grupo Nominal (Sustantivo, Pronombre o -ING): Despite, In spite of (A pesar de).",
          "Seguidos de Coma (,) e iniciando frase independiente: However, Nevertheless (Sin embargo)."
        ],
        practiceQuestions: [
          {
            id: "m2d3_1",
            moduleIndex: 1,
            dayIndex: 2,
            question: "_________ the intense traffic on the highway, we managed to arrive at the stadium before kickoff.",
            options: {
              a: "Although",
              b: "Despite",
              c: "In spite",
              d: "However"
            },
            correctOption: "b",
            explanation: "Detrás del hueco hay un grupo nominal ('the intense traffic'), por lo que se requiere 'Despite'. 'In spite' requeriría la preposición 'of'."
          },
          {
            id: "m2d3_2",
            moduleIndex: 1,
            dayIndex: 2,
            question: "The team played exceptionally well; _________, they lost the match in the final seconds.",
            options: {
              a: "even though",
              b: "despite",
              c: "however",
              d: "in spite of"
            },
            correctOption: "c",
            explanation: "Introduce una oración independiente, va precedido de un punto y coma y seguido de una coma, lo que exige un conector de transición como 'however'."
          },
          {
            id: "m2d3_3",
            moduleIndex: 1,
            dayIndex: 2,
            question: "_________ we had a small budget, the marketing campaign for the new app was a huge success.",
            options: {
              a: "In spite of",
              b: "Despite",
              c: "Although",
              d: "Nevertheless"
            },
            correctOption: "c",
            explanation: "Precede a una oración completa con sujeto y verbo ('we had'), por lo que exige la conjunción concesiva 'Although'."
          },
          {
            id: "m2d3_4",
            moduleIndex: 1,
            dayIndex: 2,
            question: "She decided to accept the job offer _________ the salary was lower than she expected.",
            options: {
              a: "despite",
              b: "even though",
              c: "in spite of",
              d: "however"
            },
            correctOption: "b",
            explanation: "Va seguido de una cláusula con sujeto y verbo ('the salary was'), por lo que encaja perfectamente 'even though'."
          },
          {
            id: "m2d3_5",
            moduleIndex: 1,
            dayIndex: 2,
            question: "In spite of _________ hours configuring the Docker containers, the deployment still failed.",
            options: {
              a: "spend",
              b: "spending",
              c: "spent",
              d: "he spent"
            },
            correctOption: "b",
            explanation: "Detrás de la locución preposicional 'In spite of' se requiere obligatoriamente un sustantivo o un verbo en gerundio ('spending')."
          }
        ]
      },
      {
        title: "Día 4: Conectores de Causa, Efecto y Propósito",
        focus: "Diferenciar sintácticamente nexos causales, de propósito (para) y consecuenciales.",
        cheatSheet: [
          "Causa: Because / Since / As + Sujeto + Verbo. Because of / Due to + Sustantivo.",
          "Propósito (Para): To / In order to / So as to + Infinitivo. So that + Sujeto + Verbo (modal).",
          "Propósito Negativo (Para no): in order not to / so as not to (el NOT se pone antes de TO).",
          "Consecuencia (Por lo tanto): Therefore, Consequently, As a result."
        ],
        practiceQuestions: [
          {
            id: "m2d4_1",
            moduleIndex: 1,
            dayIndex: 3,
            question: "The match was postponed _________ heavy rain and bad court conditions.",
            options: {
              a: "because",
              b: "due to",
              c: "so that",
              d: "as a result"
            },
            correctOption: "b",
            explanation: "Precede a un sintagma nominal sin verbo conjugado, lo que exige 'due to' (debido a). 'Because' requeriría sujeto + verbo."
          },
          {
            id: "m2d4_2",
            moduleIndex: 1,
            dayIndex: 3,
            question: "The company invested in high-end VPS infrastructure _________ maximize server uptime.",
            options: {
              a: "so that",
              b: "in order to",
              c: "because",
              d: "consequently"
            },
            correctOption: "b",
            explanation: "Expresa un propósito seguido de un verbo en infinitivo ('maximize'), requiriendo la estructura 'in order to'."
          },
          {
            id: "m2d4_3",
            moduleIndex: 1,
            dayIndex: 3,
            question: "He left the office early _________ he could watch his son's basketball tournament.",
            options: {
              a: "so as to",
              b: "in order to",
              c: "so that",
              d: "because of"
            },
            correctOption: "c",
            explanation: "Expresa propósito seguido de una oración completa con verbo modal ('he could watch'), exigiendo la conjunción 'so that'."
          },
          {
            id: "m2d4_4",
            moduleIndex: 1,
            dayIndex: 3,
            question: "The server crashed unexpectedly; _________, all automated tasks were temporarily suspended.",
            options: {
              a: "due to",
              b: "as",
              c: "therefore",
              d: "so that"
            },
            correctOption: "c",
            explanation: "Introduce una consecuencia lógica en una oración independiente tras un punto y coma, requiriendo el conector 'therefore'."
          },
          {
            id: "m2d4_5",
            moduleIndex: 1,
            dayIndex: 3,
            question: "I started practicing English grammar every night _________ fail the B2 level exam.",
            options: {
              a: "so as not to",
              b: "in order to not",
              c: "so that not",
              d: "because of not"
            },
            correctOption: "a",
            explanation: "La estructura negativa de propósito exige colocar el adverbio 'not' justo antes de 'to'. La única forma correcta es 'so as not to'."
          }
        ]
      },
      {
        title: "Día 5: Expresar Deseos y Lamentos (Wish / If Only)",
        focus: "Dominar el salto verbal hacia atrás (backshift) con I wish e If only para expresar deseos y remordimientos.",
        cheatSheet: [
          "Deseo sobre el presente (modificar el ahora): Wish / If only + Past Simple. (I wish I had more money).",
          "Lamento sobre el pasado (remordimientos): Wish / If only + Past Perfect. (If only I had studied yesterday).",
          "Queja sobre el comportamiento de terceros (fastidio): Wish / If only + Would + Infinitivo. (I wish you would stop that)."
        ],
        practiceQuestions: [
          {
            id: "m2d5_1",
            moduleIndex: 1,
            dayIndex: 4,
            question: "I wish our team _________ that critical match last weekend; we would be leading the league now.",
            options: {
              a: "didn't lose",
              b: "hadn't lost",
              c: "would lose",
              d: "haven't lost"
            },
            correctOption: "b",
            explanation: "El lamento se refiere a un hecho pasado ('last weekend'), por lo que exige el uso de Pasado Perfecto ('hadn't lost')."
          },
          {
            id: "m2d5_2",
            moduleIndex: 1,
            dayIndex: 4,
            question: "If only I _________ fluent German; it would make communicating with the Munich office much easier.",
            options: {
              a: "spoke",
              b: "speak",
              c: "had spoken",
              d: "would speak"
            },
            correctOption: "a",
            explanation: "Es un deseo sobre una situación del presente que desearíamos que fuera diferente, exigiendo Pasado Simple ('spoke')."
          },
          {
            id: "m2d5_3",
            moduleIndex: 1,
            dayIndex: 4,
            question: "The server deployment is taking forever. I wish the administrator _________ the process.",
            options: {
              a: "speeded up",
              b: "would speed up",
              c: "had speeded up",
              d: "speeds up"
            },
            correctOption: "b",
            explanation: "Expresa fastidio o deseo de cambio en el comportamiento de un tercero en una acción en desarrollo, requiriendo 'would' + infinitivo."
          },
          {
            id: "m2d5_4",
            moduleIndex: 1,
            dayIndex: 4,
            question: "I wish I _________ more attention during the Z80 assembly programming lecture yesterday.",
            options: {
              a: "paid",
              b: "would pay",
              c: "had paid",
              d: "have paid"
            },
            correctOption: "c",
            explanation: "El remordimiento se sitúa expresamente en el pasado ('yesterday'), obligando al uso de Pasado Perfecto ('had paid')."
          },
          {
            id: "m2d5_5",
            moduleIndex: 1,
            dayIndex: 4,
            question: "If only we _________ to change the project scope before signing the contract.",
            options: {
              a: "didn't agree",
              b: "hadn't agreed",
              c: "wouldn't agree",
              d: "don't agree"
            },
            correctOption: "b",
            explanation: "Lamenta una decisión que ya se tomó y concluyó en el pasado (antes de firmar el contrato), por lo que requiere Pasado Perfecto ('hadn't agreed')."
          }
        ]
      }
    ],
    resources: [
      {
        id: "r2_1",
        name: "Guía de Conectores y Estructuras de Contraste B2.pdf",
        description: "PDF descargable con un desglose completo de sintaxis de conectores, puntuación (comas) y tablas comparativas de uso en Use of English.",
        fileSize: "1.5 MB",
        type: "pdf",
        content: "CONECTORES Y COHESIÓN B2 FIRST\n\n1. Conectores de Contraste\n- + Clausula (Sujeto + Verbo): Although, Even though, Though.\n- + Sustantivo / Gerundio: Despite, In spite of.\n- + Coma (,): However, Nevertheless, On the other hand.\n\n2. Conectores de Propósito (Para)\n- In order to / So as to + Infinitivo.\n- So that + Sujeto + can/could/would.\n\n3. Condicionales Mixtos\n- If + Past Perfect, would + Infinitive (Consecuencia actual)."
      }
    ],
    podcastEpisodes: [
      {
        id: "p2_1",
        audioStoragePath: "Domina_la_lógica_del_inglés_avanzado.m4a",
        title: "Episodio 3: La Anatomía de la Trampa de 'Since'",
        duration: "3:55",
        description: "Explicación magistral sobre cómo resolver los reactivos con condicionales y marcadores sintácticos de concesión.",
        transcript: [
          { speaker: "Profesor", text: "¡Hola! Bienvenidos al episodio tres. Hoy abordaremos la trampa de 'Since' y los condicionales mixtos." },
          { speaker: "Estudiante", text: "Esos condicionales donde se mezcla el pasado con el presente son una pesadilla." },
          { speaker: "Profesor", text: "Son muy mecánicos si sabes buscar la pista clave. Al final de la frase, busca marcadores de presente como 'now' o 'today'. Si están ahí y hay un condicional sobre el pasado, ¡es un mixto! 'If' va con had + participio, y el resultado con 'would' simple." }
        ]
      }
    ],
    controlExam: [
      {
        id: "m2c_1",
        moduleIndex: 1,
        question: "You will not pass the automated code review _________ you follow the strict style guidelines.",
        options: {
          a: "provided that",
          b: "as long as",
          c: "unless",
          d: "if"
        },
        correctOption: "c",
        explanation: "Requiere un conector que exprese 'a menos que' (if not) para dar coherencia negativa al condicional."
      },
      {
        id: "m2c_2",
        moduleIndex: 1,
        question: "If the company _________ its infrastructure to a cloud server last year, we wouldn't have storage problems now.",
        options: {
          a: "migrated",
          b: "had migrated",
          c: "would migrate",
          d: "has migrated"
        },
        correctOption: "b",
        explanation: "Condicional mixto: condición situada en el pasado ('last year' $\rightarrow$ had migrated) y resultado visible hoy ('wouldn't have... now')."
      },
      {
        id: "m2c_3",
        moduleIndex: 1,
        question: "_________ facing numerous technical obstacles, the development team completed the project on time.",
        options: {
          a: "Although",
          b: "Despite",
          c: "However",
          d: "Even though"
        },
        correctOption: "b",
        explanation: "El hueco va seguido de un gerundio que actúa como sustantivo ('facing...'), lo que descarta 'although' y exige 'despite'."
      },
      {
        id: "m2c_4",
        moduleIndex: 1,
        question: "The presentation was outstanding. The manager, _________, decided to modify a few slides before the meeting.",
        options: {
          a: "although",
          b: "despite",
          c: "nevertheless",
          d: "in order to"
        },
        correctOption: "c",
        explanation: "'Nevertheless' (sin embargo) es un conector de transición que puede incrustarse entre comas en mitad de una oración independiente."
      },
      {
        id: "m2c_5",
        moduleIndex: 1,
        question: "I wish you _________ tapping your pen on the desk during the evaluation panel; it's very distracting.",
        options: {
          a: "stop",
          b: "had stopped",
          c: "would stop",
          d: "stopped"
        },
        correctOption: "c",
        explanation: "Expresa una queja o fastidio en el presente por el comportamiento irritante de otra persona, requiriendo 'would' + infinitivo."
      },
      {
        id: "m2c_6",
        moduleIndex: 1,
        question: "We set up an Nginx Proxy Manager _________ route the internal traffic securely.",
        options: {
          a: "so that",
          b: "in order to",
          c: "because",
          d: "for"
        },
        correctOption: "b",
        explanation: "Expresa un propósito seguido de un verbo en infinitivo ('route'), requiriendo 'in order to'."
      },
      {
        id: "m2c_7",
        moduleIndex: 1,
        question: "If I _________ you, I would check the Docker container logs before restarting the entire system.",
        options: {
          a: "am",
          b: "was",
          c: "were",
          d: "had been"
        },
        correctOption: "c",
        explanation: "Estructura fija aconsejativa en segundo condicional: 'If I were you' (utilizando were para el subjuntivo de to be)."
      },
      {
        id: "m2c_8",
        moduleIndex: 1,
        question: "The basketball coach called a timeout _________ his players could rest and adjust their defensive strategy.",
        options: {
          a: "so as to",
          b: "in order to",
          c: "so that",
          d: "because of"
        },
        correctOption: "c",
        explanation: "Indica un propósito que precede a una oración completa con verbo modal ('his players could rest'), exigiendo 'so that'."
      },
      {
        id: "m2c_9",
        moduleIndex: 1,
        question: "If only we _________ that legacy database system! It has caused nothing but errors this week.",
        options: {
          a: "didn't purchase",
          b: "hadn't purchased",
          c: "wouldn't purchase",
          d: "don't purchase"
        },
        correctOption: "b",
        explanation: "Se lamenta una decisión que ocurrió en el pasado y ya no se puede cambiar, requiriendo Pasado Perfecto ('hadn't purchased')."
      },
      {
        id: "m2c_10",
        moduleIndex: 1,
        question: "The flight to Madrid was delayed _________ a sudden strike by the airport ground staff.",
        options: {
          a: "because",
          b: "due to",
          c: "consequently",
          d: "as"
        },
        correctOption: "b",
        explanation: "Indica causa seguida directamente de un sintagma nominal sin verbo, lo que exige la locución preposicional 'due to'."
      }
    ]
  },
  {
    index: 2,
    title: "Módulo 3: Modales, Voz Pasiva y Estilo Indirecto",
    description: "Dominar los verbos modales de deducción, obligación y consejo, la voz pasiva de doble objeto, estructuras causativas, estilo indirecto avanzado y oraciones de relativo.",
    days: [
      {
        title: "Día 1: Verbos Modales de Obligación, Permiso y Consejo",
        focus: "Diferenciar de forma precisa 'Must', 'Have to', 'Mustn't', 'Don't have to', y estructuras avanzadas de consejo.",
        cheatSheet: [
          "Obligación: Must (interna) vs. Have to (regla externa).",
          "Pasado de obligación: Must no tiene pasado; se usa de forma obligatoria 'had to'.",
          "Prohibición: Mustn't (está prohibido).",
          "Ausencia de obligación: Don't have to / Needn't (es opcional, no obligatorio).",
          "Consejo fuerte: Should, Ought to, Had better + Infinitivo sin to (ej: You'd better check)."
        ],
        practiceQuestions: [
          {
            id: "m3d1_1",
            moduleIndex: 2,
            dayIndex: 0,
            question: "When I joined the new IT department back in 2023, I _________ wear a formal suit to the office.",
            options: {
              a: "must",
              b: "must to",
              c: "had to",
              d: "ought to"
            },
            correctOption: "c",
            explanation: "Al situarse en el pasado ('back in 2023'), el único modal de obligación disponible es el pasado de have to, es decir, 'had to'."
          },
          {
            id: "m3d1_2",
            moduleIndex: 2,
            dayIndex: 0,
            question: "You _________ touch the backup server rack without proper authorization; it is strictly prohibited.",
            options: {
              a: "don't have to",
              b: "mustn't",
              c: "needn't",
              d: "had better not to"
            },
            correctOption: "b",
            explanation: "La prohibición estricta ('it is strictly prohibited') se expresa mediante el verbo modal 'mustn't'."
          },
          {
            id: "m3d1_3",
            moduleIndex: 2,
            dayIndex: 0,
            question: "The team meeting is non-mandatory today, so Martín _________ attend if he has too much work.",
            options: {
              a: "mustn't",
              b: "doesn't have to",
              c: "ought not",
              d: "had hadn't better"
            },
            correctOption: "b",
            explanation: "La ausencia de obligatoriedad ('non-mandatory') se expresa en presente con 'doesn't have to'."
          },
          {
            id: "m3d1_4",
            moduleIndex: 2,
            dayIndex: 0,
            question: "It's getting late and the deployment is tomorrow. We _________ check the Docker logs right now.",
            options: {
              a: "had better",
              b: "would rather to",
              c: "ought",
              d: "have must"
            },
            correctOption: "a",
            explanation: "El consejo fuerte y urgente en presente se expresa con 'had better' seguido directamente de infinitivo."
          },
          {
            id: "m3d1_5",
            moduleIndex: 2,
            dayIndex: 0,
            question: "You _________ print the entire PDF report; just sending the digital spreadsheet is more than enough.",
            options: {
              a: "mustn't",
              b: "needn't",
              c: "wouldn't",
              d: "had better not"
            },
            correctOption: "b",
            explanation: "'Needn't' indica falta de necesidad (no es obligatorio hacerlo). Equivale a 'don't need to'."
          }
        ]
      },
      {
        title: "Día 2: Modales de Deducción (Presente y Pasado)",
        focus: "Deducir o especular con certeza sobre hechos del presente (must, can't) y del pasado (must/can't have + participio).",
        cheatSheet: [
          "Deducción Presente de certeza absoluta: Must (sí) / Can't (no). ¡Nunca uses mustn't para deducir!",
          "Deducción Pasada (especular sobre el ayer): Estructura: Modal + HAVE + Participio.",
          "Must have done: Seguro que ocurrió (The server must have crashed).",
          "Can't have done: Seguro que NO ocurrió.",
          "Should have done: Tendría que haber ocurrido (pero no pasó)."
        ],
        practiceQuestions: [
          {
            id: "m3d2_1",
            moduleIndex: 2,
            dayIndex: 1,
            question: "Lucas didn't reply to my email all day. He _________ away from his laptop during the migration.",
            options: {
              a: "must be",
              b: "must have been",
              c: "can't have been",
              d: "should be"
            },
            correctOption: "b",
            explanation: "Es una deducción lógica de certeza afirmativa situada en el pasado (no contestó en todo el día), exigiendo 'must have been'."
          },
          {
            id: "m3d2_2",
            moduleIndex: 2,
            dayIndex: 1,
            question: "The basketball coach looks incredibly happy. The team _________ the final match this afternoon.",
            options: {
              a: "can't have won",
              b: "must have won",
              c: "should have won",
              d: "might win"
            },
            correctOption: "b",
            explanation: "El estado de felicidad del entrenador denota que está seguro de la victoria pasada, requiriendo 'must have won'."
          },
          {
            id: "m3d2_3",
            moduleIndex: 2,
            dayIndex: 1,
            question: "He _________ written that complex Z80 assembly code by himself; he only started learning it last week!",
            options: {
              a: "can't have",
              b: "mustn't have",
              c: "shouldn't have",
              d: "might not"
            },
            correctOption: "a",
            explanation: "La deducción de que NO es posible que lo hiciera solo en el pasado se expresa estrictamente mediante 'can't have'."
          },
          {
            id: "m3d2_4",
            moduleIndex: 2,
            dayIndex: 1,
            question: "I have no idea why the Nginx proxy is failing. It _________ a configuration mistake, but I'm not certain.",
            options: {
              a: "must be",
              b: "can't be",
              c: "could have been",
              d: "might be"
            },
            correctOption: "d",
            explanation: "La duda o posibilidad débil en presente se expresa con 'might be' (reforzado por 'I'm not certain')."
          },
          {
            id: "m3d2_5",
            moduleIndex: 2,
            dayIndex: 1,
            question: "You _________ me you needed the updated slides before the meeting! I would have printed them for you.",
            options: {
              a: "must have told",
              b: "should have told",
              c: "can't have told",
              d: "may have told"
            },
            correctOption: "b",
            explanation: "Expresa un reproche o lamento sobre una acción pasada que debió haber ocurrido pero no pasó, requiriendo 'should have told'."
          }
        ]
      },
      {
        title: "Día 3: Voz Pasiva y Estructuras Causativas",
        focus: "Dominar la pasiva de opinión, impersonal, y la estructura causativa delegativa.",
        cheatSheet: [
          "Pasiva general: Sujeto + Be + Participio.",
          "Pasivas de opinión: It is believed that... / He is believed to be (infinitivo).",
          "Causativa (Hacer que alguien haga algo por ti): Sujeto + HAVE / GET (tiempo conjugado) + Cosa/Objeto + Participio.",
          "Ejemplo típico: I had my server repaired (no lo reparé yo)."
        ],
        practiceQuestions: [
          {
            id: "m3d3_1",
            moduleIndex: 2,
            dayIndex: 2,
            question: "All corporate passwords _________ by the security system every 90 days for safety reasons.",
            options: {
              a: "change",
              b: "are changed",
              c: "have changed",
              d: "are changing"
            },
            correctOption: "b",
            explanation: "Las contraseñas reciben la acción en presente de forma rutinaria, requiriendo Voz Pasiva en Presente Simple ('are changed')."
          },
          {
            id: "m3d3_2",
            moduleIndex: 2,
            dayIndex: 2,
            question: "The project scope _________ by the steering committee before the development phase could begin.",
            options: {
              a: "was reviewed",
              b: "reviewed",
              c: "has been reviewed",
              d: "was reviewing"
            },
            correctOption: "a",
            explanation: "Voz Pasiva en pasado simple ('was reviewed') para una acción puntual terminada antes de otra acción en pasado (could begin)."
          },
          {
            id: "m3d3_3",
            moduleIndex: 2,
            dayIndex: 2,
            question: "The local basketball arena _________ at the moment, so the next three home matches will be relocated.",
            options: {
              a: "is repairing",
              b: "is being repaired",
              c: "has been repaired",
              d: "repairs"
            },
            correctOption: "b",
            explanation: "La locución 'at the moment' exige presente continuo. Al ser pasiva (la cancha recibe la reparación), requiere 'is being repaired'."
          },
          {
            id: "m3d3_4",
            moduleIndex: 2,
            dayIndex: 2,
            question: "Instead of fixing the office server network himself, the manager decided to _________ by an external expert.",
            options: {
              a: "have it fixed",
              b: "fix it",
              c: "have fixed it",
              d: "get it fix"
            },
            correctOption: "a",
            explanation: "Representa una estructura causativa de delegación: 'have + objeto (it) + participio (fixed)'."
          },
          {
            id: "m3d3_5",
            moduleIndex: 2,
            dayIndex: 2,
            question: "The legendary retro-programming book is believed _________ by an expert Z80 engineer back in 1985.",
            options: {
              a: "to write",
              b: "to be writing",
              c: "to have been written",
              d: "that was written"
            },
            correctOption: "c",
            explanation: "Se trata de una pasiva impersonal referida a un hecho pasado e histórico ('back in 1985'), requiriendo la estructura 'to have been written'."
          }
        ]
      },
      {
        title: "Día 4: Estilo Indirecto (Reported Speech) y Verbos de Reporte",
        focus: "Dominar el salto temporal de estilo indirecto y la sintaxis de verbos de reporte avanzados.",
        cheatSheet: [
          "Verbos + Gerundio (-ing): suggest, deny, admit, recommend.",
          "Verbos + TO + Infinitivo: promise, refuse, offer, agree.",
          "Verbos + Persona + TO + Infinitivo: advise, remind, warn, encourage.",
          "reported Questions: Pierden la inversión del auxiliar y el signo ? (He asked me if I was ready)."
        ],
        practiceQuestions: [
          {
            id: "m3d4_1",
            moduleIndex: 2,
            dayIndex: 3,
            question: "The project director _________ that the team had done an outstanding job during the panel presentation.",
            options: {
              a: "told",
              b: "said",
              c: "reminded",
              d: "advised"
            },
            correctOption: "b",
            explanation: "'Said' introduce una cláusula directa con 'that'. Los verbos told, reminded y advised exigirían un objeto de persona (told us...)."
          },
          {
            id: "m3d4_2",
            moduleIndex: 2,
            dayIndex: 3,
            question: "The lead developer sardonically denied _________ the database script without testing it first.",
            options: {
              a: "to modify",
              b: "having modified",
              c: "modify",
              d: "to have modified"
            },
            correctOption: "b",
            explanation: "El verbo 'deny' rige de forma obligatoria gerundio, en este caso en su forma de perfecto para denotar anterioridad ('having modified')."
          },
          {
            id: "m3d4_3",
            moduleIndex: 2,
            dayIndex: 3,
            question: "The head coach strictly warned the young basketball players _________ late for the early morning practice.",
            options: {
              a: "not to be",
              b: "to not be",
              c: "don't be",
              d: "not being"
            },
            correctOption: "a",
            explanation: "El patrón de advertencia en imperativo negativo indirecto es 'warn + person + NOT + to + infinitivo' ('not to be')."
          },
          {
            id: "m3d4_4",
            moduleIndex: 2,
            dayIndex: 3,
            question: "Because the server architecture was highly unstable, the network engineer suggested _________ the entire system.",
            options: {
              a: "to reboot",
              b: "rebooting",
              c: "us to reboot",
              d: "reboot"
            },
            correctOption: "b",
            explanation: "El verbo 'suggest' exige gerundio directo ('rebooting') si no se abre una cláusula con 'that'."
          },
          {
            id: "m3d4_5",
            moduleIndex: 2,
            dayIndex: 3,
            question: "After a long discussion, the client finally promised _________ the final invoice by Friday afternoon.",
            options: {
              a: "paying",
              b: "pay",
              c: "to pay",
              d: "that he pays"
            },
            correctOption: "c",
            explanation: "El verbo 'promise' se construye con un patrón de infinitivo con to ('to pay')."
          }
        ]
      },
      {
        title: "Día 5: Oraciones de Relativo y Omisión de Pronombres",
        focus: "Discernir entre Defining y Non-defining clauses, saber cuándo omitir pronombres, y evitar el uso de 'that' tras comas.",
        cheatSheet: [
          "Defining relative clauses: Permiten omitir el pronombre (who/which/that) SOLO si va seguido inmediatamente de un sujeto (persona/pronombre).",
          "Non-defining clauses (entre comas , ,): Aportan datos extra. PROHIBIDO usar 'that' o bien omitir el pronombre.",
          "Whose: Posesivo ('cuyo/a').",
          "Where / When: Lugar y tiempo."
        ],
        practiceQuestions: [
          {
            id: "m3d5_1",
            moduleIndex: 2,
            dayIndex: 4,
            question: "The automated script _________ my teammate wrote successfully parsed all the data from the PDFs.",
            options: {
              a: "who",
              b: "whose",
              c: "what",
              d: "— (no pronoun needed)"
            },
            correctOption: "d",
            explanation: "Al ir seguido de un sujeto claro ('my teammate'), el pronombre relativo ('which/that') es completamente omitible en oraciones especificativas."
          },
          {
            id: "m3d5_2",
            moduleIndex: 2,
            dayIndex: 4,
            question: "Madrid, _________ my son Martín trains with his basketball club, is a vibrant city for sports.",
            options: {
              a: "which",
              b: "where",
              c: "that",
              d: "in where"
            },
            correctOption: "b",
            explanation: "Indica un lugar físico donde se desarrolla la acción, exigiendo el adverbio relativo 'where'."
          },
          {
            id: "m3d5_3",
            moduleIndex: 2,
            dayIndex: 4,
            question: "The senior programmer, _________ advice helped me pass the technical management panel, has retired.",
            options: {
              a: "who",
              b: "whose",
              c: "which",
              d: "that"
            },
            correctOption: "b",
            explanation: "Indica relación de posesión de un sustantivo ('advice'), requiriendo el relativo 'whose' (cuyo consejo)."
          },
          {
            id: "m3d5_4",
            moduleIndex: 2,
            dayIndex: 4,
            question: "The internal server configuration file _________ caused the critical crash yesterday has been isolated.",
            options: {
              a: "who",
              b: "whose",
              c: "that",
              d: "— (no pronoun needed)"
            },
            correctOption: "c",
            explanation: "No se puede omitir el pronombre porque actúa como el sujeto del verbo 'caused'. Se requiere 'that' (o 'which')."
          },
          {
            id: "m3d5_5",
            moduleIndex: 2,
            dayIndex: 4,
            question: "Our new project manager, _________ previously worked at the Munich headquarters, speaks fluent German.",
            options: {
              a: "who",
              b: "that",
              c: "which",
              d: "— (no pronoun needed)"
            },
            correctOption: "a",
            explanation: "Es una oración explicativa (entre comas). Está prohibido usar 'that' o bien omitir el pronombre, exigiendo 'who' para personas."
          }
        ]
      }
    ],
    resources: [
      {
        id: "r3_1",
        name: "Guía Avanzada de Voz Pasiva y Estilo Indirecto B2.pdf",
        description: "Cheat sheet teórica de modales, voz pasiva de doble objeto y estilo indirecto para ejercicios de transformación (Rephrasing).",
        fileSize: "1.8 MB",
        type: "pdf",
        content: "VOZ PASIVA Y ESTILO INDIRECTO B2 FIRST\n\n1. Passive Double Object\n- Active: They offered me a job.\n- Passive: I was offered a job (Preferida en B2) / A job was offered to me.\n\n2. Reported Speech Backshift\n- Present Simple -> Past Simple\n- Past Simple / Present Perfect -> Past Perfect\n- Will -> Would\n- Can -> Could\n- Must -> Had to\n\n3. Verbos de Reporte\n- Suggest / Deny / Admit + -ing.\n- Agree / Promise / Refuse + to-inf.\n- Warn / Remind / Advise + Alguien + to-inf."
      }
    ],
    podcastEpisodes: [
      {
        id: "p3_1",
        audioStoragePath: "Claves_de_modales_y_pasivas_para_B2.m4a",
        title: "Episodio 4: Los Modales de Deducción Pasada",
        duration: "4:02",
        description: "Trucos para no fallar las especulaciones sobre el pasado y las estructuras causativas.",
        transcript: [
          { speaker: "Profesor", text: "Hola de nuevo. En el episodio cuatro entramos en terreno mecánico: deducciones pasadas y causativas." },
          { speaker: "Estudiante", text: "Ahí es donde siempre queremos usar 'mustn't' para deducir de forma negativa, ¿verdad?" },
          { speaker: "Profesor", text: "¡Gran error! Para decir 'seguro que no ocurrió' en pasado, usa estrictamente 'can't have' o 'couldn't have'. El 'mustn't' está prohibido para deducciones en inglés. Y en las causativas, recuerda la fórmula: have + la cosa + participio." }
        ]
      }
    ],
    controlExam: [
      {
        id: "m3c_1",
        moduleIndex: 2,
        question: "The infrastructure manager warned the junior technician _________ the main server credentials on a local database.",
        options: {
          a: "not to save",
          b: "to not save",
          c: "not saving",
          d: "don't save"
        },
        correctOption: "a",
        explanation: "Patrón de advertencia negativo en Reported Speech: 'warn + person + NOT + to + infinitivo'."
      },
      {
        id: "m3c_2",
        moduleIndex: 2,
        question: "I had my broken laptop screen _________ at a certified repair center in Madrid yesterday.",
        options: {
          a: "repair",
          b: "repaired",
          c: "repairing",
          d: "to repair"
        },
        correctOption: "b",
        explanation: "Estructura causativa: 'had + objeto (broken laptop screen) + participio (repaired)'."
      },
      {
        id: "m3c_3",
        moduleIndex: 2,
        question: "The star basketball player is reported _________ from his knee injury ahead of the final tournament.",
        options: {
          a: "to recover",
          b: "to have recovered",
          c: "recovering",
          d: "having recovered"
        },
        correctOption: "b",
        explanation: "Pasiva impersonal con infinitivo de perfecto ('to have recovered') para denotar una acción ya concluida con anterioridad."
      },
      {
        id: "m3c_4",
        moduleIndex: 2,
        question: "The developer _________ having modified the server configurations without completing the test phase first.",
        options: {
          a: "refused",
          b: "denied",
          c: "promised",
          d: "offered"
        },
        correctOption: "b",
        explanation: "El verbo 'deny' (en pasado 'denied') es el único de las opciones que rige gerundio ('having modified')."
      },
      {
        id: "m3c_5",
        moduleIndex: 2,
        question: "The core database backups, _________ are stored in a secured physical facility, are updated hourly.",
        options: {
          a: "that",
          b: "which",
          c: "where",
          d: "whose"
        },
        correctOption: "b",
        explanation: "Es una oración de relativo explicativa entre comas, lo que prohíbe el uso de 'that'. Exige 'which' para cosas."
      }
    ]
  },
  {
    index: 3,
    title: "Módulo 4: Vocabulario, Phrasal Verbs y Estrategia de Examen",
    description: "Dominar los Phrasal Verbs del ámbito profesional y de relaciones, preposiciones dependientes y collocations, distinguir palabras confusas (job vs work) y técnicas de examen.",
    days: [
      {
        title: "Día 1: Phrasal Verbs Esenciales para B2 (Parte 1)",
        focus: "Phrasal Verbs de ámbito corporativo, profesional y de gestión (carry out, take over, set up, bring up, look forward to).",
        cheatSheet: [
          "Carry out: Realizar/ejecutar tareas o experimentos (carry out research / a test).",
          "Take over: Asumir la gestión, mando o relevo de algo.",
          "Set up: Configurar, instalar o fundar un negocio o sistema.",
          "Bring up: Mencionar o introducir un tema difícil en una reunión.",
          "Look forward to (+ V-ing): Estar deseando que ocurra algo. OJO: Exige de forma obligatoria gerundio detrás de la preposición to."
        ],
        practiceQuestions: [
          {
            id: "m4d1_1",
            moduleIndex: 3,
            dayIndex: 0,
            question: "The infrastructure team needs to _________ a series of security tests before deploying the code.",
            options: {
              a: "carry out",
              b: "bring up",
              c: "take over",
              d: "set up"
            },
            correctOption: "a",
            explanation: "'Carry out' significa realizar, completar o ejecutar un test o investigación de forma programada."
          },
          {
            id: "m4d1_2",
            moduleIndex: 3,
            dayIndex: 0,
            question: "When the previous manager left the company, Lucas decided to _________ the leadership role.",
            options: {
              a: "take up",
              b: "take over",
              c: "carry out",
              d: "bring up"
            },
            correctOption: "b",
            explanation: "'Take over' significa asumir el mando, la responsabilidad o el control de un cargo o empresa en sustitución de otro."
          },
          {
            id: "m4d1_3",
            moduleIndex: 3,
            dayIndex: 0,
            question: "It took the technical support team less than an hour to _________ the new Docker containers on the VPS.",
            options: {
              a: "set up",
              b: "set off",
              c: "take in",
              d: "bring out"
            },
            correctOption: "a",
            explanation: "'Set up' es el phrasal verb para configurar, armar o instalar un sistema de software o negocio para que esté operativo."
          },
          {
            id: "m4d1_4",
            moduleIndex: 3,
            dayIndex: 0,
            question: "I didn't want to _________ the budget issues during the panel presentation, but the director asked directly.",
            options: {
              a: "carry out",
              b: "bring up",
              c: "take over",
              d: "look forward to"
            },
            correctOption: "b",
            explanation: "'Bring up' significa mencionar o sacar a colación un asunto específico para que sea discutido en una reunión."
          },
          {
            id: "m4d1_5",
            moduleIndex: 3,
            dayIndex: 0,
            question: "All the students in the B2 preparation course are looking forward to _________ their final certificates.",
            options: {
              a: "receive",
              b: "receiving",
              c: "received",
              d: "be receiving"
            },
            correctOption: "b",
            explanation: "Tras la locución fija 'look forward to', la partícula 'to' rige obligatoriamente gerundio en -ing ('receiving')."
          }
        ]
      },
      {
        title: "Día 2: Phrasal Verbs Esenciales para B2 (Parte 2)",
        focus: "Phrasal Verbs de resolución de incidentes, desenlace de eventos y relaciones (put off, end up, turn out, get along, break down).",
        cheatSheet: [
          "Put off: Posponer o retrasar la fecha de un evento.",
          "End up: Acabar o resultar en una situación que no estaba planeada, seguido típicamente de -ing.",
          "Turn out: Resultar ser un desenlace (turn out to be much easier).",
          "Get along/on with: Llevarse bien, tener buena sintonía en un equipo.",
          "Break down: Averiar, colapsar, o desglosar información compleja."
        ],
        practiceQuestions: [
          {
            id: "m4d2_1",
            moduleIndex: 3,
            dayIndex: 1,
            question: "Because several team members were sick, the management decided to _________ the evaluation meeting until next Tuesday.",
            options: {
              a: "put off",
              b: "end up",
              c: "turn out",
              d: "break down"
            },
            correctOption: "a",
            explanation: "'Put off' significa posponer o aplazar un acontecimiento temporalmente."
          },
          {
            id: "m4d2_2",
            moduleIndex: 3,
            dayIndex: 1,
            question: "We didn't plan to change the server architecture, but we _________ reconfiguring everything from scratch.",
            options: {
              a: "broke down",
              b: "turned out",
              c: "ended up",
              d: "put off"
            },
            correctOption: "c",
            explanation: "'Ended up' expresa un desenlace o situación final imprevista, y va seguido de gerundio ('reconfiguring')."
          },
          {
            id: "m4d2_3",
            moduleIndex: 3,
            dayIndex: 1,
            question: "Despite their completely different coaching styles, the two basketball trainers managed to _________ very well.",
            options: {
              a: "get along",
              b: "turn out",
              c: "put off",
              d: "break down"
            },
            correctOption: "a",
            explanation: "'Get along' significa mantener una buena sintonía y relación interpersonal de cooperación."
          },
          {
            id: "m4d2_4",
            moduleIndex: 3,
            dayIndex: 1,
            question: "The presentation to the steering committee _________ to be much easier than I had originally anticipated.",
            options: {
              a: "ended up",
              b: "turned out",
              c: "carried out",
              d: "set up"
            },
            correctOption: "b",
            explanation: "'Turned out' se utiliza para indicar el desenlace final con la estructura 'turned out + to be'."
          },
          {
            id: "m4d2_5",
            moduleIndex: 3,
            dayIndex: 1,
            question: "If the automated backup system happens to _________, the administrator receives an instant notification.",
            options: {
              a: "break down",
              b: "put off",
              c: "take over",
              d: "bring up"
            },
            correctOption: "a",
            explanation: "'Break down' indica que un mecanismo, vehículo o servidor sufre una avería o deja de funcionar repentinamente."
          }
        ]
      },
      {
        title: "Día 3: Collocations y Preposiciones Dependientes",
        focus: "Aprender los acoplamientos fijos de adjetivos, verbos y preposiciones, y discernir entre Make y Do.",
        cheatSheet: [
          "Adjetivos + Prep: Interested IN, Good/Bad/Skilled AT (nunca in), Keen ON, Responsible FOR, Proud OF.",
          "Verbos + Prep: Depend ON (❌ prohibido depend of), Succeed IN (+ -ing), Apologize FOR.",
          "Make (crear/decidir/crear resultados): make a decision, make a mistake, make progress, make an effort.",
          "Do (ejecutar tareas rutinarias o deberes): do homework, do research, do a job, do exercise."
        ],
        practiceQuestions: [
          {
            id: "m4d3_1",
            moduleIndex: 3,
            dayIndex: 2,
            question: "As the newly promoted Project Lead, David is strictly responsible _________ the deployment of the services.",
            options: {
              a: "of",
              b: "for",
              c: "about",
              d: "with"
            },
            correctOption: "b",
            explanation: "El adjetivo 'responsible' rige de forma exclusiva la preposición dependiente 'for'."
          },
          {
            id: "m4d3_2",
            moduleIndex: 3,
            dayIndex: 2,
            question: "Whether we advance Martín to the senior basketball team depends entirely _________ his performance this week.",
            options: {
              a: "of",
              b: "on",
              c: "in",
              d: "for"
            },
            correctOption: "b",
            explanation: "El verbo 'depend' rige de forma exclusiva la preposición dependiente 'on' (o 'upon'). Nunca uses 'of'."
          },
          {
            id: "m4d3_3",
            moduleIndex: 3,
            dayIndex: 2,
            question: "The network engineer finally succeeded _________ configuring the Nginx Proxy Manager securely.",
            options: {
              a: "in",
              b: "at",
              c: "on",
              d: "to"
            },
            correctOption: "a",
            explanation: "El verbo 'succeed' exige la preposición dependiente 'in' seguida de un gerundio."
          },
          {
            id: "m4d3_4",
            moduleIndex: 3,
            dayIndex: 2,
            question: "Don't worry if you _________ a mistake during the Z80 assembly code test; it's part of the learning process.",
            options: {
              a: "do",
              b: "make",
              c: "perform",
              d: "execute"
            },
            correctOption: "b",
            explanation: "La combinación léxica fija (collocation) correcta para errores es 'make a mistake'. No se usa 'do'."
          },
          {
            id: "m4d3_5",
            moduleIndex: 3,
            dayIndex: 2,
            question: "My son has to _________ a lot of research for his 2º ESO school project on renewable energy sources.",
            options: {
              a: "make",
              b: "do",
              c: "write",
              d: "create"
            },
            correctOption: "b",
            explanation: "Con el sustantivo 'research' se utiliza de forma invariable el verbo de ejecución 'do' ('do research')."
          }
        ]
      },
      {
        title: "Día 4: Palabras Confusas (Confusing Words) y Expresiones",
        focus: "Evitar errores causados por traducción literal en campos semánticos solapados (job vs work, travel vs trip vs journey, sensible vs sensitive).",
        cheatSheet: [
          "Job (Sustantivo Contable): Puesto de trabajo, profesión (admite 'a job' o 'jobs').",
          "Work (Incontable): Actividad laboral general o lugar físico de empleo (nunca lleva 'a' ni 'works').",
          "Trip: Viaje físico corto de ida y vuelta con un fin concreto. (business trip).",
          "Journey: El trayecto, desplazamiento físico u horas de camino desde A hasta B.",
          "Sensible: Alguien sensato, racional, prudente y con sentido común.",
          "Sensitive: Alguien sensible, emocional, delicado, o susceptible."
        ],
        practiceQuestions: [
          {
            id: "m4d4_1",
            moduleIndex: 3,
            dayIndex: 3,
            question: "I am currently looking for a new _________ in the project management sector in Madrid.",
            options: {
              a: "work",
              b: "job",
              c: "career path",
              d: "occupation"
            },
            correctOption: "b",
            explanation: "El artículo indefinido 'a' delata que necesitamos un sustantivo contable singular, lo que descarta 'work' y exige 'job'."
          },
          {
            id: "m4d4_2",
            moduleIndex: 3,
            dayIndex: 3,
            question: "The team had to go on a three-day business _________ to Munich to meet the core infrastructure directors.",
            options: {
              a: "travel",
              b: "journey",
              c: "trip",
              d: "voyage"
            },
            correctOption: "c",
            explanation: "Se trata de un viaje corto concreto de ida y vuelta. La combinación fija es 'business trip'."
          },
          {
            id: "m4d4_3",
            moduleIndex: 3,
            dayIndex: 3,
            question: "A _________ project manager always analyzes the server logs carefully before making a major infrastructure decision.",
            options: {
              a: "sensitive",
              b: "sensible",
              c: "sensational",
              d: "sensing"
            },
            correctOption: "b",
            explanation: "Buscamos un adjetivo que signifique 'sensato/juicioso' (que actúa con prudencia lógica), es decir, 'sensible'."
          },
          {
            id: "m4d4_4",
            moduleIndex: 3,
            dayIndex: 3,
            question: "\"How long is your daily _________ to the facility office?\" - \"It takes about forty minutes by train.\"",
            options: {
              a: "travel",
              b: "journey",
              c: "trip",
              d: "flight"
            },
            correctOption: "b",
            explanation: "Se refiere al trayecto o desplazamiento físico de ir de un punto a otro a diario, exigiendo el sustantivo 'journey'."
          },
          {
            id: "m4d4_5",
            moduleIndex: 3,
            dayIndex: 3,
            question: "I cannot accept any more tasks today because I have too much _________ left on my desk.",
            options: {
              a: "job",
              b: "work",
              c: "works",
              d: "assignments"
            },
            correctOption: "b",
            explanation: "El cuantificador de exceso incontable 'too much' requiere el uso del sustantivo incontable 'work'."
          }
        ]
      },
      {
        title: "Día 5: Simulacro Técnico y Gestión del Tiempo",
        focus: "Integrar técnicas de descarte veloz en el entorno sintáctico del hueco del test para maximizar la puntuación.",
        cheatSheet: [
          "Matriz de Inspección Sintáctica del examen:",
          "1. [Hueco] + -ing: Busca 'keen on', 'succeed in', 'ended up'.",
          "2. [Hueco] + to: Busca 'turned out', 'used to', 'in order'.",
          "3. [Artículo A] + [Hueco]: Descarta incontables como 'work' o 'research'.",
          "Regla de oro de gestión: Si te atascas, marca una provisional por instinto, pon un marcador y avanza. Máximo 45s por pregunta."
        ],
        practiceQuestions: [
          {
            id: "m4d5_1",
            moduleIndex: 3,
            dayIndex: 4,
            question: "The basketball players were very keen _________ starting the intensive summer training module.",
            options: {
              a: "in",
              b: "at",
              c: "on",
              d: "for"
            },
            correctOption: "c",
            explanation: "El adjetivo 'keen' rige de forma fija la preposición dependiente 'on' ('keen on') para expresar entusiasmo."
          },
          {
            id: "m4d5_2",
            moduleIndex: 3,
            dayIndex: 4,
            question: "We had to _________ off the system migration because the automated script contained structural errors.",
            options: {
              a: "put",
              b: "call",
              c: "take",
              d: "set"
            },
            correctOption: "b",
            explanation: "'Call off' es el phrasal verb para cancelar por completo una actividad programada, a diferencia de 'put off' que es solo posponerla."
          },
          {
            id: "m4d5_3",
            moduleIndex: 3,
            dayIndex: 4,
            question: "The new project schedule turned _________ to be far tighter than the team had expected.",
            options: {
              a: "up",
              b: "out",
              c: "down",
              d: "off"
            },
            correctOption: "b",
            explanation: "La estructura de desenlace 'turn out to be' exige colocar la partícula 'out' en pasado ('turned out')."
          },
          {
            id: "m4d5_4",
            moduleIndex: 3,
            dayIndex: 4,
            question: "Making a good _________ during the presentation is crucial for securing corporate funding.",
            options: {
              a: "impression",
              b: "effect",
              c: "impact",
              d: "performance"
            },
            correctOption: "a",
            explanation: "La combinación de vocabulario exacta (collocation) para causar una buena opinión es 'make an impression'."
          },
          {
            id: "m4d5_5",
            moduleIndex: 3,
            dayIndex: 4,
            question: "I am not very good _________ writing long theoretical paragraphs under strict exam time limits.",
            options: {
              a: "in",
              b: "at",
              c: "for",
              d: "with"
            },
            correctOption: "b",
            explanation: "El adjetivo 'good' (al igual que bad/skilled) rige la preposición 'at' para expresar destreza en una habilidad."
          }
        ]
      }
    ],
    resources: [
      {
        id: "r4_1",
        name: "Vocabulario Cambridge B2 y Phrasal Verbs.pdf",
        description: "PDF descargable con un listado completo de los phrasal verbs, falsos amigos y dependent prepositions más preguntados en Use of English.",
        fileSize: "2.1 MB",
        type: "pdf",
        content: "LÉXICO Y ESTRATEGIA B2 FIRST\n\n1. Phrasal Verbs Profesionales\n- Carry out: Ejecutar.\n- Take over: Relevar/Asumir control.\n- Set up: Fundar/Instalar.\n- Bring up: Mencionar tema.\n- Put off: Aplazar.\n- End up + -ing: Acabar en.\n- Turn out: Resultar ser.\n- Break down: Averiarse.\n\n2. Collocations\n- Make: decision, mistake, progress, effort.\n- Do: homework, research, business.\n\n3. Preposiciones Dependientes\n- depend on, succeed in, responsible for, proud of, good at."
      }
    ],
    podcastEpisodes: [
      {
        id: "p4_1",
        audioStoragePath: "Cómo_esquivar_las_trampas_del_examen_B2.m4a",
        title: "Episodio 5: Phrasal Verbs, Falsos Amigos y Descarte Veloz",
        duration: "3:48",
        description: "Consejos clave para resolver la sección léxica del test mediante dependent prepositions sin perder tiempo.",
        transcript: [
          { speaker: "Profesor", text: "¡Hola! Bienvenidos al episodio final de nuestro podcast de B2 English Prep." },
          { speaker: "Estudiante", text: "Hoy hablamos del temido vocabulario." },
          { speaker: "Profesor", text: "Así es. En B2, las preguntas de vocabulario se solucionan en un ochenta por ciento por las prepositions colindantes. Aprende a emparejar adjetivos como 'keen' con 'on' o 'responsible' con 'for', y ganarás valiosos minutos de examen." }
        ]
      }
    ],
    controlExam: [
      {
        id: "m4c_1",
        moduleIndex: 3,
        question: "The development team successfully _________ out the migration of the Docker environment without any downtime.",
        options: {
          a: "took",
          b: "carried",
          c: "brought",
          d: "set"
        },
        correctOption: "b",
        explanation: "El phrasal verb para indicar la realización o ejecución exitosa de un proceso es 'carry out' (en pasado 'carried out')."
      },
      {
        id: "m4c_2",
        moduleIndex: 3,
        question: "The presentation was going well until one director suddenly _________ up the unapproved budget costs.",
        options: {
          a: "took",
          b: "carried",
          c: "brought",
          d: "put"
        },
        correctOption: "c",
        explanation: "'Bring up' (en pasado 'brought up') significa sacar a colación o mencionar un asunto conflictivo para debatir."
      },
      {
        id: "m4c_3",
        moduleIndex: 3,
        question: "It is highly recommended to _________ a secure password manager to prevent credential theft.",
        options: {
          a: "set up",
          b: "take over",
          c: "break down",
          d: "put off"
        },
        correctOption: "a",
        explanation: "'Set up' significa configurar, instalar o parametrizar una herramienta digital para empezar a usarla."
      },
      {
        id: "m4c_4",
        moduleIndex: 3,
        question: "If the server architecture continues to fail, we will end _________ losing our most important client.",
        options: {
          a: "up",
          b: "out",
          c: "off",
          d: "down"
        },
        correctOption: "a",
        explanation: "El phrasal verb 'end up' va seguido de gerundio ('losing') para expresar una consecuencia final no planeada."
      },
      {
        id: "m4c_5",
        moduleIndex: 3,
        question: "Despite some initial friction, Martín quickly got _________ with his new teammates at the basketball club.",
        options: {
          a: "along",
          b: "up",
          c: "over",
          d: "out"
        },
        correctOption: "a",
        explanation: "El phrasal verb completo 'get along with' significa mantener buenas relaciones interpersonales de compañerismo."
      }
    ]
  }
];

export function getFullCombinedBank(): Question[] {
  const bank: Question[] = [];
  
  DEFAULT_B2_DATA.forEach(module => {
    // Add day practice questions
    module.days.forEach(day => {
      bank.push(...day.practiceQuestions);
    });
    // Add control exam questions
    bank.push(...module.controlExam);
  });

  return bank;
}
