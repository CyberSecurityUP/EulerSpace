import { useState } from 'react';
import LatexRenderer from '../components/LatexRenderer';
import { useI18n } from '../i18n/context';

const FORMULA_SECTIONS = [
  {
    id: 'algebra',
    title: 'Algebra',
    icon: '🔤',
    formulas: [
      { name: 'Quadratic Formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
      { name: 'Binomial Theorem', latex: '(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k' },
      { name: 'Difference of Squares', latex: 'a^2 - b^2 = (a+b)(a-b)' },
      { name: 'Perfect Square', latex: '(a \\pm b)^2 = a^2 \\pm 2ab + b^2' },
      { name: 'Sum of Cubes', latex: 'a^3 + b^3 = (a+b)(a^2 - ab + b^2)' },
      { name: 'Logarithm Properties', latex: '\\log(ab) = \\log a + \\log b, \\quad \\log(a^n) = n\\log a' },
    ],
  },
  {
    id: 'trigonometry',
    title: 'Trigonometry',
    icon: '📐',
    formulas: [
      { name: 'Pythagorean Identity', latex: '\\sin^2\\theta + \\cos^2\\theta = 1' },
      { name: 'Double Angle (sin)', latex: '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta' },
      { name: 'Double Angle (cos)', latex: '\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta' },
      { name: 'Sum of Angles', latex: '\\sin(\\alpha \\pm \\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta' },
      { name: 'Law of Cosines', latex: 'c^2 = a^2 + b^2 - 2ab\\cos C' },
      { name: 'Law of Sines', latex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}' },
      { name: "Euler's Formula", latex: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta' },
    ],
  },
  {
    id: 'calculus',
    title: 'Calculus',
    icon: '∫',
    formulas: [
      { name: 'Power Rule', latex: '\\frac{d}{dx}[x^n] = nx^{n-1}' },
      { name: 'Chain Rule', latex: "\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)" },
      { name: 'Product Rule', latex: "(fg)' = f'g + fg'" },
      { name: 'Quotient Rule', latex: "\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}" },
      { name: 'Integration by Parts', latex: '\\int u\\,dv = uv - \\int v\\,du' },
      { name: 'Fundamental Theorem', latex: '\\int_a^b f(x)\\,dx = F(b) - F(a)' },
      { name: 'Taylor Series', latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n' },
      { name: 'Common: sin', latex: '\\frac{d}{dx}[\\sin x] = \\cos x, \\quad \\int \\sin x\\,dx = -\\cos x + C' },
      { name: 'Common: exp', latex: '\\frac{d}{dx}[e^x] = e^x, \\quad \\int e^x\\,dx = e^x + C' },
      { name: 'Common: ln', latex: '\\frac{d}{dx}[\\ln x] = \\frac{1}{x}, \\quad \\int \\frac{1}{x}\\,dx = \\ln|x| + C' },
    ],
  },
  {
    id: 'linear-algebra',
    title: 'Linear Algebra',
    icon: '⊞',
    formulas: [
      { name: 'Determinant 2x2', latex: '\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc' },
      { name: 'Eigenvalue Equation', latex: 'A\\mathbf{v} = \\lambda\\mathbf{v} \\quad \\Leftrightarrow \\quad \\det(A - \\lambda I) = 0' },
      { name: 'Dot Product', latex: '\\mathbf{u} \\cdot \\mathbf{v} = |\\mathbf{u}||\\mathbf{v}|\\cos\\theta' },
      { name: 'Cross Product Magnitude', latex: '|\\mathbf{u} \\times \\mathbf{v}| = |\\mathbf{u}||\\mathbf{v}|\\sin\\theta' },
      { name: 'Matrix Inverse (2x2)', latex: 'A^{-1} = \\frac{1}{ad-bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}' },
    ],
  },
  {
    id: 'mechanics',
    title: 'Classical Mechanics',
    icon: '🍎',
    formulas: [
      { name: "Newton's 2nd Law", latex: '\\mathbf{F} = m\\mathbf{a}' },
      { name: 'Kinematic Equations', latex: 'v = v_0 + at, \\quad x = x_0 + v_0t + \\frac{1}{2}at^2' },
      { name: 'Kinetic Energy', latex: 'K = \\frac{1}{2}mv^2' },
      { name: 'Gravitational PE', latex: 'U = mgh \\; (\\text{near surface}), \\quad U = -\\frac{GMm}{r} \\; (\\text{general})' },
      { name: 'Work-Energy Theorem', latex: 'W_{\\text{net}} = \\Delta K' },
      { name: 'Momentum', latex: '\\mathbf{p} = m\\mathbf{v}, \\quad \\mathbf{F} = \\frac{d\\mathbf{p}}{dt}' },
      { name: 'Angular Momentum', latex: 'L = I\\omega, \\quad \\tau = \\frac{dL}{dt}' },
      { name: 'Universal Gravitation', latex: 'F = \\frac{Gm_1m_2}{r^2}' },
    ],
  },
  {
    id: 'electromagnetism',
    title: 'Electromagnetism',
    icon: '⚡',
    formulas: [
      { name: "Coulomb's Law", latex: 'F = k\\frac{|q_1 q_2|}{r^2}' },
      { name: "Ohm's Law", latex: 'V = IR' },
      { name: 'Electric Field', latex: '\\mathbf{E} = k\\frac{Q}{r^2}\\hat{r}' },
      { name: "Gauss's Law", latex: '\\oint \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}' },
      { name: "Faraday's Law", latex: '\\mathcal{E} = -\\frac{d\\Phi_B}{dt}' },
      { name: 'Lorentz Force', latex: '\\mathbf{F} = q(\\mathbf{E} + \\mathbf{v} \\times \\mathbf{B})' },
      { name: "Maxwell's Equations", latex: '\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}, \\quad \\nabla \\times \\mathbf{B} = \\mu_0\\mathbf{J} + \\mu_0\\varepsilon_0\\frac{\\partial \\mathbf{E}}{\\partial t}' },
    ],
  },
  {
    id: 'modern-physics',
    title: 'Modern Physics',
    icon: '🔬',
    formulas: [
      { name: 'Mass-Energy', latex: 'E = mc^2' },
      { name: 'Lorentz Factor', latex: '\\gamma = \\frac{1}{\\sqrt{1 - v^2/c^2}}' },
      { name: 'de Broglie', latex: '\\lambda = \\frac{h}{p}' },
      { name: 'Uncertainty Principle', latex: '\\Delta x \\cdot \\Delta p \\geq \\frac{\\hbar}{2}' },
      { name: 'Schrodinger Equation', latex: 'i\\hbar\\frac{\\partial}{\\partial t}|\\Psi\\rangle = \\hat{H}|\\Psi\\rangle' },
      { name: 'Planck-Einstein', latex: 'E = h\\nu = \\hbar\\omega' },
      { name: 'Photoelectric Effect', latex: 'K_{\\max} = h\\nu - \\phi' },
      { name: "Stefan-Boltzmann", latex: 'P = \\sigma A T^4' },
    ],
  },
  {
    id: 'constants',
    title: 'Physical Constants',
    icon: '🔢',
    formulas: [
      { name: 'Speed of Light', latex: 'c = 2.998 \\times 10^8 \\; \\text{m/s}' },
      { name: 'Planck Constant', latex: 'h = 6.626 \\times 10^{-34} \\; \\text{J s}' },
      { name: 'Gravitational Constant', latex: 'G = 6.674 \\times 10^{-11} \\; \\text{N m}^2/\\text{kg}^2' },
      { name: 'Boltzmann Constant', latex: 'k_B = 1.381 \\times 10^{-23} \\; \\text{J/K}' },
      { name: 'Electron Mass', latex: 'm_e = 9.109 \\times 10^{-31} \\; \\text{kg}' },
      { name: 'Elementary Charge', latex: 'e = 1.602 \\times 10^{-19} \\; \\text{C}' },
      { name: 'Avogadro Number', latex: 'N_A = 6.022 \\times 10^{23} \\; \\text{mol}^{-1}' },
      { name: 'Vacuum Permittivity', latex: '\\varepsilon_0 = 8.854 \\times 10^{-12} \\; \\text{F/m}' },
    ],
  },
];

export default function Formulas() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(new Set(['algebra', 'calculus']));

  const toggle = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(FORMULA_SECTIONS.map(s => s.id)));
  const collapseAll = () => setExpanded(new Set());

  const filteredSections = FORMULA_SECTIONS.map(section => ({
    ...section,
    formulas: section.formulas.filter(f =>
      !search || f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.latex.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(s => s.formulas.length > 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{t('formulas.title')}</h2>
          <div className="subtitle">{t('formulas.subtitle')}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-secondary btn-sm" onClick={expandAll}>{t('formulas.expandAll')}</button>
          <button className="btn btn-secondary btn-sm" onClick={collapseAll}>{t('formulas.collapseAll')}</button>
        </div>
      </div>
      <div className="page-body">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="input-group" style={{ marginBottom: 20 }}>
            <input
              className="input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('formulas.searchPlaceholder')}
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          {filteredSections.map(section => (
            <div key={section.id} className="card" style={{ marginBottom: 12 }}>
              <div
                className="card-header"
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggle(section.id)}
              >
                <span>{section.icon}</span>
                <span style={{ flex: 1 }}>{section.title}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {section.formulas.length} {t('formulas.formulas')}
                </span>
                <span style={{
                  fontSize: 14, transition: 'transform 0.2s',
                  transform: expanded.has(section.id) ? 'rotate(90deg)' : 'rotate(0)',
                  display: 'inline-block', marginLeft: 8,
                }}>
                  ▶
                </span>
              </div>
              {expanded.has(section.id) && (
                <div className="card-body" style={{ padding: '8px 18px 18px' }}>
                  {section.formulas.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '10px 14px', borderRadius: 8,
                        background: i % 2 === 0 ? 'transparent' : 'var(--bg-primary)',
                      }}
                    >
                      <span style={{
                        fontSize: 12, color: 'var(--text-muted)', fontWeight: 500,
                        minWidth: 160, flexShrink: 0,
                      }}>
                        {f.name}
                      </span>
                      <div style={{ flex: 1 }}>
                        <LatexRenderer math={f.latex} display />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
