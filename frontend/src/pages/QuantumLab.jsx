import { useState } from 'react';
import LatexRenderer from '../components/LatexRenderer';
import { useI18n } from '../i18n/context';

/* ── Complex Number Helpers ─────────────────────────────────── */
const cx = (re, im = 0) => [re, im];
const cxAdd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const cxMul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cxScale = (a, s) => [a[0] * s, a[1] * s];
const cxMag2 = (a) => a[0] * a[0] + a[1] * a[1];
const cxMag = (a) => Math.sqrt(cxMag2(a));
const cxConj = (a) => [a[0], -a[1]];
const cxExp = (theta) => [Math.cos(theta), Math.sin(theta)];
const cxStr = (a, precision = 3) => {
  const re = a[0], im = a[1];
  if (Math.abs(im) < 1e-10) return re.toFixed(precision);
  if (Math.abs(re) < 1e-10) return `${im.toFixed(precision)}i`;
  return `${re.toFixed(precision)} ${im >= 0 ? '+' : '-'} ${Math.abs(im).toFixed(precision)}i`;
};

/* ── Matrix Helpers (2x2 complex) ───────────────────────────── */
const matVecMul = (mat, vec) => [
  cxAdd(cxMul(mat[0][0], vec[0]), cxMul(mat[0][1], vec[1])),
  cxAdd(cxMul(mat[1][0], vec[0]), cxMul(mat[1][1], vec[1])),
];

/* ── Gate Definitions ───────────────────────────────────────── */
const SQRT2_INV = 1 / Math.sqrt(2);
const GATES = {
  H: {
    name: 'Hadamard (H)',
    matrix: [[cx(SQRT2_INV), cx(SQRT2_INV)], [cx(SQRT2_INV), cx(-SQRT2_INV)]],
    latex: 'H = \\frac{1}{\\sqrt{2}} \\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}',
    desc: 'Creates equal superposition. Maps |0> to |+> and |1> to |->.',
    color: '#6366f1',
  },
  X: {
    name: 'Pauli-X (NOT)',
    matrix: [[cx(0), cx(1)], [cx(1), cx(0)]],
    latex: 'X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}',
    desc: 'Bit flip gate. Rotates 180 degrees around the X-axis of the Bloch sphere.',
    color: '#ef4444',
  },
  Y: {
    name: 'Pauli-Y',
    matrix: [[cx(0), cx(0, -1)], [cx(0, 1), cx(0)]],
    latex: 'Y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}',
    desc: 'Rotates 180 degrees around the Y-axis. Combines bit flip and phase flip.',
    color: '#22c55e',
  },
  Z: {
    name: 'Pauli-Z',
    matrix: [[cx(1), cx(0)], [cx(0), cx(0, 0)], [cx(0), cx(-1)]],
    latex: 'Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}',
    desc: 'Phase flip gate. Rotates 180 degrees around the Z-axis.',
    color: '#3b82f6',
  },
  S: {
    name: 'Phase (S)',
    matrix: [[cx(1), cx(0)], [cx(0), cx(0, 1)]],
    latex: 'S = \\begin{pmatrix} 1 & 0 \\\\ 0 & i \\end{pmatrix}',
    desc: 'Rotates 90 degrees around the Z-axis. S^2 = Z.',
    color: '#a855f7',
  },
  T: {
    name: 'T Gate',
    matrix: [[cx(1), cx(0)], [cx(0), cxExp(Math.PI / 4)]],
    latex: 'T = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/4} \\end{pmatrix}',
    desc: 'Rotates 45 degrees around Z-axis. T^2 = S. Essential for universal quantum computing.',
    color: '#f97316',
  },
};
// Fix Pauli-Z matrix (was malformed)
GATES.Z.matrix = [[cx(1), cx(0)], [cx(0), cx(-1)]];

/* ── Qubit State from Bloch Sphere Angles ───────────────────── */
const stateFromAngles = (theta, phi) => [
  cx(Math.cos(theta / 2)),
  cxMul(cxExp(phi), cx(Math.sin(theta / 2))),
];

/* ── Pre-built Circuits ─────────────────────────────────────── */
const CIRCUITS = {
  bell: {
    name: 'Bell State',
    qubits: 2,
    gates: [
      { gate: 'H', qubit: 0, step: 0 },
      { gate: 'CNOT', control: 0, target: 1, step: 1 },
    ],
    description: 'Creates the maximally entangled Bell state |Phi+> = (|00> + |11>)/sqrt(2). After measurement, both qubits are always found in the same state.',
    stepsLatex: [
      '|\\psi_0\\rangle = |00\\rangle',
      '|\\psi_1\\rangle = H \\otimes I |00\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} \\otimes |0\\rangle = \\frac{|00\\rangle + |10\\rangle}{\\sqrt{2}}',
      '|\\psi_2\\rangle = \\text{CNOT} \\frac{|00\\rangle + |10\\rangle}{\\sqrt{2}} = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}',
    ],
  },
  ghz: {
    name: 'GHZ State',
    qubits: 3,
    gates: [
      { gate: 'H', qubit: 0, step: 0 },
      { gate: 'CNOT', control: 0, target: 1, step: 1 },
      { gate: 'CNOT', control: 0, target: 2, step: 2 },
    ],
    description: 'The Greenberger-Horne-Zeilinger state is a 3-qubit entangled state. It demonstrates quantum nonlocality even more strongly than Bell states.',
    stepsLatex: [
      '|\\psi_0\\rangle = |000\\rangle',
      '|\\psi_1\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} \\otimes |00\\rangle',
      '|\\psi_2\\rangle = \\frac{|000\\rangle + |110\\rangle}{\\sqrt{2}}',
      '|\\psi_3\\rangle = \\frac{|000\\rangle + |111\\rangle}{\\sqrt{2}}',
    ],
  },
  teleport: {
    name: 'Quantum Teleportation',
    qubits: 3,
    gates: [
      { gate: 'H', qubit: 1, step: 0, label: 'Prepare EPR pair' },
      { gate: 'CNOT', control: 1, target: 2, step: 1 },
      { gate: 'CNOT', control: 0, target: 1, step: 2, label: 'Bell measurement' },
      { gate: 'H', qubit: 0, step: 3 },
      { gate: 'M', qubit: 0, step: 4, label: 'Measure & correct' },
      { gate: 'M', qubit: 1, step: 4 },
    ],
    description: 'Transfers a quantum state from one qubit to another using entanglement and classical communication. The original state is destroyed (no-cloning theorem).',
    stepsLatex: [
      '|\\psi\\rangle_{\\text{teleport}} = |\\psi\\rangle_A \\otimes |\\Phi^+\\rangle_{BC}',
      '= (\\alpha|0\\rangle + \\beta|1\\rangle) \\otimes \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}',
      '\\text{After Bell measurement on A,B:}',
      '|\\psi\\rangle_C = \\alpha|0\\rangle + \\beta|1\\rangle \\quad \\text{(with corrections)}',
    ],
  },
};

/* ── Key Quantum States ─────────────────────────────────────── */
const KEY_STATES = [
  { label: '|0\\rangle', theta: 0, phi: 0, desc: 'North pole (computational 0)' },
  { label: '|1\\rangle', theta: Math.PI, phi: 0, desc: 'South pole (computational 1)' },
  { label: '|+\\rangle', theta: Math.PI / 2, phi: 0, desc: 'Equal superposition (+)' },
  { label: '|-\\rangle', theta: Math.PI / 2, phi: Math.PI, desc: 'Equal superposition (-)' },
  { label: '|i\\rangle', theta: Math.PI / 2, phi: Math.PI / 2, desc: 'Y-basis (+i)' },
  { label: '|-i\\rangle', theta: Math.PI / 2, phi: 3 * Math.PI / 2, desc: 'Y-basis (-i)' },
];

/* ── Quantum Milestones ─────────────────────────────────────── */
const MILESTONES = [
  { year: '1935', event: 'Einstein, Podolsky, Rosen publish EPR paradox paper', color: '#ef4444' },
  { year: '1964', event: "Bell's theorem proves quantum mechanics is fundamentally nonlocal", color: '#f97316' },
  { year: '1981', event: 'Richard Feynman proposes quantum computers for simulating physics', color: '#eab308' },
  { year: '1985', event: 'David Deutsch describes the universal quantum computer', color: '#22c55e' },
  { year: '1994', event: "Peter Shor discovers quantum factoring algorithm (Shor's algorithm)", color: '#06b6d4' },
  { year: '1996', event: 'Lov Grover discovers quantum search algorithm', color: '#3b82f6' },
  { year: '1998', event: 'First 2-qubit quantum computer demonstrated (NMR)', color: '#6366f1' },
  { year: '2001', event: "IBM/Stanford implement Shor's algorithm, factor 15 = 3 x 5", color: '#a855f7' },
  { year: '2019', event: 'Google achieves "quantum supremacy" with 53-qubit Sycamore processor', color: '#ec4899' },
  { year: '2023', event: 'IBM unveils 1121-qubit Condor processor', color: '#f43f5e' },
];

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */
export default function QuantumLab() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('qubits');

  /* ── Qubits State ── */
  const [theta, setTheta] = useState(0);
  const [phi, setPhi] = useState(0);
  const [measureResult, setMeasureResult] = useState(null);
  const [measureHistory, setMeasureHistory] = useState([]);

  /* ── Gates State ── */
  const [selectedGate, setSelectedGate] = useState('H');
  const [gateQubitState, setGateQubitState] = useState([cx(1), cx(0)]);
  const [gateSequence, setGateSequence] = useState([]);
  const [circuitResult, setCircuitResult] = useState([cx(1), cx(0)]);

  /* ── Circuits State ── */
  const [selectedCircuit, setSelectedCircuit] = useState('bell');
  const [circuitStep, setCircuitStep] = useState(0);
  const [bellMeasurements, setBellMeasurements] = useState([]);

  /* ── Algorithms State ── */
  const [selectedAlgo, setSelectedAlgo] = useState('grover');
  const [groverN, setGroverN] = useState(8);
  const [groverTarget, setGroverTarget] = useState(3);
  const [groverStep, setGroverStep] = useState(0);
  const [bb84Step, setBb84Step] = useState(0);
  const [bb84Bits, setBb84Bits] = useState([]);

  /* ── Derived Qubit Values ── */
  const qubitState = stateFromAngles(theta, phi);
  const prob0 = cxMag2(qubitState[0]);
  const prob1 = cxMag2(qubitState[1]);

  /* ── Bloch Sphere Projection ── */
  const blochX = Math.sin(theta) * Math.cos(phi);
  const blochY = Math.sin(theta) * Math.sin(phi);
  const blochZ = Math.cos(theta);
  const sphereR = 110;
  const dotProjX = blochX * sphereR * 0.8;
  const dotProjY = (-blochZ * sphereR * 0.8) + (blochY * sphereR * 0.3);

  /* ── Measurement ── */
  const doMeasure = () => {
    const rand = Math.random();
    const result = rand < prob0 ? 0 : 1;
    setMeasureResult(result);
    setMeasureHistory(prev => [...prev.slice(-19), result]);
  };

  /* ── Apply Gate ── */
  const applyGate = (gateKey) => {
    const gate = GATES[gateKey];
    if (!gate) return;
    const newState = matVecMul(gate.matrix, gateQubitState);
    setGateQubitState(newState);
    setGateSequence(prev => [...prev, gateKey]);
    setCircuitResult(newState);
  };

  const resetGateState = () => {
    setGateQubitState([cx(1), cx(0)]);
    setGateSequence([]);
    setCircuitResult([cx(1), cx(0)]);
  };

  /* ── Simulate Bell measurements ── */
  const simulateBellMeasure = () => {
    const results = [];
    for (let i = 0; i < 100; i++) {
      const r = Math.random();
      results.push(r < 0.5 ? [0, 0] : [1, 1]);
    }
    setBellMeasurements(results);
  };

  /* ── Grover Amplitude Calculation ── */
  const computeGroverAmplitudes = () => {
    const N = groverN;
    const amps = new Array(N).fill(1 / Math.sqrt(N));
    const steps = [amps.slice()];
    const numIterations = Math.max(1, Math.floor((Math.PI / 4) * Math.sqrt(N)));
    for (let iter = 0; iter < numIterations; iter++) {
      // Oracle: flip target amplitude
      amps[groverTarget] = -amps[groverTarget];
      // Diffusion: invert about mean
      const mean = amps.reduce((s, a) => s + a, 0) / N;
      for (let j = 0; j < N; j++) {
        amps[j] = 2 * mean - amps[j];
      }
      steps.push(amps.slice());
    }
    return steps;
  };
  const groverAmps = computeGroverAmplitudes();

  /* ── BB84 Simulation ── */
  const generateBB84 = () => {
    const bits = [];
    for (let i = 0; i < 12; i++) {
      const aliceBit = Math.random() < 0.5 ? 0 : 1;
      const aliceBasis = Math.random() < 0.5 ? '+' : 'x';
      const bobBasis = Math.random() < 0.5 ? '+' : 'x';
      const match = aliceBasis === bobBasis;
      const bobResult = match ? aliceBit : (Math.random() < 0.5 ? 0 : 1);
      bits.push({ aliceBit, aliceBasis, bobBasis, match, bobResult });
    }
    setBb84Bits(bits);
    setBb84Step(0);
  };

  const TABS = [
    { id: 'qubits', label: t('quantum.qubits') },
    { id: 'gates', label: t('quantum.gates') },
    { id: 'circuits', label: t('quantum.circuits') },
    { id: 'algorithms', label: t('quantum.algorithms') },
    { id: 'concepts', label: t('quantum.concepts') },
  ];

  /* ════════════════════════════════════════════════════════════
     RENDER: BLOCH SPHERE TAB
     ════════════════════════════════════════════════════════════ */
  const renderQubitsTab = () => (
    <div>
      <div className="grid-2" style={{ gap: 20 }}>
        {/* Bloch Sphere Visual */}
        <div className="card">
          <div className="card-header">{t('quantum.blochSphere')}</div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg width="280" height="280" viewBox="-140 -140 280 280" style={{ margin: '0 auto' }}>
              {/* Sphere circle */}
              <circle cx="0" cy="0" r={sphereR} fill="none" stroke="var(--border)" strokeWidth="1.5" opacity="0.6" />
              {/* Equator ellipse */}
              <ellipse cx="0" cy="0" rx={sphereR} ry={sphereR * 0.3} fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.3" strokeDasharray="4,4" />
              {/* Z axis (vertical) */}
              <line x1="0" y1={-sphereR - 15} x2="0" y2={sphereR + 15} stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
              {/* X axis (horizontal) */}
              <line x1={-sphereR - 15} y1="0" x2={sphereR + 15} y2="0" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
              {/* Y axis (into screen, angled) */}
              <line x1={-sphereR * 0.5} y1={sphereR * 0.3} x2={sphereR * 0.5} y2={-sphereR * 0.3} stroke="var(--text-muted)" strokeWidth="1" opacity="0.3" strokeDasharray="3,3" />
              {/* Axis labels */}
              <text x="0" y={-sphereR - 20} fill="var(--accent)" fontSize="14" textAnchor="middle" fontWeight="600">|0&rang;</text>
              <text x="0" y={sphereR + 28} fill="var(--accent)" fontSize="14" textAnchor="middle" fontWeight="600">|1&rang;</text>
              <text x={sphereR + 20} y="5" fill="var(--text-muted)" fontSize="12" textAnchor="start">X</text>
              <text x={-sphereR - 20} y="5" fill="var(--text-muted)" fontSize="12" textAnchor="end">-X</text>
              <text x={sphereR * 0.55} y={-sphereR * 0.35} fill="var(--text-muted)" fontSize="12">Y</text>
              {/* Projection line from center to dot */}
              <line x1="0" y1="0" x2={dotProjX} y2={dotProjY} stroke="var(--accent)" strokeWidth="1.5" opacity="0.5" strokeDasharray="3,3" />
              {/* State dot */}
              <circle cx={dotProjX} cy={dotProjY} r="8" fill="var(--accent)" stroke="white" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 6px var(--accent-glow))' }} />
              {/* Shadow on equator */}
              <circle cx={blochX * sphereR * 0.8} cy={blochY * sphereR * 0.3} r="4" fill="var(--accent)" opacity="0.25" />
            </svg>

            {/* Quick State Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16, justifyContent: 'center' }}>
              {KEY_STATES.map((ks, i) => (
                <button key={i} className="btn btn-secondary btn-sm"
                  style={{ fontSize: 12, padding: '4px 10px' }}
                  onClick={() => { setTheta(ks.theta); setPhi(ks.phi); setMeasureResult(null); }}
                  title={ks.desc}>
                  <LatexRenderer math={ks.label} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls & State Info */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">{t('quantum.stateControl')}</div>
            <div className="card-body">
              {/* Theta slider */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 14, fontWeight: 500 }}>
                    <LatexRenderer math="\theta" /> (polar)
                  </label>
                  <span style={{ color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                    {(theta * 180 / Math.PI).toFixed(1)} deg
                  </span>
                </div>
                <input type="range" min="0" max={Math.PI} step="0.01" value={theta}
                  onChange={e => { setTheta(Number(e.target.value)); setMeasureResult(null); }}
                  style={{ width: '100%', accentColor: 'var(--accent)' }} />
              </div>
              {/* Phi slider */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 14, fontWeight: 500 }}>
                    <LatexRenderer math="\phi" /> (azimuthal)
                  </label>
                  <span style={{ color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                    {(phi * 180 / Math.PI).toFixed(1)} deg
                  </span>
                </div>
                <input type="range" min="0" max={2 * Math.PI} step="0.01" value={phi}
                  onChange={e => { setPhi(Number(e.target.value)); setMeasureResult(null); }}
                  style={{ width: '100%', accentColor: 'var(--accent)' }} />
              </div>

              {/* State vector display */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 14, marginBottom: 14, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{t('quantum.stateVector')}</div>
                <LatexRenderer display math={`|\\psi\\rangle = ${cxStr(qubitState[0])}|0\\rangle + (${cxStr(qubitState[1])})|1\\rangle`} />
              </div>

              {/* Probabilities */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{t('quantum.probabilities')}</div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>P(|0&rang;)</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{(prob0 * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', borderRadius: 20, height: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${prob0 * 100}%`, height: '100%', borderRadius: 20, background: 'linear-gradient(90deg, #6366f1, #818cf8)', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>P(|1&rang;)</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{(prob1 * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', borderRadius: 20, height: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${prob1 * 100}%`, height: '100%', borderRadius: 20, background: 'linear-gradient(90deg, #ec4899, #f472b6)', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              </div>

              {/* Measure button */}
              <button className="btn btn-primary" onClick={doMeasure}
                style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
                {t('quantum.measure')}
              </button>

              {measureResult !== null && (
                <div style={{ textAlign: 'center', padding: 12, background: measureResult === 0 ? '#6366f120' : '#ec489920', borderRadius: 8, border: `1px solid ${measureResult === 0 ? '#6366f1' : '#ec4899'}` }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{t('quantum.measureResult')}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: measureResult === 0 ? '#6366f1' : '#ec4899' }}>
                    |{measureResult}&rang;
                  </div>
                </div>
              )}

              {/* Measurement History */}
              {measureHistory.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{t('quantum.history')} ({measureHistory.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {measureHistory.map((m, i) => (
                      <span key={i} style={{
                        width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                        background: m === 0 ? '#6366f130' : '#ec489930',
                        color: m === 0 ? '#6366f1' : '#ec4899',
                      }}>{m}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    |0&rang;: {measureHistory.filter(m => m === 0).length} ({(measureHistory.filter(m => m === 0).length / measureHistory.length * 100).toFixed(0)}%)
                    &nbsp;&nbsp;|1&rang;: {measureHistory.filter(m => m === 1).length} ({(measureHistory.filter(m => m === 1).length / measureHistory.length * 100).toFixed(0)}%)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Theory Section */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">{t('quantum.qubitTheory')}</div>
        <div className="card-body">
          <div style={{ maxWidth: 800 }}>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
              A qubit (quantum bit) is the fundamental unit of quantum information. Unlike a classical bit,
              which can only be 0 or 1, a qubit can exist in a superposition of both states simultaneously.
              The general state of a qubit is described by:
            </p>
            <div style={{ margin: '16px 0', textAlign: 'center' }}>
              <LatexRenderer display math="|\psi\rangle = \alpha|0\rangle + \beta|1\rangle" />
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
              where <LatexRenderer math="\alpha" /> and <LatexRenderer math="\beta" /> are complex numbers satisfying the normalization condition:
            </p>
            <div style={{ margin: '16px 0', textAlign: 'center' }}>
              <LatexRenderer display math="|\alpha|^2 + |\beta|^2 = 1" />
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
              When we measure a qubit, we get outcome |0&rang; with probability <LatexRenderer math="|\alpha|^2" /> and
              outcome |1&rang; with probability <LatexRenderer math="|\beta|^2" />. The measurement collapses the superposition.
            </p>
            <div style={{ margin: '16px 0', textAlign: 'center' }}>
              <LatexRenderer display math="P(|0\rangle) = |\alpha|^2, \quad P(|1\rangle) = |\beta|^2" />
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
              The Bloch sphere parametrization uses two angles, <LatexRenderer math="\theta" /> (polar) and <LatexRenderer math="\phi" /> (azimuthal):
            </p>
            <div style={{ margin: '16px 0', textAlign: 'center' }}>
              <LatexRenderer display math="|\psi\rangle = \cos\frac{\theta}{2}|0\rangle + e^{i\phi}\sin\frac{\theta}{2}|1\rangle" />
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              This maps every possible qubit state to a unique point on the surface of a unit sphere.
              The north pole corresponds to |0&rang;, the south pole to |1&rang;, and points on the equator
              represent equal superpositions with different relative phases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     RENDER: GATES TAB
     ════════════════════════════════════════════════════════════ */
  const renderGatesTab = () => (
    <div>
      {/* Gate Cards */}
      <div className="grid-3" style={{ gap: 16, marginBottom: 20 }}>
        {Object.entries(GATES).map(([key, gate]) => (
          <div key={key} className="card" style={{
            cursor: 'pointer',
            borderColor: selectedGate === key ? gate.color : 'var(--border)',
            transition: 'all 0.2s',
          }}
            onClick={() => setSelectedGate(key)}>
            <div className="card-body" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${gate.color}20`, color: gate.color, fontWeight: 700, fontSize: 18,
                  fontFamily: "'JetBrains Mono', monospace", border: `1px solid ${gate.color}40`,
                }}>{key}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{gate.name}</div>
              </div>
              <div style={{ margin: '10px 0', textAlign: 'center' }}>
                <LatexRenderer math={gate.latex} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 8 }}>{gate.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Gate Application */}
      <div className="grid-2" style={{ gap: 20 }}>
        <div className="card">
          <div className="card-header">{t('quantum.circuitBuilder')}</div>
          <div className="card-body">
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              Click gates to apply them sequentially to the qubit starting in |0&rang; state.
            </div>

            {/* Gate buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {Object.entries(GATES).map(([key, gate]) => (
                <button key={key} className="btn btn-sm" onClick={() => applyGate(key)}
                  style={{
                    background: `${gate.color}20`, color: gate.color,
                    border: `1px solid ${gate.color}60`, fontWeight: 600,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                  {key}
                </button>
              ))}
              <button className="btn btn-secondary btn-sm" onClick={resetGateState}
                style={{ marginLeft: 'auto' }}>
                {t('quantum.reset')}
              </button>
            </div>

            {/* Gate sequence visual */}
            <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 14, border: '1px solid var(--border)', marginBottom: 16, minHeight: 60 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{t('quantum.gateSequence')}</div>
              {gateSequence.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>
                  {t('quantum.noGatesApplied')}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>|0&rang;</span>
                  {gateSequence.map((g, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>&rarr;</span>
                      <span style={{
                        padding: '3px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace",
                        background: `${GATES[g].color}20`, color: GATES[g].color,
                        border: `1px solid ${GATES[g].color}40`,
                      }}>{g}</span>
                    </span>
                  ))}
                  <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>&rarr; |&psi;&rang;</span>
                </div>
              )}
            </div>

            {/* Circuit wire visual */}
            <div style={{ position: 'relative', height: 50, background: 'var(--bg-primary)', borderRadius: 8, padding: '0 16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: 16, right: 16, height: 2, background: 'var(--border)', top: '50%' }} />
              <span style={{ position: 'relative', zIndex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginRight: 12 }}>q</span>
              {gateSequence.map((g, i) => (
                <div key={i} style={{
                  position: 'relative', zIndex: 1, width: 32, height: 32, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginRight: 8,
                  background: GATES[g].color, color: 'white', fontWeight: 700, fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace", boxShadow: `0 0 8px ${GATES[g].color}60`,
                }}>{g}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Result State */}
        <div className="card">
          <div className="card-header">{t('quantum.resultState')}</div>
          <div className="card-body">
            <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 16, border: '1px solid var(--border)', marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{t('quantum.outputState')}</div>
              <LatexRenderer display math={`|\\psi\\rangle = ${cxStr(circuitResult[0])}|0\\rangle + (${cxStr(circuitResult[1])})|1\\rangle`} />
            </div>

            {/* Probabilities */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>P(|0&rang;)</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{(cxMag2(circuitResult[0]) * 100).toFixed(1)}%</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 20, height: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ width: `${cxMag2(circuitResult[0]) * 100}%`, height: '100%', borderRadius: 20, background: 'linear-gradient(90deg, #6366f1, #818cf8)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>P(|1&rang;)</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{(cxMag2(circuitResult[1]) * 100).toFixed(1)}%</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 20, height: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ width: `${cxMag2(circuitResult[1]) * 100}%`, height: '100%', borderRadius: 20, background: 'linear-gradient(90deg, #ec4899, #f472b6)', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* Selected Gate Detail */}
            {selectedGate && GATES[selectedGate] && (
              <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 16, border: `1px solid ${GATES[selectedGate].color}40` }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: GATES[selectedGate].color }}>
                  {GATES[selectedGate].name}
                </div>
                <div style={{ textAlign: 'center', margin: '12px 0' }}>
                  <LatexRenderer display math={GATES[selectedGate].latex} />
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {GATES[selectedGate].desc}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CNOT Gate Info */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">{t('quantum.multiQubitGates')}</div>
        <div className="card-body">
          <div style={{ maxWidth: 800 }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent-hover)', marginBottom: 12 }}>
              CNOT (Controlled-NOT) Gate
            </h4>
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <LatexRenderer display math="\\text{CNOT} = \\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{pmatrix}" />
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 12 }}>
              The CNOT gate is a two-qubit gate that flips the target qubit if and only if the control qubit is |1&rang;.
              It is the key ingredient for creating entanglement. Combined with single-qubit gates, CNOT forms a
              universal gate set -- any quantum computation can be decomposed into a sequence of single-qubit gates and CNOTs.
            </p>
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <LatexRenderer display math="\\text{CNOT}|00\\rangle = |00\\rangle, \\quad \\text{CNOT}|01\\rangle = |01\\rangle" />
            </div>
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <LatexRenderer display math="\\text{CNOT}|10\\rangle = |11\\rangle, \\quad \\text{CNOT}|11\\rangle = |10\\rangle" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     RENDER: CIRCUITS TAB
     ════════════════════════════════════════════════════════════ */
  const renderCircuitsTab = () => {
    const circuit = CIRCUITS[selectedCircuit];
    return (
      <div>
        {/* Circuit Selection */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {Object.entries(CIRCUITS).map(([key, c]) => (
            <button key={key}
              className={`btn ${selectedCircuit === key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setSelectedCircuit(key); setCircuitStep(0); setBellMeasurements([]); }}>
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          {/* Circuit Diagram */}
          <div className="card">
            <div className="card-header">{t('quantum.circuitDiagram')}</div>
            <div className="card-body">
              <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 20, border: '1px solid var(--border)', overflow: 'auto' }}>
                {Array.from({ length: circuit.qubits }, (_, q) => (
                  <div key={q} style={{ display: 'flex', alignItems: 'center', height: 48, position: 'relative', marginBottom: q < circuit.qubits - 1 ? 8 : 0 }}>
                    {/* Qubit label */}
                    <span style={{ width: 30, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                      q{q}
                    </span>
                    {/* Wire */}
                    <div style={{ flex: 1, position: 'relative', height: 2, background: 'var(--border)' }}>
                      {/* Gate boxes on this wire */}
                      {circuit.gates.filter(g => {
                        if (g.gate === 'CNOT') return g.control === q || g.target === q;
                        return g.qubit === q;
                      }).map((g, gi) => {
                        const xPos = 30 + g.step * 70;
                        if (g.gate === 'CNOT') {
                          if (g.control === q) {
                            return (
                              <div key={gi} style={{
                                position: 'absolute', left: xPos, top: -6,
                                width: 14, height: 14, borderRadius: '50%',
                                background: '#06b6d4', border: '2px solid #06b6d4',
                                transform: 'translateX(-50%)',
                              }} />
                            );
                          } else {
                            return (
                              <div key={gi} style={{
                                position: 'absolute', left: xPos, top: -12,
                                width: 26, height: 26, borderRadius: '50%',
                                border: '2px solid #06b6d4', background: 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transform: 'translateX(-50%)',
                              }}>
                                <div style={{ width: 2, height: 26, background: '#06b6d4', position: 'absolute' }} />
                                <div style={{ height: 2, width: 26, background: '#06b6d4', position: 'absolute' }} />
                              </div>
                            );
                          }
                        }
                        if (g.gate === 'M') {
                          return (
                            <div key={gi} style={{
                              position: 'absolute', left: xPos, top: -16,
                              width: 34, height: 34, borderRadius: 4,
                              background: 'var(--bg-secondary)', border: '2px solid #eab308',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transform: 'translateX(-50%)', fontSize: 14, color: '#eab308', fontWeight: 700,
                            }}>M</div>
                          );
                        }
                        return (
                          <div key={gi} style={{
                            position: 'absolute', left: xPos, top: -16,
                            width: 34, height: 34, borderRadius: 4,
                            background: `${GATES[g.gate]?.color || '#6366f1'}20`,
                            border: `2px solid ${GATES[g.gate]?.color || '#6366f1'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transform: 'translateX(-50%)',
                            fontSize: 14, fontWeight: 700,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: GATES[g.gate]?.color || '#6366f1',
                          }}>{g.gate}</div>
                        );
                      })}
                    </div>
                    {/* |0> initial state */}
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>|0&rang;</span>
                  </div>
                ))}
                {/* Vertical CNOT lines */}
                {circuit.gates.filter(g => g.gate === 'CNOT').map((g, i) => {
                  const xPos = 60 + g.step * 70;
                  const top = Math.min(g.control, g.target) * 56 + 24;
                  const bottom = Math.max(g.control, g.target) * 56 + 24;
                  return (
                    <div key={`cnot-line-${i}`} style={{
                      position: 'absolute', left: xPos, top, width: 2, height: bottom - top,
                      background: '#06b6d4', pointerEvents: 'none',
                    }} />
                  );
                })}
              </div>

              {/* Description */}
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 16, fontSize: 13 }}>
                {circuit.description}
              </p>

              {selectedCircuit === 'bell' && (
                <button className="btn btn-primary" onClick={simulateBellMeasure} style={{ marginTop: 12 }}>
                  {t('quantum.simulateMeasurements')}
                </button>
              )}
            </div>
          </div>

          {/* Step-by-step evolution */}
          <div className="card">
            <div className="card-header">{t('quantum.stateEvolution')}</div>
            <div className="card-body">
              {/* Step navigation */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {circuit.stepsLatex.map((_, i) => (
                  <button key={i} className={`btn btn-sm ${circuitStep === i ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setCircuitStep(i)}>
                    {t('quantum.step')} {i}
                  </button>
                ))}
              </div>

              {/* Current step state */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 16, border: '1px solid var(--accent)', marginBottom: 16 }}>
                <LatexRenderer display math={circuit.stepsLatex[circuitStep]} />
              </div>

              {/* All steps overview */}
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                <div style={{ fontWeight: 600, marginBottom: 10 }}>{t('quantum.fullEvolution')}</div>
                {circuit.stepsLatex.map((latex, i) => (
                  <div key={i} style={{
                    padding: '10px 12px', marginBottom: 8, borderRadius: 6,
                    background: circuitStep === i ? 'var(--accent)10' : 'transparent',
                    borderLeft: `3px solid ${circuitStep === i ? 'var(--accent)' : 'var(--border)'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }} onClick={() => setCircuitStep(i)}>
                    <LatexRenderer math={latex} />
                  </div>
                ))}
              </div>

              {/* Bell measurement results */}
              {selectedCircuit === 'bell' && bellMeasurements.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>{t('quantum.measurementResults')}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {bellMeasurements.slice(0, 50).map((m, i) => (
                      <span key={i} style={{
                        padding: '3px 6px', borderRadius: 4, fontSize: 11,
                        fontFamily: "'JetBrains Mono', monospace",
                        background: m[0] === 0 ? '#6366f120' : '#ec489920',
                        color: m[0] === 0 ? '#6366f1' : '#ec4899',
                      }}>|{m[0]}{m[1]}&rang;</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                    Notice: the qubits are always correlated! You never see |01&rang; or |10&rang;.
                    This is entanglement -- measuring one qubit instantly determines the other.
                  </p>
                  <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                    <div style={{ fontSize: 13 }}>
                      <span style={{ color: '#6366f1', fontWeight: 600 }}>|00&rang;:</span>{' '}
                      {bellMeasurements.filter(m => m[0] === 0).length}%
                    </div>
                    <div style={{ fontSize: 13 }}>
                      <span style={{ color: '#ec4899', fontWeight: 600 }}>|11&rang;:</span>{' '}
                      {bellMeasurements.filter(m => m[0] === 1).length}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════
     RENDER: ALGORITHMS TAB
     ════════════════════════════════════════════════════════════ */
  const renderAlgorithmsTab = () => (
    <div>
      {/* Algorithm selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[
          { id: 'grover', label: "Grover's Algorithm" },
          { id: 'shor', label: "Shor's Algorithm" },
          { id: 'bb84', label: 'BB84 Key Distribution' },
        ].map(a => (
          <button key={a.id}
            className={`btn ${selectedAlgo === a.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedAlgo(a.id)}>
            {a.label}
          </button>
        ))}
      </div>

      {/* ── Grover's Algorithm ── */}
      {selectedAlgo === 'grover' && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">{t('quantum.groverTitle')}</div>
            <div className="card-body">
              <div style={{ maxWidth: 800 }}>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
                  Grover's algorithm provides a quadratic speedup for searching an unstructured database.
                  Classically, searching N items requires O(N) operations on average. Grover's algorithm
                  finds the target in O(sqrt(N)) operations -- a fundamental quantum advantage.
                </p>
                <div style={{ textAlign: 'center', margin: '16px 0' }}>
                  <LatexRenderer display math="\\text{Classical: } O(N) \\quad \\text{vs} \\quad \\text{Quantum: } O(\\sqrt{N})" />
                </div>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
                  The algorithm works by repeatedly applying two operations: (1) an Oracle that marks the
                  target state by flipping its sign, and (2) a Diffusion operator that amplifies the marked
                  state's amplitude while reducing all others. After approximately <LatexRenderer math="\frac{\pi}{4}\sqrt{N}" /> iterations,
                  the target state has near-unity probability.
                </p>
                <div style={{ textAlign: 'center', margin: '16px 0' }}>
                  <LatexRenderer display math="G = (2|s\\rangle\\langle s| - I) \\cdot O_f" />
                </div>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  where <LatexRenderer math="|s\\rangle = \\frac{1}{\\sqrt{N}}\\sum_{x=0}^{N-1}|x\\rangle" /> is the
                  uniform superposition, and <LatexRenderer math="O_f" /> is the oracle that flips the sign
                  of the target state.
                </p>
              </div>
            </div>
          </div>

          {/* Grover Visualization */}
          <div className="card">
            <div className="card-header">{t('quantum.amplitudeAmplification')}</div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: 13, marginRight: 8 }}>{t('quantum.databaseSize')} (N):</label>
                  <select className="input" value={groverN} onChange={e => { setGroverN(Number(e.target.value)); setGroverStep(0); }}
                    style={{ width: 80, display: 'inline-block' }}>
                    {[4, 8, 16, 32].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, marginRight: 8 }}>{t('quantum.targetItem')}:</label>
                  <select className="input" value={groverTarget} onChange={e => { setGroverTarget(Number(e.target.value)); setGroverStep(0); }}
                    style={{ width: 80, display: 'inline-block' }}>
                    {Array.from({ length: groverN }, (_, i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              {/* Step control */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {groverAmps.map((_, i) => (
                  <button key={i} className={`btn btn-sm ${groverStep === i ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setGroverStep(i)}>
                    {i === 0 ? t('quantum.initial') : `${t('quantum.iteration')} ${i}`}
                  </button>
                ))}
              </div>

              {/* Amplitude bars */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 16, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 200, paddingBottom: 30, position: 'relative' }}>
                  {/* Zero line */}
                  <div style={{ position: 'absolute', bottom: 30, left: 0, right: 0, height: 1, background: 'var(--border)' }} />
                  {(groverAmps[groverStep] || []).map((amp, i) => {
                    const maxAmp = Math.max(...groverAmps[groverStep].map(Math.abs));
                    const barHeight = Math.abs(amp) / (maxAmp || 1) * 150;
                    const isTarget = i === groverTarget;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '100%', maxWidth: 40,
                          height: barHeight,
                          background: isTarget
                            ? 'linear-gradient(180deg, #22c55e, #16a34a)'
                            : 'linear-gradient(180deg, #6366f1, #4f46e5)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.4s ease',
                          boxShadow: isTarget ? '0 0 12px #22c55e60' : 'none',
                        }} />
                        <div style={{ fontSize: 9, color: isTarget ? '#22c55e' : 'var(--text-muted)', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                          {groverN <= 16 ? i : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  {t('quantum.targetProbability')}: <span style={{ color: '#22c55e', fontWeight: 700 }}>
                    {((groverAmps[groverStep]?.[groverTarget] || 0) ** 2 * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Shor's Algorithm ── */}
      {selectedAlgo === 'shor' && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">{t('quantum.shorTitle')}</div>
            <div className="card-body">
              <div style={{ maxWidth: 800 }}>
                <div style={{ background: '#ef444415', border: '1px solid #ef444440', borderRadius: 8, padding: 14, marginBottom: 20 }}>
                  <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: 6, fontSize: 14 }}>
                    Why it matters: RSA encryption is at risk
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
                    RSA encryption relies on the fact that factoring large numbers is computationally intractable for classical computers.
                    Shor's algorithm can factor an n-bit number in polynomial time on a quantum computer, breaking RSA and similar cryptosystems.
                  </p>
                </div>

                <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent-hover)', marginBottom: 12 }}>
                  Complexity Comparison
                </h4>
                <div style={{ textAlign: 'center', margin: '16px 0' }}>
                  <LatexRenderer display math="\\text{Classical (GNFS): } O\\left(e^{n^{1/3} (\\ln n)^{2/3}}\\right) \\quad \\text{vs} \\quad \\text{Quantum (Shor): } O(n^3)" />
                </div>

                <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent-hover)', marginTop: 24, marginBottom: 12 }}>
                  How it works (simplified)
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { step: 1, title: 'Choose random a < N', desc: 'Pick a random number coprime to N (the number to factor).', latex: '\\gcd(a, N) = 1' },
                    { step: 2, title: 'Find the period r', desc: 'Use quantum Fourier transform to find the period r of the function f(x) = a^x mod N.', latex: 'f(x) = a^x \\bmod N, \\quad f(x+r) = f(x)' },
                    { step: 3, title: 'Quantum Fourier Transform', desc: 'The QFT efficiently finds the period by exploiting quantum parallelism and interference.', latex: 'QFT|j\\rangle = \\frac{1}{\\sqrt{N}}\\sum_{k=0}^{N-1} e^{2\\pi ijk/N}|k\\rangle' },
                    { step: 4, title: 'Extract factors', desc: 'Use the period r to compute the factors of N via GCD.', latex: '\\text{factors} = \\gcd(a^{r/2} \\pm 1, N)' },
                  ].map(s => (
                    <div key={s.step} style={{
                      background: 'var(--bg-primary)', borderRadius: 8, padding: 14,
                      border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)',
                          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, flexShrink: 0,
                        }}>{s.step}</div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</div>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5, marginBottom: 8, marginLeft: 38 }}>{s.desc}</p>
                      <div style={{ marginLeft: 38 }}>
                        <LatexRenderer math={s.latex} />
                      </div>
                    </div>
                  ))}
                </div>

                <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent-hover)', marginTop: 24, marginBottom: 12 }}>
                  Example: Factoring N = 15
                </h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 12 }}>
                  Choose a = 7. Then f(x) = 7^x mod 15 has period r = 4:
                </p>
                <div style={{ textAlign: 'center', margin: '12px 0' }}>
                  <LatexRenderer display math="7^0 = 1, \\quad 7^1 = 7, \\quad 7^2 = 4, \\quad 7^3 = 13, \\quad 7^4 = 1 \\pmod{15}" />
                </div>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  Since r = 4 is even, we compute gcd(7^2 - 1, 15) = gcd(48, 15) = 3 and gcd(7^2 + 1, 15) = gcd(50, 15) = 5.
                  Thus 15 = 3 x 5.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BB84 Protocol ── */}
      {selectedAlgo === 'bb84' && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">{t('quantum.bb84Title')}</div>
            <div className="card-body">
              <div style={{ maxWidth: 800 }}>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
                  BB84 is the first quantum key distribution protocol, invented by Charles Bennett and Gilles Brassard in 1984.
                  It uses the properties of quantum mechanics to establish a secure shared key between two parties (Alice and Bob).
                  Any eavesdropping attempt (by Eve) introduces detectable errors due to the no-cloning theorem.
                </p>

                <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent-hover)', marginBottom: 12 }}>
                  Protocol Steps
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[
                    'Alice randomly chooses bits (0 or 1) and bases (+ or x) for each photon.',
                    'Alice sends polarized photons: + basis uses |0> / |1>, x basis uses |+> / |->.',
                    'Bob randomly chooses a measurement basis (+ or x) for each photon.',
                    'Alice and Bob publicly compare bases (not bits). They keep only bits where bases matched.',
                    'They sacrifice some key bits to check for eavesdropping. If error rate > threshold, abort.',
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2,
                      }}>{i + 1}</div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>{step}</p>
                    </div>
                  ))}
                </div>

                <button className="btn btn-primary" onClick={generateBB84}>
                  {t('quantum.simulateBB84')}
                </button>
              </div>
            </div>
          </div>

          {/* BB84 Simulation Result */}
          {bb84Bits.length > 0 && (
            <div className="card">
              <div className="card-header">{t('quantum.bb84Simulation')}</div>
              <div className="card-body" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: 11 }}>{t('quantum.photon')}</th>
                      {bb84Bits.map((_, i) => (
                        <th key={i} style={{ padding: '8px 6px', textAlign: 'center', borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: 11 }}>
                          {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Alice Bit</td>
                      {bb84Bits.map((b, i) => (
                        <td key={i} style={{ padding: '8px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>{b.aliceBit}</td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Alice Basis</td>
                      {bb84Bits.map((b, i) => (
                        <td key={i} style={{ padding: '8px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', color: b.aliceBasis === '+' ? '#6366f1' : '#ec4899' }}>
                          {b.aliceBasis}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Bob Basis</td>
                      {bb84Bits.map((b, i) => (
                        <td key={i} style={{ padding: '8px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', color: b.bobBasis === '+' ? '#6366f1' : '#ec4899' }}>
                          {b.bobBasis}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Bob Result</td>
                      {bb84Bits.map((b, i) => (
                        <td key={i} style={{ padding: '8px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>{b.bobResult}</td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{t('quantum.basisMatch')}</td>
                      {bb84Bits.map((b, i) => (
                        <td key={i} style={{
                          padding: '8px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)',
                          color: b.match ? '#22c55e' : '#ef4444', fontWeight: 600,
                        }}>
                          {b.match ? 'Yes' : 'No'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{t('quantum.sharedKey')}</td>
                      {bb84Bits.map((b, i) => (
                        <td key={i} style={{
                          padding: '8px 6px', textAlign: 'center',
                          fontWeight: b.match ? 700 : 400,
                          color: b.match ? '#22c55e' : 'var(--text-muted)',
                          background: b.match ? '#22c55e10' : 'transparent',
                        }}>
                          {b.match ? b.aliceBit : '-'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>

                <div style={{ marginTop: 16, padding: 12, background: '#22c55e10', borderRadius: 8, border: '1px solid #22c55e40' }}>
                  <div style={{ fontWeight: 600, color: '#22c55e', marginBottom: 6 }}>{t('quantum.sharedKey')}:</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, letterSpacing: 2 }}>
                    {bb84Bits.filter(b => b.match).map(b => b.aliceBit).join('')}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                    Only bits where Alice and Bob chose the same basis form the shared secret key.
                    The key rate is approximately 50% of the transmitted photons.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     RENDER: CONCEPTS TAB
     ════════════════════════════════════════════════════════════ */
  const renderConceptsTab = () => (
    <div>
      {/* Superposition */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">{t('quantum.superposition')}</div>
        <div className="card-body">
          <div style={{ maxWidth: 800 }}>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
              Imagine flipping a coin and, while it is still spinning in the air, it is neither heads nor tails --
              it exists in both states simultaneously. This is analogous to quantum superposition. A qubit in superposition
              is not merely "unknown" -- it is genuinely in multiple states at once, as confirmed by interference experiments.
            </p>
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <LatexRenderer display math="|\psi\rangle = \alpha|0\rangle + \beta|1\rangle, \quad |\alpha|^2 + |\beta|^2 = 1" />
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              The power of quantum computing comes from the fact that n qubits can simultaneously represent 2^n states.
              While 10 classical bits store exactly one of 1024 states, 10 qubits can represent all 1024 states
              in superposition simultaneously, enabling massive parallelism in computation.
            </p>
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <LatexRenderer display math="n \\text{ qubits} \\rightarrow 2^n \\text{ simultaneous states}" />
            </div>
          </div>
        </div>
      </div>

      {/* Entanglement */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">{t('quantum.entanglement')}</div>
        <div className="card-body">
          <div style={{ maxWidth: 800 }}>
            <div style={{ background: '#6366f115', borderRadius: 8, padding: 14, marginBottom: 16, borderLeft: '3px solid #6366f1' }}>
              <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                "Spooky action at a distance" -- Albert Einstein, 1935, describing quantum entanglement
                in the famous EPR paradox paper. Einstein found entanglement so counterintuitive that he
                believed quantum mechanics must be incomplete. Bell's theorem (1964) later proved Einstein wrong.
              </p>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
              Entanglement is a uniquely quantum phenomenon where two or more particles become correlated in such a way
              that the quantum state of each particle cannot be described independently. Measuring one particle
              instantaneously determines the state of the other, regardless of the distance separating them.
            </p>
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <LatexRenderer display math="|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)" />
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
              In the Bell state above, the two qubits are perfectly correlated: if you measure the first qubit and get |0&rang;,
              the second qubit will always be |0&rang; too. If you get |1&rang;, the second is always |1&rang;.
              This happens instantaneously, even if the qubits are light-years apart. However, no information is transmitted
              faster than light -- the outcomes are random, just perfectly correlated.
            </p>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-hover)', marginBottom: 10 }}>
              The Four Bell States
            </h4>
            <div style={{ textAlign: 'center', margin: '12px 0' }}>
              <LatexRenderer display math="|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}, \\quad |\\Phi^-\\rangle = \\frac{|00\\rangle - |11\\rangle}{\\sqrt{2}}" />
            </div>
            <div style={{ textAlign: 'center', margin: '12px 0' }}>
              <LatexRenderer display math="|\\Psi^+\\rangle = \\frac{|01\\rangle + |10\\rangle}{\\sqrt{2}}, \\quad |\\Psi^-\\rangle = \\frac{|01\\rangle - |10\\rangle}{\\sqrt{2}}" />
            </div>
          </div>
        </div>
      </div>

      {/* Decoherence */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">{t('quantum.decoherence')}</div>
        <div className="card-body">
          <div style={{ maxWidth: 800 }}>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
              Decoherence is the process by which a quantum system loses its quantum properties through
              interaction with the environment. Even the tiniest thermal vibration, electromagnetic field,
              or cosmic ray can cause a qubit to lose its coherent superposition, collapsing it to a classical state.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
              This is why quantum computers need extreme conditions: superconducting quantum processors operate
              at temperatures near absolute zero (about 15 millikelvin, or -273.135 degrees Celsius),
              colder than outer space. Ion trap computers use ultrahigh vacuum and electromagnetic fields
              to isolate individual atoms. Even with these measures, qubits typically maintain coherence
              for only microseconds to milliseconds.
            </p>
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <LatexRenderer display math="\\rho(t) = \\begin{pmatrix} \\rho_{00} & \\rho_{01}e^{-t/T_2} \\\\ \\rho_{10}e^{-t/T_2} & \\rho_{11} \\end{pmatrix}" />
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              where <LatexRenderer math="T_2" /> is the decoherence time -- the characteristic time over which quantum coherence decays.
              Quantum error correction is the key technique to combat decoherence, using many physical qubits
              to encode a single logical qubit.
            </p>
          </div>
        </div>
      </div>

      {/* No-Cloning Theorem */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">{t('quantum.noCloning')}</div>
        <div className="card-body">
          <div style={{ maxWidth: 800 }}>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
              The no-cloning theorem states that it is impossible to create an identical copy of an arbitrary
              unknown quantum state. This is a fundamental result with profound implications: it makes
              quantum key distribution secure (eavesdroppers cannot copy quantum states without disturbing them)
              and it is the reason quantum teleportation destroys the original state.
            </p>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-hover)', marginBottom: 10 }}>
              Proof Sketch (by contradiction)
            </h4>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 12 }}>
              Suppose a unitary cloning operation U exists such that:
            </p>
            <div style={{ textAlign: 'center', margin: '12px 0' }}>
              <LatexRenderer display math="U|\\psi\\rangle|0\\rangle = |\\psi\\rangle|\\psi\\rangle \\quad \\text{for all } |\\psi\\rangle" />
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 12 }}>
              Consider two states |&psi;&rang; and |&phi;&rang;. Applying U:
            </p>
            <div style={{ textAlign: 'center', margin: '12px 0' }}>
              <LatexRenderer display math="\\langle\\psi|\\phi\\rangle = \\langle\\psi|\\phi\\rangle^2" />
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              This equation only holds if <LatexRenderer math="\\langle\\psi|\\phi\\rangle = 0" /> or{' '}
              <LatexRenderer math="\\langle\\psi|\\phi\\rangle = 1" />, meaning the states must be either
              identical or orthogonal. Therefore, a universal cloning machine cannot exist.
            </p>
          </div>
        </div>
      </div>

      {/* Quantum vs Classical Comparison */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">{t('quantum.comparison')}</div>
        <div className="card-body" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid var(--accent)', color: 'var(--accent)', fontWeight: 600 }}>
                  {t('quantum.property')}
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid var(--accent)', color: 'var(--accent)', fontWeight: 600 }}>
                  {t('quantum.classical')}
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid var(--accent)', color: 'var(--accent)', fontWeight: 600 }}>
                  {t('quantum.quantumLabel')}
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Basic unit', 'Bit (0 or 1)', 'Qubit (superposition of |0> and |1>)'],
                ['State space', 'n bits = n states addressable', 'n qubits = 2^n amplitudes'],
                ['Operations', 'Logic gates (AND, OR, NOT)', 'Unitary matrices (H, X, CNOT)'],
                ['Copying', 'Freely copyable', 'No-cloning theorem forbids copying'],
                ['Measurement', 'Non-destructive', 'Collapses superposition'],
                ['Error correction', 'Simple redundancy', 'Quantum error correction codes'],
                ['Parallelism', 'Multiple processors', 'Quantum parallelism (superposition)'],
                ['Key advantage', 'Deterministic, reliable', 'Exponential state space, interference'],
                ['Temperature', 'Room temperature', 'Near absolute zero (~15 mK)'],
                ['Maturity', 'Decades of optimization', 'Early-stage, noisy devices (NISQ era)'],
              ].map(([prop, classical, quantum], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-primary)' }}>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{prop}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>{classical}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>{quantum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="card-header">{t('quantum.timeline')}</div>
        <div className="card-body">
          <div style={{ position: 'relative', paddingLeft: 30 }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
            {MILESTONES.map((m, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 20, paddingLeft: 20 }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute', left: -24, top: 4,
                  width: 12, height: 12, borderRadius: '50%',
                  background: m.color, border: '2px solid var(--bg-secondary)',
                  boxShadow: `0 0 8px ${m.color}60`,
                }} />
                <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, color: m.color, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, flexShrink: 0 }}>
                    {m.year}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>{m.event}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     MAIN RENDER
     ════════════════════════════════════════════════════════════ */
  return (
    <>
      <div className="page-header">
        <div>
          <h2>{t('quantum.title')}</h2>
          <div className="subtitle">{t('quantum.subtitle')}</div>
        </div>
      </div>
      <div className="page-body">
        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 20 }}>
          {TABS.map(tab => (
            <button key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'qubits' && renderQubitsTab()}
        {activeTab === 'gates' && renderGatesTab()}
        {activeTab === 'circuits' && renderCircuitsTab()}
        {activeTab === 'algorithms' && renderAlgorithmsTab()}
        {activeTab === 'concepts' && renderConceptsTab()}
      </div>
    </>
  );
}
