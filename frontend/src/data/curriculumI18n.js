/**
 * EulerSpace Academy - Curriculum Translations
 * Portuguese (Brazilian) and Spanish (Latin American)
 *
 * Structure:
 *   { [lang]: { [pathId]: { title, description, lessons: { [lessonId]: { title, theory, practice } } } } }
 *
 * theory[]: { content } for text/heading, or null to keep original (latex)
 * practice[]: { question, answer, hint }
 */

export const curriculumTranslations = {
  // ---------------------------------------------------------------------------
  // PORTUGUESE (BRAZILIAN)
  // ---------------------------------------------------------------------------
  pt: {
    // =========================================================================
    // MATH CURRICULUM
    // =========================================================================

    // ---- math-fundamentals ---------------------------------------------------
    'math-fundamentals': {
      title: 'Fundamentos',
      description: 'Construa uma base solida em matematica',
      lessons: {
        'numbers-operations': {
          title: 'Numeros e Operacoes',
          theory: [
            { content: 'A matematica comeca com os numeros. Os conjuntos numericos formam uma hierarquia:' },
            null, // latex
            { content: 'Numeros naturais (N): 1, 2, 3, ... usados para contagem.' },
            { content: 'Numeros inteiros (Z): ..., -2, -1, 0, 1, 2, ... incluem os negativos.' },
            { content: 'Racionais (Q): fracoes p/q onde p, q sao inteiros.' },
            { content: 'Reais (R): todos os pontos da reta numerica, incluindo irracionais como:' },
            null, // latex
            { content: 'Ordem das Operacoes (PEMDAS)' },
            { content: 'Parenteses, Expoentes, Multiplicacao/Divisao, Adicao/Subtracao:' },
            null, // latex
          ],
          practice: [
            { question: 'Simplifique: 3 + 4 \\times 2 - 1', answer: '10', hint: 'Multiplique primeiro, depois some/subtraia' },
            { question: 'Simplifique: (5 + 3) \\times 2^2', answer: '32', hint: 'Parenteses primeiro, depois expoente, depois multiplique' },
            { question: '\\sqrt{4} e racional ou irracional?', answer: 'Racional (= 2)', hint: 'Calcule a raiz quadrada' },
          ],
        },
        'algebra-basics': {
          title: 'Fundamentos de Algebra',
          theory: [
            { content: 'A algebra usa variaveis (letras) para representar quantidades desconhecidas.' },
            { content: 'Resolvendo Equacoes Lineares' },
            { content: 'Objetivo: isolar a variavel em um dos lados.' },
            null, // latex
            null, // latex
            null, // latex
            { content: 'Propriedades Importantes' },
            null, // latex (Distributive)
            null, // latex (Perfect Square)
            null, // latex (Difference of Squares)
          ],
          practice: [
            { question: 'Resolva: 3x - 7 = 14', answer: 'x = 7', hint: 'Some 7 em ambos os lados, depois divida por 3' },
            { question: 'Expanda: (x + 3)^2', answer: 'x^2 + 6x + 9', hint: 'Use (a+b)^2 = a^2 + 2ab + b^2' },
            { question: 'Fatore: x^2 - 16', answer: '(x+4)(x-4)', hint: 'Diferenca de quadrados: a^2 - b^2' },
          ],
        },
        'quadratic-equations': {
          title: 'Equacoes Quadraticas',
          theory: [
            { content: 'Uma equacao quadratica tem a forma geral:' },
            null, // latex
            { content: 'A Formula Quadratica (Formula de Bhaskara)' },
            null, // latex
            { content: 'O Discriminante' },
            null, // latex
            { content: 'Se Delta > 0: duas raizes reais. Se Delta = 0: uma raiz repetida. Se Delta < 0: sem raizes reais (raizes complexas).' },
            { content: 'Exemplo' },
            null, // latex
            null, // latex
            null, // latex
          ],
          practice: [
            { question: 'Resolva: x^2 - 4x + 3 = 0', answer: 'x = 1 ou x = 3', hint: 'Fatore ou use a formula quadratica' },
            { question: 'Qual e o discriminante de x^2 + 2x + 5 = 0?', answer: '-16', hint: 'Delta = b^2 - 4ac = 4 - 20' },
            { question: 'Resolva: 2x^2 - 8 = 0', answer: 'x = 2 ou x = -2', hint: 'Isole x^2 primeiro' },
          ],
        },
        'functions-intro': {
          title: 'Introducao a Funcoes',
          theory: [
            { content: 'Uma funcao associa cada entrada a exatamente uma saida:' },
            null, // latex
            { content: 'Funcoes Comuns' },
            null, // latex (Linear)
            null, // latex (Quadratic)
            null, // latex (Exponential)
            null, // latex (Logarithmic)
            { content: 'Dominio e Imagem' },
            { content: 'Dominio: todas as entradas validas. Imagem: todas as saidas possiveis.' },
            null, // latex
          ],
          practice: [
            { question: 'Se f(x) = 2x + 1, encontre f(3)', answer: '7', hint: 'Substitua x = 3' },
            { question: 'Qual e o dominio de f(x) = \\frac{1}{x-2}?', answer: 'x != 2 (todos os reais exceto 2)', hint: 'O denominador nao pode ser zero' },
            { question: 'Se f(x) = x^2, qual e f(-3)?', answer: '9', hint: 'O quadrado de um negativo e positivo' },
          ],
        },
      },
    },

    // ---- math-intermediate ---------------------------------------------------
    'math-intermediate': {
      title: 'Matematica Intermediaria',
      description: 'Trigonometria, sequencias e pre-calculo',
      lessons: {
        'trigonometry': {
          title: 'Trigonometria',
          theory: [
            { content: 'As funcoes trigonometricas relacionam angulos com razoes de lados em um triangulo retangulo.' },
            null, // latex
            { content: 'Circulo Unitario' },
            { content: 'No circulo unitario (raio = 1), para o angulo teta:' },
            null, // latex
            { content: 'Identidade Fundamental' },
            null, // latex
            { content: 'Valores Importantes' },
            null, // latex
          ],
          practice: [
            { question: 'Qual e \\cos(60°)?', answer: '1/2', hint: 'Lembre-se dos valores do circulo unitario' },
            { question: 'Se \\sin\\theta = 3/5, encontre \\cos\\theta', answer: '4/5', hint: 'Use sen^2 + cos^2 = 1' },
            { question: 'Simplifique: \\sin^2(x) + \\cos^2(x)', answer: '1', hint: 'Identidade pitagorica' },
          ],
        },
        'sequences-series': {
          title: 'Sequencias e Series',
          theory: [
            { content: 'Sequencia Aritmetica' },
            null, // latex
            null, // latex
            { content: 'Sequencia Geometrica' },
            null, // latex
            null, // latex
            { content: 'Serie Geometrica Infinita' },
            { content: 'Converge quando |r| < 1:' },
            null, // latex
          ],
          practice: [
            { question: 'Encontre o 10o termo: 2, 5, 8, 11, ...', answer: '29', hint: 'a_1 = 2, d = 3, use a_n = a_1 + (n-1)d' },
            { question: 'Soma dos 5 primeiros termos: 3, 6, 12, 24, ...', answer: '93', hint: 'Geometrica com r=2, use a formula da soma' },
            { question: 'Soma ate o infinito: 1 + 1/2 + 1/4 + 1/8 + ...', answer: '2', hint: 'a_1=1, r=1/2, use S = a/(1-r)' },
          ],
        },
        'limits-intro': {
          title: 'Introducao a Limites',
          theory: [
            { content: 'Um limite descreve a que valor uma funcao se aproxima:' },
            null, // latex
            { content: 'significa que f(x) se aproxima arbitrariamente de L conforme x se aproxima de a.' },
            { content: 'Limites Importantes' },
            null, // latex
            null, // latex
            null, // latex
            { content: 'Propriedades dos Limites' },
            null, // latex
            null, // latex
          ],
          practice: [
            { question: '\\lim_{x \\to 2} (x^2 + 1)', answer: '5', hint: 'Substituicao direta: 4 + 1' },
            { question: '\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}', answer: '3', hint: 'Reescreva como 3 * sen(3x)/(3x)' },
            { question: '\\lim_{x \\to \\infty} \\frac{2x+1}{x+3}', answer: '2', hint: 'Divida numerador e denominador por x' },
          ],
        },
      },
    },

    // ---- math-calculus -------------------------------------------------------
    'math-calculus': {
      title: 'Calculo',
      description: 'Derivadas, integrais e equacoes diferenciais',
      lessons: {
        'derivatives': {
          title: 'Derivadas',
          theory: [
            { content: 'A derivada mede a taxa de variacao instantanea:' },
            null, // latex
            { content: 'Regras Basicas' },
            null, // latex (Power Rule)
            null, // latex
            null, // latex
            { content: 'Regra da Cadeia' },
            null, // latex
            { content: 'Regras do Produto e do Quociente' },
            null, // latex
            null, // latex
          ],
          practice: [
            { question: '\\frac{d}{dx}[x^4 + 3x^2]', answer: '4x^3 + 6x', hint: 'Aplique a regra da potencia em cada termo' },
            { question: '\\frac{d}{dx}[\\sin(2x)]', answer: '2\\cos(2x)', hint: 'Regra da cadeia: cos(2x) * 2' },
            { question: '\\frac{d}{dx}[x \\cdot e^x]', answer: 'e^x + xe^x = (1+x)e^x', hint: 'Regra do produto: f\'g + fg\'' },
          ],
        },
        'integrals': {
          title: 'Integrais',
          theory: [
            { content: 'A integracao e o inverso da diferenciacao:' },
            null, // latex
            { content: 'Integrais Basicas' },
            null, // latex
            null, // latex
            null, // latex
            { content: 'Teorema Fundamental do Calculo' },
            null, // latex
            { content: 'Substituicao (u-sub)' },
            null, // latex
          ],
          practice: [
            { question: '\\int (3x^2 + 2x)\\,dx', answer: 'x^3 + x^2 + C', hint: 'Regra da potencia para cada termo' },
            { question: '\\int_0^1 x^2\\,dx', answer: '1/3', hint: 'Avalie x^3/3 de 0 a 1' },
            { question: '\\int \\cos(2x)\\,dx', answer: '\\sin(2x)/2 + C', hint: 'Substituicao: u = 2x' },
          ],
        },
        'diff-equations': {
          title: 'Equacoes Diferenciais',
          theory: [
            { content: 'Uma equacao diferencial envolve derivadas de uma funcao desconhecida.' },
            { content: 'Equacoes Separaveis' },
            null, // latex
            { content: 'Linear de Primeira Ordem' },
            null, // latex
            { content: 'Resolvida usando fator integrante:' },
            null, // latex
            { content: 'Exemplo: Crescimento Exponencial' },
            null, // latex
            { content: 'Segunda Ordem com Coeficientes Constantes' },
            null, // latex
            { content: 'Equacao caracteristica: ar^2 + br + c = 0' },
          ],
          practice: [
            { question: "Resolva: y' = 2y", answer: 'y = Ce^{2x}', hint: 'Separavel: dy/y = 2dx' },
            { question: "Resolva: y' = x", answer: 'y = x^2/2 + C', hint: 'Integre ambos os lados' },
            { question: "Resolva: y'' + y = 0", answer: 'y = A\\cos(x) + B\\sin(x)', hint: 'Eq. caract.: r^2 + 1 = 0, raizes = +/- i' },
          ],
        },
        'multivariable': {
          title: 'Calculo Multivariavel',
          theory: [
            { content: 'Derivadas Parciais' },
            null, // latex
            { content: 'Gradiente' },
            null, // latex
            { content: 'O gradiente aponta na direcao de maior crescimento.' },
            { content: 'Integrais Duplas' },
            null, // latex
            { content: 'Divergencia e Rotacional' },
            null, // latex
          ],
          practice: [
            { question: 'f(x,y) = x^2y + y^3. Encontre \\partial f/\\partial x', answer: '2xy', hint: 'Trate y como constante' },
            { question: 'Encontre o gradiente de f(x,y) = x^2 + xy', answer: '(2x + y, x)', hint: 'Calcule ambas as derivadas parciais' },
            { question: '\\int_0^1 \\int_0^1 xy\\,dx\\,dy', answer: '1/4', hint: 'Integre x primeiro, depois y' },
          ],
        },
      },
    },

    // ---- math-linear-algebra -------------------------------------------------
    'math-linear-algebra': {
      title: 'Algebra Linear',
      description: 'Vetores, matrizes e transformacoes lineares',
      lessons: {
        'vectors': {
          title: 'Vetores e Espacos',
          theory: [
            { content: 'Um vetor e um elemento de um espaco vetorial. Em R^n:' },
            null, // latex
            { content: 'Operacoes' },
            null, // latex
            { content: 'Produto Escalar' },
            null, // latex
            { content: 'Independencia Linear' },
            { content: 'Vetores sao linearmente independentes se a unica solucao para c1*v1 + c2*v2 + ... = 0 e todos ci = 0.' },
          ],
          practice: [
            { question: '(1,2) \\cdot (3,4) = ?', answer: '11', hint: '1*3 + 2*4' },
            { question: '||(3, 4)|| = ?', answer: '5', hint: 'raiz(9 + 16)' },
            { question: '(1,0) e (0,1) sao linearmente independentes?', answer: 'Sim', hint: 'Nenhum e multiplo escalar do outro' },
          ],
        },
        'matrices-deep': {
          title: 'Teoria de Matrizes',
          theory: [
            { content: 'Multiplicacao de Matrizes' },
            null, // latex
            { content: 'Determinante' },
            null, // latex
            { content: 'Autovalores e Autovetores' },
            null, // latex
            { content: 'Encontre os autovalores resolvendo:' },
            null, // latex
            { content: 'Diagonalizacao' },
            null, // latex
          ],
          practice: [
            { question: '\\det\\begin{pmatrix} 2 & 3 \\\\ 1 & 4 \\end{pmatrix}', answer: '5', hint: '2*4 - 3*1' },
            { question: 'Autovalores de \\begin{pmatrix} 2 & 0 \\\\ 0 & 3 \\end{pmatrix}', answer: '2 e 3', hint: 'Matriz diagonal: autovalores sao os elementos da diagonal' },
            { question: '\\begin{pmatrix} 1 & 2 \\\\ 2 & 4 \\end{pmatrix} e invertivel?', answer: 'Nao (det = 0)', hint: 'Calcule o determinante: 1*4 - 2*2' },
          ],
        },
      },
    },

    // =========================================================================
    // PHYSICS CURRICULUM
    // =========================================================================

    // ---- physics-mechanics ---------------------------------------------------
    'physics-mechanics': {
      title: 'Mecanica Classica',
      description: 'Movimento, forcas e energia',
      lessons: {
        'kinematics': {
          title: 'Cinematica',
          theory: [
            { content: 'A cinematica descreve o movimento sem considerar as forcas.' },
            { content: 'Equacoes do Movimento (aceleracao constante)' },
            null, // latex
            null, // latex
            null, // latex
            { content: 'Queda Livre' },
            { content: 'Perto da superficie da Terra, a aceleracao gravitacional:' },
            null, // latex
            { content: 'Movimento de Projetil' },
            null, // latex
            null, // latex
          ],
          practice: [
            { question: 'Um carro acelera do repouso a 2 m/s^2 por 5s. Encontre sua velocidade.', answer: '10 m/s', hint: 'v = v0 + at = 0 + 2(5)' },
            { question: 'Qual distancia ele percorre?', answer: '25 m', hint: 'x = v0*t + (1/2)at^2 = 0 + (1/2)(2)(25)' },
            { question: 'Uma bola e lancada para cima a 20 m/s. Altura maxima?', answer: '~20,4 m', hint: 'v^2 = v0^2 - 2gh, faca v=0' },
          ],
        },
        'newton-laws': {
          title: 'Leis de Newton',
          theory: [
            { content: 'Primeira Lei (Inercia)' },
            { content: 'Um objeto permanece em repouso ou em movimento uniforme, a menos que uma forca resultante atue sobre ele.' },
            { content: 'Segunda Lei' },
            null, // latex
            { content: 'Terceira Lei' },
            { content: 'Toda acao tem uma reacao igual e oposta.' },
            null, // latex
            { content: 'Forcas Comuns' },
            null, // latex (Weight)
            null, // latex (Friction)
            null, // latex (Spring)
          ],
          practice: [
            { question: 'Um objeto de 5 kg acelera a 3 m/s^2. Qual forca resultante atua sobre ele?', answer: '15 N', hint: 'F = ma = 5 * 3' },
            { question: 'Peso de 10 kg na Terra?', answer: '98,1 N', hint: 'P = mg = 10 * 9,81' },
            { question: 'Uma mola (k=200 N/m) e comprimida 0,1m. Forca?', answer: '20 N', hint: 'F = kx = 200 * 0,1' },
          ],
        },
        'energy-work': {
          title: 'Energia e Trabalho',
          theory: [
            { content: 'Trabalho' },
            null, // latex
            { content: 'Energia Cinetica' },
            null, // latex
            { content: 'Energia Potencial' },
            null, // latex (Gravitational)
            null, // latex (Elastic)
            { content: 'Conservacao de Energia' },
            null, // latex
            { content: 'Teorema Trabalho-Energia' },
            null, // latex
          ],
          practice: [
            { question: 'EC de uma bola de 2 kg movendo-se a 3 m/s?', answer: '9 J', hint: 'K = (1/2)(2)(9)' },
            { question: 'Uma bola de 1 kg cai 10m. Velocidade na base?', answer: '~14 m/s', hint: 'mgh = (1/2)mv^2, v = raiz(2gh)' },
            { question: 'Trabalho realizado por uma forca de 50N ao longo de 4m a 60 graus?', answer: '100 J', hint: 'W = Fd cos(60) = 50*4*0,5' },
          ],
        },
      },
    },

    // ---- physics-em ----------------------------------------------------------
    'physics-em': {
      title: 'Eletromagnetismo',
      description: 'Campos eletricos, circuitos e magnetismo',
      lessons: {
        'coulomb-fields': {
          title: 'Cargas e Campos Eletricos',
          theory: [
            { content: 'Lei de Coulomb' },
            null, // latex
            { content: 'Campo Eletrico' },
            null, // latex
            { content: 'Lei de Gauss' },
            null, // latex
            { content: 'Potencial Eletrico' },
            null, // latex
          ],
          practice: [
            { question: 'Forca entre cargas de 1C e 2C a 1m de distancia?', answer: '~1,8 * 10^{10} N', hint: 'F = k*q1*q2/r^2' },
            { question: 'Campo E a 0,5m de uma carga de 1 micro-C?', answer: '~3,6 * 10^4 N/C', hint: 'E = kQ/r^2' },
            { question: 'Potencial a 2m de uma carga de 4 micro-C?', answer: '~1,8 * 10^4 V', hint: 'V = kQ/r' },
          ],
        },
        'circuits': {
          title: 'Circuitos Eletricos',
          theory: [
            { content: 'Lei de Ohm' },
            null, // latex
            { content: 'Potencia' },
            null, // latex
            { content: 'Resistores em Serie' },
            null, // latex
            { content: 'Resistores em Paralelo' },
            null, // latex
            { content: 'Leis de Kirchhoff' },
            { content: 'Regra dos Nos: A soma das correntes que entram e igual a soma das que saem.' },
            { content: 'Regra das Malhas: A soma das variacoes de tensao em qualquer malha fechada e igual a zero.' },
          ],
          practice: [
            { question: 'Corrente em um resistor de 10 ohm com 5V?', answer: '0,5 A', hint: 'I = V/R = 5/10' },
            { question: 'Dois resistores de 6 ohm em paralelo?', answer: '3 ohm', hint: '1/R = 1/6 + 1/6' },
            { question: 'Potencia dissipada por 4A em 3 ohm?', answer: '48 W', hint: 'P = I^2 * R = 16 * 3' },
          ],
        },
      },
    },

    // ---- physics-modern ------------------------------------------------------
    'physics-modern': {
      title: 'Fisica Moderna',
      description: 'Relatividade, mecanica quantica e fisica nuclear',
      lessons: {
        'special-relativity': {
          title: 'Relatividade Especial',
          theory: [
            { content: 'A relatividade especial de Einstein (1905) se baseia em dois postulados: (1) as leis da fisica sao as mesmas em todos os referenciais inerciais; (2) a velocidade da luz c e constante.' },
            { content: 'Fator de Lorentz' },
            null, // latex
            { content: 'Dilatacao Temporal' },
            null, // latex
            { content: 'Contracao do Comprimento' },
            null, // latex
            { content: 'Equivalencia Massa-Energia' },
            null, // latex
            null, // latex
          ],
          practice: [
            { question: 'Fator gama em v = 0,8c?', answer: '5/3 ≈ 1,667', hint: 'gama = 1/raiz(1 - 0,64)' },
            { question: 'Um relogio se move a 0,6c. Se 10s passam em seu referencial, quanto passa no nosso?', answer: '12,5 s', hint: 'gama = 1/raiz(1-0,36) = 1,25' },
            { question: 'Energia de repouso de 1 kg?', answer: '9 * 10^{16} J', hint: 'E = mc^2 = 1 * (3*10^8)^2' },
          ],
        },
        'quantum-intro': {
          title: 'Introducao a Mecanica Quantica',
          theory: [
            { content: 'Dualidade Onda-Particula' },
            null, // latex
            { content: 'Comprimento de Onda de de Broglie' },
            null, // latex
            { content: 'Principio da Incerteza' },
            null, // latex
            { content: 'Equacao de Schrodinger' },
            null, // latex
            { content: 'Forma independente do tempo:' },
            null, // latex
            { content: 'Particula em uma Caixa' },
            null, // latex
          ],
          practice: [
            { question: 'Comprimento de onda de de Broglie de um eletron a 10^6 m/s?', answer: '~7,3 * 10^{-10} m', hint: 'lambda = h/(m_e * v), m_e = 9,1*10^-31 kg' },
            { question: 'Energia do estado fundamental de um eletron em uma caixa de 1nm?', answer: '~6 * 10^{-20} J ≈ 0,38 eV', hint: 'E_1 = pi^2 * hbar^2 / (2mL^2)' },
            { question: 'Se Delta_x = 10^{-10} m, Delta_p minimo?', answer: '~5,3 * 10^{-25} kg*m/s', hint: 'Delta_p >= hbar/(2*Delta_x)' },
          ],
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // SPANISH (LATIN AMERICAN)
  // ---------------------------------------------------------------------------
  es: {
    // =========================================================================
    // MATH CURRICULUM
    // =========================================================================

    // ---- math-fundamentals ---------------------------------------------------
    'math-fundamentals': {
      title: 'Fundamentos',
      description: 'Construye una base solida en matematicas',
      lessons: {
        'numbers-operations': {
          title: 'Numeros y Operaciones',
          theory: [
            { content: 'Las matematicas comienzan con los numeros. Los conjuntos numericos forman una jerarquia:' },
            null, // latex
            { content: 'Numeros naturales (N): 1, 2, 3, ... usados para contar.' },
            { content: 'Numeros enteros (Z): ..., -2, -1, 0, 1, 2, ... incluyen los negativos.' },
            { content: 'Racionales (Q): fracciones p/q donde p, q son enteros.' },
            { content: 'Reales (R): todos los puntos de la recta numerica, incluyendo irracionales como:' },
            null, // latex
            { content: 'Orden de las Operaciones (PEMDAS)' },
            { content: 'Parentesis, Exponentes, Multiplicacion/Division, Suma/Resta:' },
            null, // latex
          ],
          practice: [
            { question: 'Simplifica: 3 + 4 \\times 2 - 1', answer: '10', hint: 'Multiplica primero, luego suma/resta' },
            { question: 'Simplifica: (5 + 3) \\times 2^2', answer: '32', hint: 'Parentesis primero, luego exponente, luego multiplica' },
            { question: '\\sqrt{4} es racional o irracional?', answer: 'Racional (= 2)', hint: 'Calcula la raiz cuadrada' },
          ],
        },
        'algebra-basics': {
          title: 'Fundamentos de Algebra',
          theory: [
            { content: 'El algebra usa variables (letras) para representar cantidades desconocidas.' },
            { content: 'Resolviendo Ecuaciones Lineales' },
            { content: 'Objetivo: aislar la variable en un lado.' },
            null, // latex
            null, // latex
            null, // latex
            { content: 'Propiedades Importantes' },
            null, // latex (Distributive)
            null, // latex (Perfect Square)
            null, // latex (Difference of Squares)
          ],
          practice: [
            { question: 'Resuelve: 3x - 7 = 14', answer: 'x = 7', hint: 'Suma 7 a ambos lados, luego divide entre 3' },
            { question: 'Expande: (x + 3)^2', answer: 'x^2 + 6x + 9', hint: 'Usa (a+b)^2 = a^2 + 2ab + b^2' },
            { question: 'Factoriza: x^2 - 16', answer: '(x+4)(x-4)', hint: 'Diferencia de cuadrados: a^2 - b^2' },
          ],
        },
        'quadratic-equations': {
          title: 'Ecuaciones Cuadraticas',
          theory: [
            { content: 'Una ecuacion cuadratica tiene la forma general:' },
            null, // latex
            { content: 'La Formula Cuadratica' },
            null, // latex
            { content: 'El Discriminante' },
            null, // latex
            { content: 'Si Delta > 0: dos raices reales. Si Delta = 0: una raiz repetida. Si Delta < 0: sin raices reales (raices complejas).' },
            { content: 'Ejemplo' },
            null, // latex
            null, // latex
            null, // latex
          ],
          practice: [
            { question: 'Resuelve: x^2 - 4x + 3 = 0', answer: 'x = 1 o x = 3', hint: 'Factoriza o usa la formula cuadratica' },
            { question: 'Cual es el discriminante de x^2 + 2x + 5 = 0?', answer: '-16', hint: 'Delta = b^2 - 4ac = 4 - 20' },
            { question: 'Resuelve: 2x^2 - 8 = 0', answer: 'x = 2 o x = -2', hint: 'Aisla x^2 primero' },
          ],
        },
        'functions-intro': {
          title: 'Introduccion a las Funciones',
          theory: [
            { content: 'Una funcion asocia cada entrada con exactamente una salida:' },
            null, // latex
            { content: 'Funciones Comunes' },
            null, // latex (Linear)
            null, // latex (Quadratic)
            null, // latex (Exponential)
            null, // latex (Logarithmic)
            { content: 'Dominio y Rango' },
            { content: 'Dominio: todas las entradas validas. Rango: todas las salidas posibles.' },
            null, // latex
          ],
          practice: [
            { question: 'Si f(x) = 2x + 1, encuentra f(3)', answer: '7', hint: 'Sustituye x = 3' },
            { question: 'Cual es el dominio de f(x) = \\frac{1}{x-2}?', answer: 'x != 2 (todos los reales excepto 2)', hint: 'El denominador no puede ser cero' },
            { question: 'Si f(x) = x^2, cual es f(-3)?', answer: '9', hint: 'El cuadrado de un negativo es positivo' },
          ],
        },
      },
    },

    // ---- math-intermediate ---------------------------------------------------
    'math-intermediate': {
      title: 'Matematicas Intermedias',
      description: 'Trigonometria, sucesiones y pre-calculo',
      lessons: {
        'trigonometry': {
          title: 'Trigonometria',
          theory: [
            { content: 'Las funciones trigonometricas relacionan angulos con razones de lados en un triangulo rectangulo.' },
            null, // latex
            { content: 'Circulo Unitario' },
            { content: 'En el circulo unitario (radio = 1), para el angulo theta:' },
            null, // latex
            { content: 'Identidad Fundamental' },
            null, // latex
            { content: 'Valores Importantes' },
            null, // latex
          ],
          practice: [
            { question: 'Cual es \\cos(60°)?', answer: '1/2', hint: 'Recuerda los valores del circulo unitario' },
            { question: 'Si \\sin\\theta = 3/5, encuentra \\cos\\theta', answer: '4/5', hint: 'Usa sen^2 + cos^2 = 1' },
            { question: 'Simplifica: \\sin^2(x) + \\cos^2(x)', answer: '1', hint: 'Identidad pitagorica' },
          ],
        },
        'sequences-series': {
          title: 'Sucesiones y Series',
          theory: [
            { content: 'Sucesion Aritmetica' },
            null, // latex
            null, // latex
            { content: 'Sucesion Geometrica' },
            null, // latex
            null, // latex
            { content: 'Serie Geometrica Infinita' },
            { content: 'Converge cuando |r| < 1:' },
            null, // latex
          ],
          practice: [
            { question: 'Encuentra el 10o termino: 2, 5, 8, 11, ...', answer: '29', hint: 'a_1 = 2, d = 3, usa a_n = a_1 + (n-1)d' },
            { question: 'Suma de los primeros 5 terminos: 3, 6, 12, 24, ...', answer: '93', hint: 'Geometrica con r=2, usa la formula de la suma' },
            { question: 'Suma al infinito: 1 + 1/2 + 1/4 + 1/8 + ...', answer: '2', hint: 'a_1=1, r=1/2, usa S = a/(1-r)' },
          ],
        },
        'limits-intro': {
          title: 'Introduccion a los Limites',
          theory: [
            { content: 'Un limite describe a que valor se aproxima una funcion:' },
            null, // latex
            { content: 'significa que f(x) se acerca arbitrariamente a L conforme x se aproxima a a.' },
            { content: 'Limites Importantes' },
            null, // latex
            null, // latex
            null, // latex
            { content: 'Propiedades de los Limites' },
            null, // latex
            null, // latex
          ],
          practice: [
            { question: '\\lim_{x \\to 2} (x^2 + 1)', answer: '5', hint: 'Sustitucion directa: 4 + 1' },
            { question: '\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}', answer: '3', hint: 'Reescribe como 3 * sen(3x)/(3x)' },
            { question: '\\lim_{x \\to \\infty} \\frac{2x+1}{x+3}', answer: '2', hint: 'Divide numerador y denominador entre x' },
          ],
        },
      },
    },

    // ---- math-calculus -------------------------------------------------------
    'math-calculus': {
      title: 'Calculo',
      description: 'Derivadas, integrales y ecuaciones diferenciales',
      lessons: {
        'derivatives': {
          title: 'Derivadas',
          theory: [
            { content: 'La derivada mide la tasa de cambio instantanea:' },
            null, // latex
            { content: 'Reglas Basicas' },
            null, // latex (Power Rule)
            null, // latex
            null, // latex
            { content: 'Regla de la Cadena' },
            null, // latex
            { content: 'Reglas del Producto y del Cociente' },
            null, // latex
            null, // latex
          ],
          practice: [
            { question: '\\frac{d}{dx}[x^4 + 3x^2]', answer: '4x^3 + 6x', hint: 'Aplica la regla de la potencia a cada termino' },
            { question: '\\frac{d}{dx}[\\sin(2x)]', answer: '2\\cos(2x)', hint: 'Regla de la cadena: cos(2x) * 2' },
            { question: '\\frac{d}{dx}[x \\cdot e^x]', answer: 'e^x + xe^x = (1+x)e^x', hint: 'Regla del producto: f\'g + fg\'' },
          ],
        },
        'integrals': {
          title: 'Integrales',
          theory: [
            { content: 'La integracion es el inverso de la diferenciacion:' },
            null, // latex
            { content: 'Integrales Basicas' },
            null, // latex
            null, // latex
            null, // latex
            { content: 'Teorema Fundamental del Calculo' },
            null, // latex
            { content: 'Sustitucion (u-sub)' },
            null, // latex
          ],
          practice: [
            { question: '\\int (3x^2 + 2x)\\,dx', answer: 'x^3 + x^2 + C', hint: 'Regla de la potencia para cada termino' },
            { question: '\\int_0^1 x^2\\,dx', answer: '1/3', hint: 'Evalua x^3/3 de 0 a 1' },
            { question: '\\int \\cos(2x)\\,dx', answer: '\\sin(2x)/2 + C', hint: 'Sustitucion: u = 2x' },
          ],
        },
        'diff-equations': {
          title: 'Ecuaciones Diferenciales',
          theory: [
            { content: 'Una ecuacion diferencial involucra derivadas de una funcion desconocida.' },
            { content: 'Ecuaciones Separables' },
            null, // latex
            { content: 'Lineal de Primer Orden' },
            null, // latex
            { content: 'Se resuelve usando factor integrante:' },
            null, // latex
            { content: 'Ejemplo: Crecimiento Exponencial' },
            null, // latex
            { content: 'Segundo Orden con Coeficientes Constantes' },
            null, // latex
            { content: 'Ecuacion caracteristica: ar^2 + br + c = 0' },
          ],
          practice: [
            { question: "Resuelve: y' = 2y", answer: 'y = Ce^{2x}', hint: 'Separable: dy/y = 2dx' },
            { question: "Resuelve: y' = x", answer: 'y = x^2/2 + C', hint: 'Integra ambos lados' },
            { question: "Resuelve: y'' + y = 0", answer: 'y = A\\cos(x) + B\\sin(x)', hint: 'Ec. caract.: r^2 + 1 = 0, raices = +/- i' },
          ],
        },
        'multivariable': {
          title: 'Calculo Multivariable',
          theory: [
            { content: 'Derivadas Parciales' },
            null, // latex
            { content: 'Gradiente' },
            null, // latex
            { content: 'El gradiente apunta en la direccion de mayor crecimiento.' },
            { content: 'Integrales Dobles' },
            null, // latex
            { content: 'Divergencia y Rotacional' },
            null, // latex
          ],
          practice: [
            { question: 'f(x,y) = x^2y + y^3. Encuentra \\partial f/\\partial x', answer: '2xy', hint: 'Trata y como constante' },
            { question: 'Encuentra el gradiente de f(x,y) = x^2 + xy', answer: '(2x + y, x)', hint: 'Calcula ambas derivadas parciales' },
            { question: '\\int_0^1 \\int_0^1 xy\\,dx\\,dy', answer: '1/4', hint: 'Integra x primero, luego y' },
          ],
        },
      },
    },

    // ---- math-linear-algebra -------------------------------------------------
    'math-linear-algebra': {
      title: 'Algebra Lineal',
      description: 'Vectores, matrices y transformaciones lineales',
      lessons: {
        'vectors': {
          title: 'Vectores y Espacios',
          theory: [
            { content: 'Un vector es un elemento de un espacio vectorial. En R^n:' },
            null, // latex
            { content: 'Operaciones' },
            null, // latex
            { content: 'Producto Escalar' },
            null, // latex
            { content: 'Independencia Lineal' },
            { content: 'Los vectores son linealmente independientes si la unica solucion para c1*v1 + c2*v2 + ... = 0 es que todos los ci = 0.' },
          ],
          practice: [
            { question: '(1,2) \\cdot (3,4) = ?', answer: '11', hint: '1*3 + 2*4' },
            { question: '||(3, 4)|| = ?', answer: '5', hint: 'raiz(9 + 16)' },
            { question: '(1,0) y (0,1) son linealmente independientes?', answer: 'Si', hint: 'Ninguno es multiplo escalar del otro' },
          ],
        },
        'matrices-deep': {
          title: 'Teoria de Matrices',
          theory: [
            { content: 'Multiplicacion de Matrices' },
            null, // latex
            { content: 'Determinante' },
            null, // latex
            { content: 'Valores Propios y Vectores Propios' },
            null, // latex
            { content: 'Encuentra los valores propios resolviendo:' },
            null, // latex
            { content: 'Diagonalizacion' },
            null, // latex
          ],
          practice: [
            { question: '\\det\\begin{pmatrix} 2 & 3 \\\\ 1 & 4 \\end{pmatrix}', answer: '5', hint: '2*4 - 3*1' },
            { question: 'Valores propios de \\begin{pmatrix} 2 & 0 \\\\ 0 & 3 \\end{pmatrix}', answer: '2 y 3', hint: 'Matriz diagonal: los valores propios son los elementos de la diagonal' },
            { question: '\\begin{pmatrix} 1 & 2 \\\\ 2 & 4 \\end{pmatrix} es invertible?', answer: 'No (det = 0)', hint: 'Calcula el determinante: 1*4 - 2*2' },
          ],
        },
      },
    },

    // =========================================================================
    // PHYSICS CURRICULUM
    // =========================================================================

    // ---- physics-mechanics ---------------------------------------------------
    'physics-mechanics': {
      title: 'Mecanica Clasica',
      description: 'Movimiento, fuerzas y energia',
      lessons: {
        'kinematics': {
          title: 'Cinematica',
          theory: [
            { content: 'La cinematica describe el movimiento sin considerar las fuerzas.' },
            { content: 'Ecuaciones del Movimiento (aceleracion constante)' },
            null, // latex
            null, // latex
            null, // latex
            { content: 'Caida Libre' },
            { content: 'Cerca de la superficie de la Tierra, la aceleracion gravitacional:' },
            null, // latex
            { content: 'Movimiento de Proyectil' },
            null, // latex
            null, // latex
          ],
          practice: [
            { question: 'Un auto acelera desde el reposo a 2 m/s^2 por 5s. Encuentra su velocidad.', answer: '10 m/s', hint: 'v = v0 + at = 0 + 2(5)' },
            { question: 'Que distancia recorre?', answer: '25 m', hint: 'x = v0*t + (1/2)at^2 = 0 + (1/2)(2)(25)' },
            { question: 'Una pelota se lanza hacia arriba a 20 m/s. Altura maxima?', answer: '~20,4 m', hint: 'v^2 = v0^2 - 2gh, haz v=0' },
          ],
        },
        'newton-laws': {
          title: 'Leyes de Newton',
          theory: [
            { content: 'Primera Ley (Inercia)' },
            { content: 'Un objeto permanece en reposo o en movimiento uniforme a menos que una fuerza neta actue sobre el.' },
            { content: 'Segunda Ley' },
            null, // latex
            { content: 'Tercera Ley' },
            { content: 'Toda accion tiene una reaccion igual y opuesta.' },
            null, // latex
            { content: 'Fuerzas Comunes' },
            null, // latex (Weight)
            null, // latex (Friction)
            null, // latex (Spring)
          ],
          practice: [
            { question: 'Un objeto de 5 kg acelera a 3 m/s^2. Que fuerza neta actua sobre el?', answer: '15 N', hint: 'F = ma = 5 * 3' },
            { question: 'Peso de 10 kg en la Tierra?', answer: '98,1 N', hint: 'P = mg = 10 * 9,81' },
            { question: 'Un resorte (k=200 N/m) se comprime 0,1m. Fuerza?', answer: '20 N', hint: 'F = kx = 200 * 0,1' },
          ],
        },
        'energy-work': {
          title: 'Energia y Trabajo',
          theory: [
            { content: 'Trabajo' },
            null, // latex
            { content: 'Energia Cinetica' },
            null, // latex
            { content: 'Energia Potencial' },
            null, // latex (Gravitational)
            null, // latex (Elastic)
            { content: 'Conservacion de la Energia' },
            null, // latex
            { content: 'Teorema Trabajo-Energia' },
            null, // latex
          ],
          practice: [
            { question: 'EC de una pelota de 2 kg moviéndose a 3 m/s?', answer: '9 J', hint: 'K = (1/2)(2)(9)' },
            { question: 'Una pelota de 1 kg cae 10m. Velocidad en la base?', answer: '~14 m/s', hint: 'mgh = (1/2)mv^2, v = raiz(2gh)' },
            { question: 'Trabajo realizado por una fuerza de 50N a lo largo de 4m a 60 grados?', answer: '100 J', hint: 'W = Fd cos(60) = 50*4*0,5' },
          ],
        },
      },
    },

    // ---- physics-em ----------------------------------------------------------
    'physics-em': {
      title: 'Electromagnetismo',
      description: 'Campos electricos, circuitos y magnetismo',
      lessons: {
        'coulomb-fields': {
          title: 'Cargas y Campos Electricos',
          theory: [
            { content: 'Ley de Coulomb' },
            null, // latex
            { content: 'Campo Electrico' },
            null, // latex
            { content: 'Ley de Gauss' },
            null, // latex
            { content: 'Potencial Electrico' },
            null, // latex
          ],
          practice: [
            { question: 'Fuerza entre cargas de 1C y 2C a 1m de distancia?', answer: '~1,8 * 10^{10} N', hint: 'F = k*q1*q2/r^2' },
            { question: 'Campo E a 0,5m de una carga de 1 micro-C?', answer: '~3,6 * 10^4 N/C', hint: 'E = kQ/r^2' },
            { question: 'Potencial a 2m de una carga de 4 micro-C?', answer: '~1,8 * 10^4 V', hint: 'V = kQ/r' },
          ],
        },
        'circuits': {
          title: 'Circuitos Electricos',
          theory: [
            { content: 'Ley de Ohm' },
            null, // latex
            { content: 'Potencia' },
            null, // latex
            { content: 'Resistores en Serie' },
            null, // latex
            { content: 'Resistores en Paralelo' },
            null, // latex
            { content: 'Leyes de Kirchhoff' },
            { content: 'Regla de Nodos: La suma de las corrientes que entran es igual a la suma de las que salen.' },
            { content: 'Regla de Mallas: La suma de los cambios de voltaje en cualquier malla cerrada es igual a cero.' },
          ],
          practice: [
            { question: 'Corriente en un resistor de 10 ohm con 5V?', answer: '0,5 A', hint: 'I = V/R = 5/10' },
            { question: 'Dos resistores de 6 ohm en paralelo?', answer: '3 ohm', hint: '1/R = 1/6 + 1/6' },
            { question: 'Potencia disipada por 4A en 3 ohm?', answer: '48 W', hint: 'P = I^2 * R = 16 * 3' },
          ],
        },
      },
    },

    // ---- physics-modern ------------------------------------------------------
    'physics-modern': {
      title: 'Fisica Moderna',
      description: 'Relatividad, mecanica cuantica y fisica nuclear',
      lessons: {
        'special-relativity': {
          title: 'Relatividad Especial',
          theory: [
            { content: 'La relatividad especial de Einstein (1905) se basa en dos postulados: (1) las leyes de la fisica son las mismas en todos los marcos de referencia inerciales; (2) la velocidad de la luz c es constante.' },
            { content: 'Factor de Lorentz' },
            null, // latex
            { content: 'Dilatacion del Tiempo' },
            null, // latex
            { content: 'Contraccion de la Longitud' },
            null, // latex
            { content: 'Equivalencia Masa-Energia' },
            null, // latex
            null, // latex
          ],
          practice: [
            { question: 'Factor gamma en v = 0,8c?', answer: '5/3 ≈ 1,667', hint: 'gamma = 1/raiz(1 - 0,64)' },
            { question: 'Un reloj se mueve a 0,6c. Si pasan 10s en su marco, cuanto pasa en el nuestro?', answer: '12,5 s', hint: 'gamma = 1/raiz(1-0,36) = 1,25' },
            { question: 'Energia en reposo de 1 kg?', answer: '9 * 10^{16} J', hint: 'E = mc^2 = 1 * (3*10^8)^2' },
          ],
        },
        'quantum-intro': {
          title: 'Introduccion a la Mecanica Cuantica',
          theory: [
            { content: 'Dualidad Onda-Particula' },
            null, // latex
            { content: 'Longitud de Onda de de Broglie' },
            null, // latex
            { content: 'Principio de Incertidumbre' },
            null, // latex
            { content: 'Ecuacion de Schrodinger' },
            null, // latex
            { content: 'Forma independiente del tiempo:' },
            null, // latex
            { content: 'Particula en una Caja' },
            null, // latex
          ],
          practice: [
            { question: 'Longitud de onda de de Broglie de un electron a 10^6 m/s?', answer: '~7,3 * 10^{-10} m', hint: 'lambda = h/(m_e * v), m_e = 9,1*10^-31 kg' },
            { question: 'Energia del estado fundamental de un electron en una caja de 1nm?', answer: '~6 * 10^{-20} J ≈ 0,38 eV', hint: 'E_1 = pi^2 * hbar^2 / (2mL^2)' },
            { question: 'Si Delta_x = 10^{-10} m, Delta_p minimo?', answer: '~5,3 * 10^{-25} kg*m/s', hint: 'Delta_p >= hbar/(2*Delta_x)' },
          ],
        },
      },
    },
  },
};

/**
 * Returns a translated copy of the curriculum array.
 * If lang is 'en' or no translations exist, returns the original unchanged.
 *
 * @param {Array} curriculum - The original curriculum array (MATH_CURRICULUM, PHYSICS_CURRICULUM, or ALL_PATHS)
 * @param {string} lang - Language code: 'en', 'pt', or 'es'
 * @returns {Array} - New array with translated content (original is never mutated)
 */
export function getTranslatedCurriculum(curriculum, lang) {
  // Return original for English or unsupported languages
  if (!lang || lang === 'en' || !curriculumTranslations[lang]) {
    return curriculum;
  }

  const translations = curriculumTranslations[lang];

  return curriculum.map((path) => {
    const pathTrans = translations[path.id];

    // No translation available for this path -- return original
    if (!pathTrans) {
      return path;
    }

    return {
      ...path,
      title: pathTrans.title || path.title,
      description: pathTrans.description || path.description,
      lessons: path.lessons.map((lesson) => {
        const lessonTrans = pathTrans.lessons && pathTrans.lessons[lesson.id];

        // No translation for this lesson -- return original
        if (!lessonTrans) {
          return lesson;
        }

        return {
          ...lesson,
          title: lessonTrans.title || lesson.title,
          // duration stays as-is (e.g. "15 min")
          theory: lesson.theory.map((block, idx) => {
            // If the translation array doesn't cover this index, keep original
            if (!lessonTrans.theory || idx >= lessonTrans.theory.length) {
              return block;
            }

            const blockTrans = lessonTrans.theory[idx];

            // null means "keep original" (used for latex blocks)
            if (blockTrans === null) {
              return block;
            }

            return {
              ...block,
              content: blockTrans.content != null ? blockTrans.content : block.content,
            };
          }),
          practice: lesson.practice.map((item, idx) => {
            if (!lessonTrans.practice || idx >= lessonTrans.practice.length) {
              return item;
            }

            const itemTrans = lessonTrans.practice[idx];

            return {
              ...item,
              question: itemTrans.question != null ? itemTrans.question : item.question,
              answer: itemTrans.answer != null ? itemTrans.answer : item.answer,
              hint: itemTrans.hint != null ? itemTrans.hint : item.hint,
            };
          }),
        };
      }),
    };
  });
}
