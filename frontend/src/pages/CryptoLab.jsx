import { useState } from 'react';
import LatexRenderer from '../components/LatexRenderer';
import { useI18n } from '../i18n/context';

/* ── Crypto Utility Functions ──────────────────────────────────── */

function caesarEncrypt(text, shift) {
  const s = ((shift % 26) + 26) % 26;
  return text.split('').map(ch => {
    if (/[a-z]/.test(ch)) return String.fromCharCode(((ch.charCodeAt(0) - 97 + s) % 26) + 97);
    if (/[A-Z]/.test(ch)) return String.fromCharCode(((ch.charCodeAt(0) - 65 + s) % 26) + 65);
    return ch;
  }).join('');
}

function caesarSteps(text, shift) {
  const s = ((shift % 26) + 26) % 26;
  return text.split('').map(ch => {
    if (/[a-zA-Z]/.test(ch)) {
      const base = ch === ch.toUpperCase() ? 65 : 97;
      const orig = ch.charCodeAt(0) - base;
      const shifted = (orig + s) % 26;
      return { original: ch, code: orig, shifted, result: String.fromCharCode(shifted + base) };
    }
    return { original: ch, code: null, shifted: null, result: ch };
  });
}

function vigenereEncrypt(text, keyword) {
  if (!keyword) return text;
  const key = keyword.toUpperCase();
  let ki = 0;
  return text.split('').map(ch => {
    if (/[a-zA-Z]/.test(ch)) {
      const base = ch === ch.toUpperCase() ? 65 : 97;
      const p = ch.charCodeAt(0) - base;
      const k = key.charCodeAt(ki % key.length) - 65;
      ki++;
      return String.fromCharCode(((p + k) % 26) + base);
    }
    return ch;
  }).join('');
}

function vigenereSteps(text, keyword) {
  if (!keyword) return [];
  const key = keyword.toUpperCase();
  let ki = 0;
  return text.split('').map(ch => {
    if (/[a-zA-Z]/.test(ch)) {
      const base = ch === ch.toUpperCase() ? 65 : 97;
      const p = ch.charCodeAt(0) - base;
      const k = key.charCodeAt(ki % key.length) - 65;
      const keyChar = key[ki % key.length];
      ki++;
      const c = (p + k) % 26;
      return { original: ch, keyChar, pVal: p, kVal: k, result: String.fromCharCode(c + base) };
    }
    return { original: ch, keyChar: '-', pVal: null, kVal: null, result: ch };
  });
}

function simpleHash(text) {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) & 0xFFFFFFFF;
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function simpleHash256(text) {
  const blocks = [];
  for (let b = 0; b < 8; b++) {
    let h = 5381 + b * 33;
    for (let i = 0; i < text.length; i++) {
      h = ((h << 5) + h + text.charCodeAt(i) + b * 7) & 0xFFFFFFFF;
    }
    blocks.push((h >>> 0).toString(16).padStart(8, '0'));
  }
  return blocks.join('');
}

function modPow(base, exp, mod) {
  let result = 1n;
  base = BigInt(base) % BigInt(mod);
  exp = BigInt(exp);
  const m = BigInt(mod);
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % m;
    exp = exp / 2n;
    base = (base * base) % m;
  }
  return Number(result);
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function modInverse(e, phi) {
  let [old_r, r] = [phi, e];
  let [old_s, s] = [0, 1];
  while (r !== 0) {
    const q = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return ((old_s % phi) + phi) % phi;
}

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
}

const SMALL_PRIMES = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97];

/* ── Inline Style Constants ────────────────────────────────────── */

const S = {
  mathBlock: {
    padding: '12px 16px', margin: '10px 0', background: 'var(--bg-primary)',
    borderRadius: 8, border: '1px solid var(--border)', textAlign: 'center',
  },
  badge: (color) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 12,
    fontSize: 11, fontWeight: 700, background: `${color}22`, color,
    textTransform: 'uppercase', letterSpacing: 0.5,
  }),
  stepBox: {
    display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0',
  },
  stepItem: (accent) => ({
    padding: '4px 8px', borderRadius: 6, fontSize: 12,
    background: accent ? 'var(--accent)' : 'var(--bg-primary)',
    color: accent ? '#fff' : 'var(--text-primary)',
    border: '1px solid var(--border)', fontFamily: "'JetBrains Mono', monospace",
  }),
  flowArrow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--accent)', fontSize: 20, margin: '0 4px',
  },
  flowBox: (color) => ({
    padding: '10px 14px', borderRadius: 8, textAlign: 'center', fontSize: 12,
    fontWeight: 600, border: `2px solid ${color}`,
    background: `${color}15`, color, minWidth: 80,
  }),
  diagram: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexWrap: 'wrap', gap: 4, padding: '16px 8px',
  },
  sectionTitle: {
    fontSize: 16, fontWeight: 700, marginTop: 20, marginBottom: 10,
    color: 'var(--accent-hover)', borderBottom: '1px solid var(--border)',
    paddingBottom: 6,
  },
  explanation: {
    fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 12,
  },
  gridRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16,
  },
  resultBox: {
    padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 8,
    border: '1px solid var(--accent)', fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14, wordBreak: 'break-all', marginTop: 8,
  },
  tableCell: {
    padding: '6px 8px', textAlign: 'center', border: '1px solid var(--border)',
    fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
  },
  tableHeader: {
    padding: '6px 8px', textAlign: 'center', border: '1px solid var(--border)',
    fontSize: 11, fontWeight: 700, background: 'var(--accent)', color: '#fff',
  },
  personBox: (color) => ({
    flex: 1, padding: 16, borderRadius: 12, textAlign: 'center',
    border: `2px solid ${color}`, background: `${color}10`,
    minWidth: 140,
  }),
};

/* ── Sub-Components ────────────────────────────────────────────── */

function AlphabetWheel({ shift }) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const s = ((shift % 26) + 26) % 26;
  return (
    <div style={{ overflowX: 'auto', marginBottom: 12 }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody>
          <tr>
            {alphabet.split('').map((ch, i) => (
              <td key={`o-${i}`} style={{
                ...S.tableCell, background: 'var(--bg-secondary)', fontWeight: 600,
                color: 'var(--text-primary)', fontSize: 12,
              }}>{ch}</td>
            ))}
          </tr>
          <tr>
            {alphabet.split('').map((_, i) => (
              <td key={`a-${i}`} style={{
                ...S.tableCell, color: 'var(--accent)', fontWeight: 700, fontSize: 12,
                background: i < s ? 'var(--accent)' + '22' : 'transparent',
              }}>
                {alphabet[(i + s) % 26]}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function VigenereTable({ keyword }) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const keyChars = (keyword || 'KEY').toUpperCase().replace(/[^A-Z]/g, '').split('');
  const uniqueRows = [...new Set(keyChars)];

  return (
    <div style={{ overflowX: 'auto', marginBottom: 12 }}>
      <table style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={S.tableHeader}></th>
            {alphabet.split('').map((ch, i) => (
              <th key={i} style={S.tableHeader}>{ch}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {uniqueRows.map((rowCh, ri) => {
            const shift = rowCh.charCodeAt(0) - 65;
            return (
              <tr key={ri}>
                <td style={{ ...S.tableHeader }}>{rowCh}</td>
                {alphabet.split('').map((_, ci) => (
                  <td key={ci} style={{
                    ...S.tableCell,
                    background: ci === shift ? 'var(--accent)' + '33' : 'transparent',
                  }}>
                    {alphabet[(ci + shift) % 26]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FlowDiagram({ steps, color }) {
  return (
    <div style={S.diagram}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={S.flowBox(color || 'var(--accent)')}>{step}</div>
          {i < steps.length - 1 && <div style={S.flowArrow}> &rarr; </div>}
        </div>
      ))}
    </div>
  );
}

function ComparisonRow({ name, security, keySize, speed, useCase, color }) {
  return (
    <tr>
      <td style={{ ...S.tableCell, fontWeight: 700, color: 'var(--text-primary)' }}>{name}</td>
      <td style={{ ...S.tableCell }}>
        <span style={S.badge(color)}>{security}</span>
      </td>
      <td style={{ ...S.tableCell, color: 'var(--text-muted)' }}>{keySize}</td>
      <td style={{ ...S.tableCell, color: 'var(--text-muted)' }}>{speed}</td>
      <td style={{ ...S.tableCell, color: 'var(--text-muted)', textAlign: 'left', fontSize: 11 }}>{useCase}</td>
    </tr>
  );
}

/* ── Main Component ────────────────────────────────────────────── */

export default function CryptoLab() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('classical');

  /* Caesar state */
  const [caesarText, setCaesarText] = useState('HELLO WORLD');
  const [caesarShift, setCaesarShift] = useState(3);
  const [showCaesarSteps, setShowCaesarSteps] = useState(false);

  /* Vigenere state */
  const [vigText, setVigText] = useState('ATTACKATDAWN');
  const [vigKey, setVigKey] = useState('LEMON');
  const [showVigSteps, setShowVigSteps] = useState(false);
  const [showVigTable, setShowVigTable] = useState(false);

  /* AES state */
  const [aesText, setAesText] = useState('Secret Message');
  const [aesKey, setAesKey] = useState('MySecretKey12345');
  const [aesEncrypted, setAesEncrypted] = useState('');

  /* RSA state */
  const [rsaP, setRsaP] = useState(61);
  const [rsaQ, setRsaQ] = useState(53);
  const [rsaMsg, setRsaMsg] = useState(42);
  const [rsaResult, setRsaResult] = useState(null);

  /* DH state */
  const [dhP, setDhP] = useState(23);
  const [dhG, setDhG] = useState(5);
  const [dhA, setDhA] = useState(6);
  const [dhB, setDhB] = useState(15);

  /* Hash state */
  const [hashText, setHashText] = useState('Hello');
  const [hashText2, setHashText2] = useState('Hello!');

  const TABS = [
    { id: 'classical', label: t('crypto.classical') },
    { id: 'symmetric', label: t('crypto.symmetric') },
    { id: 'asymmetric', label: t('crypto.asymmetric') },
    { id: 'hashing', label: t('crypto.hashing') },
    { id: 'analysis', label: t('crypto.analysis') },
  ];

  /* ── AES simple demo (XOR-based simulation) ──────────────── */
  const runAesDemo = () => {
    let result = '';
    for (let i = 0; i < aesText.length; i++) {
      const tc = aesText.charCodeAt(i);
      const kc = aesKey.charCodeAt(i % aesKey.length);
      result += String.fromCharCode(tc ^ kc);
    }
    const hex = Array.from(result).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    setAesEncrypted(hex);
  };

  /* ── RSA computation ─────────────────────────────────────── */
  const computeRSA = () => {
    if (!isPrime(rsaP) || !isPrime(rsaQ)) {
      setRsaResult({ error: 'Both p and q must be prime numbers' });
      return;
    }
    if (rsaP === rsaQ) {
      setRsaResult({ error: 'p and q must be different primes' });
      return;
    }
    const n = rsaP * rsaQ;
    const phi = (rsaP - 1) * (rsaQ - 1);
    let e = 65537;
    if (e >= phi) {
      for (e = 3; e < phi; e += 2) {
        if (gcd(e, phi) === 1) break;
      }
    }
    if (gcd(e, phi) !== 1) {
      for (e = 3; e < phi; e++) {
        if (gcd(e, phi) === 1) break;
      }
    }
    const d = modInverse(e, phi);
    const msg = rsaMsg % n;
    const encrypted = modPow(msg, e, n);
    const decrypted = modPow(encrypted, d, n);
    setRsaResult({ n, phi, e, d, msg, encrypted, decrypted });
  };

  /* ── DH computation ──────────────────────────────────────── */
  const dhCompute = () => {
    const A = modPow(dhG, dhA, dhP);
    const B = modPow(dhG, dhB, dhP);
    const sA = modPow(B, dhA, dhP);
    const sB = modPow(A, dhB, dhP);
    return { A, B, sharedA: sA, sharedB: sB };
  };
  const dhResult = dhCompute();

  /* ── TAB: Classical Ciphers ──────────────────────────────── */
  const renderClassical = () => (
    <div>
      {/* Caesar Cipher */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">{t('crypto.caesar')}</div>
        <div className="card-body">
          <p style={S.explanation}>
            The Caesar cipher is one of the oldest known encryption techniques, used by Julius Caesar
            to communicate with his generals. It works by shifting each letter in the plaintext by a
            fixed number of positions in the alphabet. Despite its historical importance, it is trivially
            broken today because there are only 26 possible keys.
          </p>

          <div style={S.mathBlock}>
            <LatexRenderer math="C = (P + k) \mod 26" display />
          </div>
          <p style={{ ...S.explanation, textAlign: 'center', marginTop: 4 }}>
            Where C = ciphertext position, P = plaintext position, k = shift key
          </p>

          <h4 style={S.sectionTitle}>{t('crypto.tryIt')}</h4>
          <div style={S.gridRow}>
            <div className="input-group">
              <label>{t('crypto.plaintext')}</label>
              <input className="input" value={caesarText}
                onChange={e => setCaesarText(e.target.value.toUpperCase())}
                placeholder="Enter text..." />
            </div>
            <div className="input-group">
              <label>{t('crypto.shiftKey')} (0-25)</label>
              <input className="input" type="number" min={0} max={25}
                value={caesarShift}
                onChange={e => setCaesarShift(Number(e.target.value))} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
              {t('crypto.result')}
            </label>
            <div style={S.resultBox}>{caesarEncrypt(caesarText, caesarShift)}</div>
          </div>

          {/* Alphabet Wheel */}
          <h4 style={S.sectionTitle}>{t('crypto.alphabetWheel')}</h4>
          <p style={S.explanation}>
            The top row shows the original alphabet. The bottom row shows the shifted alphabet.
            Each letter in your message maps from the top row to the bottom row.
          </p>
          <AlphabetWheel shift={caesarShift} />

          {/* Step-by-step */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button className="btn btn-secondary btn-sm"
              onClick={() => setShowCaesarSteps(!showCaesarSteps)}>
              {showCaesarSteps ? t('crypto.hideSteps') : t('crypto.showSteps')}
            </button>
          </div>

          {showCaesarSteps && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 12 }}>
                <thead>
                  <tr>
                    <th style={S.tableHeader}>{t('crypto.letter')}</th>
                    <th style={S.tableHeader}>{t('crypto.position')}</th>
                    <th style={S.tableHeader}>{t('crypto.operation')}</th>
                    <th style={S.tableHeader}>{t('crypto.newPosition')}</th>
                    <th style={S.tableHeader}>{t('crypto.result')}</th>
                  </tr>
                </thead>
                <tbody>
                  {caesarSteps(caesarText, caesarShift).filter(s => s.code !== null).map((step, i) => (
                    <tr key={i}>
                      <td style={{ ...S.tableCell, fontWeight: 700, color: 'var(--accent)' }}>{step.original}</td>
                      <td style={S.tableCell}>{step.code}</td>
                      <td style={{ ...S.tableCell, color: 'var(--text-muted)' }}>
                        ({step.code} + {caesarShift}) mod 26
                      </td>
                      <td style={S.tableCell}>{step.shifted}</td>
                      <td style={{ ...S.tableCell, fontWeight: 700, color: 'var(--success)' }}>{step.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Vulnerability */}
          <h4 style={S.sectionTitle}>{t('crypto.vulnerability')}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="exercise-card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#ef4444' }}>
                Frequency Analysis
              </div>
              <p style={S.explanation}>
                In English, the letter 'E' appears about 12.7% of the time. An attacker can count
                letter frequencies in the ciphertext and compare them to known language statistics
                to deduce the shift value.
              </p>
            </div>
            <div className="exercise-card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#ef4444' }}>
                Brute Force (Only 26 Keys)
              </div>
              <p style={S.explanation}>
                Since there are only 26 possible shift values, an attacker can simply try all of them
                and read each result to find the original message. This takes seconds by hand and
                microseconds by computer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vigenere Cipher */}
      <div className="card">
        <div className="card-header">{t('crypto.vigenere')}</div>
        <div className="card-body">
          <p style={S.explanation}>
            The Vigenere cipher improves upon Caesar by using a keyword instead of a single shift.
            Each letter of the keyword determines the shift for the corresponding letter of the plaintext.
            The keyword repeats to cover the entire message. It was considered unbreakable for centuries
            and earned the nickname "le chiffre indechiffrable" (the indecipherable cipher).
          </p>

          <div style={S.mathBlock}>
            <LatexRenderer math="C_i = (P_i + K_{i \bmod m}) \bmod 26" display />
          </div>
          <p style={{ ...S.explanation, textAlign: 'center', marginTop: 4 }}>
            Where m = keyword length, K = keyword letter positions
          </p>

          <h4 style={S.sectionTitle}>{t('crypto.tryIt')}</h4>
          <div style={S.gridRow}>
            <div className="input-group">
              <label>{t('crypto.plaintext')}</label>
              <input className="input" value={vigText}
                onChange={e => setVigText(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                placeholder="Enter text..." />
            </div>
            <div className="input-group">
              <label>{t('crypto.keyword')}</label>
              <input className="input" value={vigKey}
                onChange={e => setVigKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                placeholder="Enter keyword..." />
            </div>
          </div>

          {/* Keyword repetition visual */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
              {t('crypto.keywordRepetition')}
            </label>
            <div style={S.stepBox}>
              {vigText.split('').map((ch, i) => (
                <div key={i} style={{ textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{ch}</div>
                  <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                    {vigKey[i % vigKey.length] || '?'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
              {t('crypto.result')}
            </label>
            <div style={S.resultBox}>{vigenereEncrypt(vigText, vigKey)}</div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button className="btn btn-secondary btn-sm"
              onClick={() => setShowVigSteps(!showVigSteps)}>
              {showVigSteps ? t('crypto.hideSteps') : t('crypto.showSteps')}
            </button>
            <button className="btn btn-secondary btn-sm"
              onClick={() => setShowVigTable(!showVigTable)}>
              {showVigTable ? t('crypto.hideTable') : t('crypto.showTable')}
            </button>
          </div>

          {showVigSteps && (
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={S.tableHeader}>{t('crypto.letter')}</th>
                    <th style={S.tableHeader}>{t('crypto.keyLetter')}</th>
                    <th style={S.tableHeader}>P</th>
                    <th style={S.tableHeader}>K</th>
                    <th style={S.tableHeader}>{t('crypto.operation')}</th>
                    <th style={S.tableHeader}>{t('crypto.result')}</th>
                  </tr>
                </thead>
                <tbody>
                  {vigenereSteps(vigText, vigKey).filter(s => s.pVal !== null).map((step, i) => (
                    <tr key={i}>
                      <td style={{ ...S.tableCell, fontWeight: 700, color: 'var(--text-primary)' }}>{step.original}</td>
                      <td style={{ ...S.tableCell, color: 'var(--accent)', fontWeight: 600 }}>{step.keyChar}</td>
                      <td style={S.tableCell}>{step.pVal}</td>
                      <td style={S.tableCell}>{step.kVal}</td>
                      <td style={{ ...S.tableCell, color: 'var(--text-muted)' }}>
                        ({step.pVal}+{step.kVal}) mod 26 = {(step.pVal + step.kVal) % 26}
                      </td>
                      <td style={{ ...S.tableCell, fontWeight: 700, color: 'var(--success)' }}>{step.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showVigTable && (
            <div>
              <h4 style={S.sectionTitle}>{t('crypto.vigenereTableTitle')}</h4>
              <p style={S.explanation}>
                The Vigenere table (tabula recta) shows all 26 Caesar cipher alphabets.
                To encrypt, find the plaintext letter column and keyword letter row -- the intersection
                is the ciphertext letter. Only rows used by your keyword are shown below.
              </p>
              <VigenereTable keyword={vigKey} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* ── TAB: Symmetric Encryption ───────────────────────────── */
  const renderSymmetric = () => (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">{t('crypto.aes')}</div>
        <div className="card-body">
          <p style={S.explanation}>
            AES (Advanced Encryption Standard) is the most widely used symmetric encryption algorithm
            in the world. Adopted by the U.S. government in 2001, it replaced DES and provides
            excellent security with high performance. AES operates on fixed-size blocks of 128 bits
            and supports key sizes of 128, 192, or 256 bits.
          </p>

          <h4 style={S.sectionTitle}>{t('crypto.aesProcess')}</h4>
          <p style={S.explanation}>
            AES encryption consists of multiple rounds, each applying four transformations to the data.
            AES-128 uses 10 rounds, AES-192 uses 12, and AES-256 uses 14. Each round makes the
            relationship between plaintext and ciphertext increasingly complex.
          </p>

          {/* AES Pipeline Flowchart */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              ...S.diagram, flexDirection: 'column', gap: 12,
              padding: 20, background: 'var(--bg-primary)', borderRadius: 12,
              border: '1px solid var(--border)',
            }}>
              <div style={S.flowBox('#22d3ee')}>Plaintext (128-bit block)</div>
              <div style={{ color: 'var(--accent)', fontSize: 18 }}>&darr;</div>
              <div style={S.flowBox('#8b5cf6')}>Initial AddRoundKey</div>
              <div style={{ color: 'var(--accent)', fontSize: 18 }}>&darr;</div>

              <div style={{
                border: '2px dashed var(--accent)', borderRadius: 12, padding: 16,
                width: '100%', maxWidth: 500, textAlign: 'center',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                  Repeat for N rounds (10 / 12 / 14)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <div style={S.flowBox('#f59e0b')}>SubBytes</div>
                  <div style={S.flowArrow}>&rarr;</div>
                  <div style={S.flowBox('#10b981')}>ShiftRows</div>
                  <div style={S.flowArrow}>&rarr;</div>
                  <div style={S.flowBox('#3b82f6')}>MixColumns</div>
                  <div style={S.flowArrow}>&rarr;</div>
                  <div style={S.flowBox('#8b5cf6')}>AddRoundKey</div>
                </div>
              </div>

              <div style={{ color: 'var(--accent)', fontSize: 18 }}>&darr;</div>
              <div style={S.flowBox('#ef4444')}>Ciphertext (128-bit block)</div>
            </div>
          </div>

          {/* AES Steps Explanation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div className="exercise-card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#f59e0b' }}>
                SubBytes
              </div>
              <p style={S.explanation}>
                Each byte of the state is replaced with a corresponding byte from a fixed lookup table
                called the S-box. This provides non-linearity -- the crucial property that prevents
                algebraic attacks. The S-box is based on multiplicative inverses in GF(2^8).
              </p>
            </div>
            <div className="exercise-card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#10b981' }}>
                ShiftRows
              </div>
              <p style={S.explanation}>
                Rows of the 4x4 state matrix are cyclically shifted. Row 0 stays, row 1 shifts left
                by 1, row 2 by 2, row 3 by 3. This ensures that columns from one round are spread
                across multiple columns in subsequent rounds, providing diffusion.
              </p>
            </div>
            <div className="exercise-card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#3b82f6' }}>
                MixColumns
              </div>
              <p style={S.explanation}>
                Each column of the state is treated as a polynomial over GF(2^8) and multiplied with
                a fixed polynomial. This mixes the bytes within each column, providing further diffusion.
                Skipped in the final round.
              </p>
            </div>
            <div className="exercise-card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#8b5cf6' }}>
                AddRoundKey
              </div>
              <p style={S.explanation}>
                The state is XORed with the round key derived from the cipher key through key expansion.
                This is the only step that introduces the key into the cipher and is therefore essential
                for the security of the algorithm.
              </p>
            </div>
          </div>

          {/* Key size comparison */}
          <h4 style={S.sectionTitle}>{t('crypto.keySizeComparison')}</h4>
          <div style={{ overflowX: 'auto', marginBottom: 20 }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={S.tableHeader}>{t('crypto.variant')}</th>
                  <th style={S.tableHeader}>{t('crypto.keySize')}</th>
                  <th style={S.tableHeader}>{t('crypto.rounds')}</th>
                  <th style={S.tableHeader}>{t('crypto.security')}</th>
                  <th style={S.tableHeader}>{t('crypto.bruteForce')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...S.tableCell, fontWeight: 700 }}>AES-128</td>
                  <td style={S.tableCell}>128 bits</td>
                  <td style={S.tableCell}>10</td>
                  <td style={S.tableCell}><span style={S.badge('#10b981')}>Strong</span></td>
                  <td style={{ ...S.tableCell, fontSize: 10 }}>3.4 x 10^38 keys</td>
                </tr>
                <tr>
                  <td style={{ ...S.tableCell, fontWeight: 700 }}>AES-192</td>
                  <td style={S.tableCell}>192 bits</td>
                  <td style={S.tableCell}>12</td>
                  <td style={S.tableCell}><span style={S.badge('#10b981')}>Very Strong</span></td>
                  <td style={{ ...S.tableCell, fontSize: 10 }}>6.2 x 10^57 keys</td>
                </tr>
                <tr>
                  <td style={{ ...S.tableCell, fontWeight: 700 }}>AES-256</td>
                  <td style={S.tableCell}>256 bits</td>
                  <td style={S.tableCell}>14</td>
                  <td style={S.tableCell}><span style={S.badge('#10b981')}>Maximum</span></td>
                  <td style={{ ...S.tableCell, fontSize: 10 }}>1.1 x 10^77 keys</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Real-world uses */}
          <h4 style={S.sectionTitle}>{t('crypto.realWorldUses')}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { name: 'HTTPS/TLS', desc: 'Encrypts all web traffic between browsers and servers', color: '#22d3ee' },
              { name: 'Disk Encryption', desc: 'BitLocker, FileVault, LUKS encrypt entire drives', color: '#8b5cf6' },
              { name: 'WiFi (WPA2/3)', desc: 'Secures wireless network communications', color: '#10b981' },
              { name: 'VPNs', desc: 'Creates encrypted tunnels for secure remote access', color: '#f59e0b' },
            ].map((use, i) => (
              <div key={i} className="exercise-card" style={{ padding: 12, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: use.color }}>{use.name}</div>
                <p style={{ ...S.explanation, fontSize: 11, marginBottom: 0 }}>{use.desc}</p>
              </div>
            ))}
          </div>

          {/* Interactive Demo */}
          <h4 style={S.sectionTitle}>{t('crypto.tryIt')}</h4>
          <p style={S.explanation}>
            This demo uses XOR-based encryption to illustrate how symmetric ciphers work.
            Real AES uses the full SubBytes/ShiftRows/MixColumns/AddRoundKey pipeline shown above.
          </p>
          <div style={S.gridRow}>
            <div className="input-group">
              <label>{t('crypto.plaintext')}</label>
              <input className="input" value={aesText}
                onChange={e => setAesText(e.target.value)} />
            </div>
            <div className="input-group">
              <label>{t('crypto.encryptionKey')}</label>
              <input className="input" value={aesKey}
                onChange={e => setAesKey(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={runAesDemo} style={{ marginBottom: 12 }}>
            {t('crypto.encrypt')}
          </button>
          {aesEncrypted && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                {t('crypto.encryptedHex')}
              </label>
              <div style={S.resultBox}>{aesEncrypted}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* ── TAB: Asymmetric Encryption ──────────────────────────── */
  const renderAsymmetric = () => (
    <div>
      {/* RSA */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">{t('crypto.rsa')}</div>
        <div className="card-body">
          <p style={S.explanation}>
            RSA (Rivest-Shamir-Adleman) is the most widely used asymmetric encryption algorithm.
            Its security relies on the mathematical difficulty of factoring the product of two large
            prime numbers. While multiplying two primes is easy, factoring their product back into
            the original primes is computationally infeasible for large numbers (1024+ bits).
          </p>

          {/* RSA Math */}
          <h4 style={S.sectionTitle}>{t('crypto.rsaMath')}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={S.mathBlock}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>1. Compute modulus</div>
              <LatexRenderer math="n = p \times q" display />
            </div>
            <div style={S.mathBlock}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>2. Euler's totient</div>
              <LatexRenderer math="\phi(n) = (p-1)(q-1)" display />
            </div>
            <div style={S.mathBlock}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>3. Key relationship</div>
              <LatexRenderer math="e \cdot d \equiv 1 \pmod{\phi(n)}" display />
            </div>
            <div style={S.mathBlock}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>4. Encrypt & Decrypt</div>
              <LatexRenderer math="C = M^e \bmod n" display />
              <LatexRenderer math="M = C^d \bmod n" display />
            </div>
          </div>

          {/* Public vs Private Key Flow */}
          <h4 style={S.sectionTitle}>{t('crypto.keyFlow')}</h4>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 16, flexWrap: 'wrap', padding: 20,
            background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border)',
            marginBottom: 16,
          }}>
            <div style={S.personBox('#3b82f6')}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>Alice</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('crypto.sender')}</div>
              <div style={{
                marginTop: 8, padding: '6px 10px', borderRadius: 6,
                background: '#3b82f622', fontSize: 11, fontWeight: 600,
              }}>
                {t('crypto.hasBobPublicKey')}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#10b981', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                {t('crypto.encryptedMessage')}
              </div>
              <div style={{ fontSize: 28, color: 'var(--accent)' }}>&rarr;</div>
              <div style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 11,
                background: '#10b98122', color: '#10b981', fontWeight: 600, marginTop: 4,
              }}>
                C = M^e mod n
              </div>
            </div>

            <div style={S.personBox('#8b5cf6')}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>Bob</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('crypto.receiver')}</div>
              <div style={{
                marginTop: 8, padding: '6px 10px', borderRadius: 6,
                background: '#8b5cf622', fontSize: 11, fontWeight: 600,
              }}>
                {t('crypto.hasPrivateKey')}
              </div>
            </div>
          </div>

          {/* Interactive RSA */}
          <h4 style={S.sectionTitle}>{t('crypto.tryIt')}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div className="input-group">
              <label>p ({t('crypto.prime')})</label>
              <input className="input" type="number" value={rsaP}
                onChange={e => setRsaP(Number(e.target.value))} />
              {!isPrime(rsaP) && rsaP > 1 && (
                <span style={{ color: '#ef4444', fontSize: 11 }}>{t('crypto.notPrime')}</span>
              )}
            </div>
            <div className="input-group">
              <label>q ({t('crypto.prime')})</label>
              <input className="input" type="number" value={rsaQ}
                onChange={e => setRsaQ(Number(e.target.value))} />
              {!isPrime(rsaQ) && rsaQ > 1 && (
                <span style={{ color: '#ef4444', fontSize: 11 }}>{t('crypto.notPrime')}</span>
              )}
            </div>
            <div className="input-group">
              <label>{t('crypto.message')} (M &lt; p*q)</label>
              <input className="input" type="number" value={rsaMsg}
                onChange={e => setRsaMsg(Number(e.target.value))} />
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t('crypto.suggestedPrimes')}:{' '}
              {SMALL_PRIMES.slice(10).map((p, i) => (
                <button key={i} className="btn btn-sm" style={{
                  padding: '1px 6px', margin: '0 2px', fontSize: 11,
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 4,
                }} onClick={() => {
                  if (isPrime(rsaP) && rsaP !== p) setRsaQ(p);
                  else setRsaP(p);
                }}>{p}</button>
              ))}
            </span>
          </div>

          <button className="btn btn-primary" onClick={computeRSA} style={{ marginBottom: 12 }}>
            {t('crypto.computeRSA')}
          </button>

          {rsaResult && !rsaResult.error && (
            <div style={{
              padding: 16, background: 'var(--bg-primary)', borderRadius: 12,
              border: '1px solid var(--border)', marginBottom: 16,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={S.mathBlock}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>n = p x q</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {rsaResult.n}
                  </div>
                </div>
                <div style={S.mathBlock}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>&phi;(n) = (p-1)(q-1)</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {rsaResult.phi}
                  </div>
                </div>
                <div style={S.mathBlock}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {t('crypto.publicKey')} (e)
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>
                    {rsaResult.e}
                  </div>
                </div>
                <div style={S.mathBlock}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {t('crypto.privateKey')} (d)
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>
                    {rsaResult.d}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, ...S.mathBlock, borderColor: '#10b981' }}>
                  <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>{t('crypto.encrypted')}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0' }}>
                    {rsaResult.msg}^{rsaResult.e} mod {rsaResult.n}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {rsaResult.encrypted}
                  </div>
                </div>
                <div style={{ flex: 1, ...S.mathBlock, borderColor: '#8b5cf6' }}>
                  <div style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 600 }}>{t('crypto.decrypted')}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0' }}>
                    {rsaResult.encrypted}^{rsaResult.d} mod {rsaResult.n}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>
                    {rsaResult.decrypted}
                  </div>
                </div>
              </div>

              {rsaResult.msg === rsaResult.decrypted && (
                <div style={{
                  marginTop: 10, padding: '8px 14px', borderRadius: 8,
                  background: '#10b98122', color: '#10b981', fontSize: 12, fontWeight: 600,
                  textAlign: 'center',
                }}>
                  {t('crypto.rsaSuccess')}
                </div>
              )}
            </div>
          )}

          {rsaResult?.error && (
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: '#ef444422', color: '#ef4444', fontSize: 13,
              marginBottom: 12,
            }}>
              {rsaResult.error}
            </div>
          )}

          {/* Why RSA is secure */}
          <h4 style={S.sectionTitle}>{t('crypto.whySecure')}</h4>
          <div className="exercise-card" style={{ padding: 14, marginBottom: 16 }}>
            <p style={S.explanation}>
              RSA security rests on the <strong>integer factorization problem</strong>. Given n = p x q where
              p and q are large primes (~300 digits each), finding p and q from n alone is computationally
              infeasible with current technology. The best known classical algorithms (General Number Field
              Sieve) require sub-exponential time. For a 2048-bit RSA key, brute-force factorization would
              take billions of years with current hardware.
            </p>
            <div style={S.mathBlock}>
              <LatexRenderer math="n = p \times q \quad \text{(easy: milliseconds)}" display />
            </div>
            <div style={S.mathBlock}>
              <LatexRenderer math="p, q = \text{factor}(n) \quad \text{(hard: billions of years for large } n \text{)}" display />
            </div>
          </div>
        </div>
      </div>

      {/* Diffie-Hellman */}
      <div className="card">
        <div className="card-header">{t('crypto.diffieHellman')}</div>
        <div className="card-body">
          <p style={S.explanation}>
            Diffie-Hellman key exchange allows two parties to establish a shared secret over an insecure
            channel without ever transmitting the secret itself. Published in 1976, it was the first
            practical method for establishing a shared secret key over an unauthenticated communication
            channel. It relies on the discrete logarithm problem being computationally hard.
          </p>

          <h4 style={S.sectionTitle}>{t('crypto.parameters')}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div className="input-group">
              <label>p ({t('crypto.prime')})</label>
              <input className="input" type="number" value={dhP}
                onChange={e => setDhP(Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>g ({t('crypto.generator')})</label>
              <input className="input" type="number" value={dhG}
                onChange={e => setDhG(Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>a ({t('crypto.aliceSecret')})</label>
              <input className="input" type="number" value={dhA}
                onChange={e => setDhA(Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>b ({t('crypto.bobSecret')})</label>
              <input className="input" type="number" value={dhB}
                onChange={e => setDhB(Number(e.target.value))} />
            </div>
          </div>

          {/* DH Visual */}
          <div style={{
            display: 'flex', gap: 20, alignItems: 'stretch', justifyContent: 'center',
            flexWrap: 'wrap', padding: 20, background: 'var(--bg-primary)',
            borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16,
          }}>
            {/* Alice */}
            <div style={S.personBox('#3b82f6')}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Alice</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                {t('crypto.secretValue')}: a = {dhA}
              </div>
              <div style={{
                padding: '6px 10px', borderRadius: 6, background: '#3b82f622',
                fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginBottom: 8,
              }}>
                A = g^a mod p
              </div>
              <div style={{
                padding: '6px 10px', borderRadius: 6, background: '#3b82f633',
                fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
              }}>
                A = {dhG}^{dhA} mod {dhP} = {dhResult.A}
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                {t('crypto.computesShared')}:
              </div>
              <div style={{
                padding: '4px 8px', borderRadius: 6, background: '#10b98122',
                fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4,
              }}>
                B^a mod p = {dhResult.B}^{dhA} mod {dhP}
              </div>
              <div style={{
                marginTop: 4, padding: '6px 10px', borderRadius: 6,
                background: '#10b98133', fontSize: 16, fontWeight: 700,
                color: '#10b981', fontFamily: "'JetBrains Mono', monospace",
              }}>
                = {dhResult.sharedA}
              </div>
            </div>

            {/* Exchange arrows */}
            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              alignItems: 'center', gap: 12, minWidth: 100,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t('crypto.public')}: p={dhP}, g={dhG}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600 }}>A = {dhResult.A}</div>
                <div style={{ fontSize: 20, color: 'var(--accent)' }}>&rarr;</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, color: 'var(--accent)' }}>&larr;</div>
                <div style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 600 }}>B = {dhResult.B}</div>
              </div>
              <div style={{
                marginTop: 8, padding: '4px 10px', borderRadius: 6,
                background: dhResult.sharedA === dhResult.sharedB ? '#10b98122' : '#ef444422',
                color: dhResult.sharedA === dhResult.sharedB ? '#10b981' : '#ef4444',
                fontSize: 11, fontWeight: 700,
              }}>
                {dhResult.sharedA === dhResult.sharedB ? t('crypto.keysMatch') : t('crypto.keysMismatch')}
              </div>
            </div>

            {/* Bob */}
            <div style={S.personBox('#8b5cf6')}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Bob</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                {t('crypto.secretValue')}: b = {dhB}
              </div>
              <div style={{
                padding: '6px 10px', borderRadius: 6, background: '#8b5cf622',
                fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginBottom: 8,
              }}>
                B = g^b mod p
              </div>
              <div style={{
                padding: '6px 10px', borderRadius: 6, background: '#8b5cf633',
                fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
              }}>
                B = {dhG}^{dhB} mod {dhP} = {dhResult.B}
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                {t('crypto.computesShared')}:
              </div>
              <div style={{
                padding: '4px 8px', borderRadius: 6, background: '#10b98122',
                fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 4,
              }}>
                A^b mod p = {dhResult.A}^{dhB} mod {dhP}
              </div>
              <div style={{
                marginTop: 4, padding: '6px 10px', borderRadius: 6,
                background: '#10b98133', fontSize: 16, fontWeight: 700,
                color: '#10b981', fontFamily: "'JetBrains Mono', monospace",
              }}>
                = {dhResult.sharedB}
              </div>
            </div>
          </div>

          <div className="exercise-card" style={{ padding: 14 }}>
            <p style={S.explanation}>
              Both Alice and Bob arrive at the same shared secret ({dhResult.sharedA}) without
              ever transmitting it! An eavesdropper who sees p={dhP}, g={dhG}, A={dhResult.A},
              B={dhResult.B} would need to solve the discrete logarithm problem to find a or b,
              which is computationally infeasible for large numbers.
            </p>
            <div style={S.mathBlock}>
              <LatexRenderer math={`s = B^a \\bmod p = A^b \\bmod p = g^{ab} \\bmod p = ${dhResult.sharedA}`} display />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── TAB: Hashing ────────────────────────────────────────── */
  const renderHashing = () => {
    const hash1 = simpleHash(hashText);
    const hash1Full = simpleHash256(hashText);
    const hash2 = simpleHash(hashText2);
    const hash2Full = simpleHash256(hashText2);

    // Demonstrate avalanche: count differing hex chars
    const diffCount = hash1Full.split('').filter((c, i) => c !== hash2Full[i]).length;
    const diffPct = ((diffCount / hash1Full.length) * 100).toFixed(1);

    return (
      <div>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">{t('crypto.hashFunctions')}</div>
          <div className="card-body">
            <p style={S.explanation}>
              A cryptographic hash function takes an input of any size and produces a fixed-size output
              (the "hash" or "digest"). Hash functions are one-way: given a hash, it is computationally
              infeasible to find the original input. They are fundamental to digital signatures, password
              storage, data integrity verification, and blockchain technology.
            </p>

            {/* Hash Properties */}
            <h4 style={S.sectionTitle}>{t('crypto.hashProperties')}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div className="exercise-card" style={{ padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#22d3ee' }}>
                  Deterministic
                </div>
                <p style={S.explanation}>
                  The same input always produces the exact same hash output. No randomness is involved.
                  Hash("hello") will always equal the same value, on any computer, at any time.
                </p>
              </div>
              <div className="exercise-card" style={{ padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#f59e0b' }}>
                  Avalanche Effect
                </div>
                <p style={S.explanation}>
                  A tiny change in input (even a single bit) produces a drastically different hash.
                  "Hello" and "hello" produce completely unrelated hashes, making pattern detection impossible.
                </p>
              </div>
              <div className="exercise-card" style={{ padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#ef4444' }}>
                  One-Way (Pre-image Resistant)
                </div>
                <p style={S.explanation}>
                  Given a hash value, it is computationally infeasible to find any input that produces
                  that hash. You cannot "reverse" a hash function to recover the original data.
                </p>
              </div>
            </div>

            {/* Interactive Hash */}
            <h4 style={S.sectionTitle}>{t('crypto.tryIt')}</h4>
            <div style={S.gridRow}>
              <div className="input-group">
                <label>{t('crypto.inputText')} 1</label>
                <input className="input" value={hashText}
                  onChange={e => setHashText(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t('crypto.inputText')} 2</label>
                <input className="input" value={hashText2}
                  onChange={e => setHashText2(e.target.value)} />
              </div>
            </div>

            <div style={S.gridRow}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Hash (DJB2-short)
                </label>
                <div style={S.resultBox}>{hash1}</div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4, marginTop: 8 }}>
                  Hash (256-bit simulation)
                </label>
                <div style={{ ...S.resultBox, fontSize: 11 }}>{hash1Full}</div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Hash (DJB2-short)
                </label>
                <div style={S.resultBox}>{hash2}</div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4, marginTop: 8 }}>
                  Hash (256-bit simulation)
                </label>
                <div style={{ ...S.resultBox, fontSize: 11 }}>{hash2Full}</div>
              </div>
            </div>

            {/* Avalanche comparison */}
            <div style={{
              padding: 14, background: 'var(--bg-primary)', borderRadius: 10,
              border: '1px solid var(--border)', marginBottom: 16, textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--accent-hover)' }}>
                {t('crypto.avalancheEffect')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                {hash1Full.split('').map((c, i) => (
                  <span key={i} style={{
                    display: 'inline-block', width: 16, height: 22, lineHeight: '22px',
                    textAlign: 'center', fontSize: 11, borderRadius: 3,
                    fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                    background: c !== hash2Full[i] ? '#ef444433' : '#10b98122',
                    color: c !== hash2Full[i] ? '#ef4444' : '#10b981',
                    border: `1px solid ${c !== hash2Full[i] ? '#ef444444' : '#10b98133'}`,
                  }}>
                    {c}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {diffCount} / {hash1Full.length} characters differ ({diffPct}%)
                {hashText === hashText2 && ' — identical inputs produce identical hashes'}
              </div>
            </div>

            {/* Hash Pipeline */}
            <h4 style={S.sectionTitle}>{t('crypto.hashPipeline')}</h4>
            <FlowDiagram
              steps={['Input Data', 'Padding', 'Block Division', 'Compression Rounds', 'Final Hash']}
              color="#22d3ee"
            />

            {/* MD5 vs SHA-256 */}
            <h4 style={S.sectionTitle}>{t('crypto.md5VsSha')}</h4>
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={S.tableHeader}>{t('crypto.property')}</th>
                    <th style={S.tableHeader}>MD5</th>
                    <th style={S.tableHeader}>SHA-256</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ ...S.tableCell, fontWeight: 600 }}>{t('crypto.outputSize')}</td>
                    <td style={S.tableCell}>128 bits (32 hex chars)</td>
                    <td style={S.tableCell}>256 bits (64 hex chars)</td>
                  </tr>
                  <tr>
                    <td style={{ ...S.tableCell, fontWeight: 600 }}>{t('crypto.security')}</td>
                    <td style={S.tableCell}><span style={S.badge('#ef4444')}>Broken</span></td>
                    <td style={S.tableCell}><span style={S.badge('#10b981')}>Secure</span></td>
                  </tr>
                  <tr>
                    <td style={{ ...S.tableCell, fontWeight: 600 }}>{t('crypto.speed')}</td>
                    <td style={S.tableCell}>Faster</td>
                    <td style={S.tableCell}>Slower (more rounds)</td>
                  </tr>
                  <tr>
                    <td style={{ ...S.tableCell, fontWeight: 600 }}>{t('crypto.collisionResistance')}</td>
                    <td style={S.tableCell}><span style={S.badge('#ef4444')}>Collisions found (2004)</span></td>
                    <td style={S.tableCell}><span style={S.badge('#10b981')}>No known collisions</span></td>
                  </tr>
                  <tr>
                    <td style={{ ...S.tableCell, fontWeight: 600 }}>{t('crypto.useToday')}</td>
                    <td style={{ ...S.tableCell, color: '#ef4444' }}>Legacy checksums only</td>
                    <td style={{ ...S.tableCell, color: '#10b981' }}>TLS, Bitcoin, digital signatures</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Collision concept */}
            <h4 style={S.sectionTitle}>{t('crypto.collisions')}</h4>
            <div className="exercise-card" style={{ padding: 14 }}>
              <p style={S.explanation}>
                A <strong>collision</strong> occurs when two different inputs produce the same hash output.
                By the pigeonhole principle, collisions must exist (infinitely many inputs map to finite
                hash outputs), but a secure hash function makes finding them computationally infeasible.
              </p>
              <div style={S.mathBlock}>
                <LatexRenderer math="H(m_1) = H(m_2) \quad \text{where} \quad m_1 \neq m_2" display />
              </div>
              <p style={S.explanation}>
                In 2004, researchers demonstrated practical MD5 collisions, meaning two different files
                could have the same MD5 hash. In 2017, Google's SHAttered project produced the first
                SHA-1 collision. SHA-256 remains secure with no known practical collision attacks.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── TAB: Security Analysis ──────────────────────────────── */
  const renderAnalysis = () => (
    <div>
      {/* Comparison Table */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">{t('crypto.comparisonTable')}</div>
        <div className="card-body">
          <p style={S.explanation}>
            Comprehensive comparison of all cryptographic algorithms covered in this lab.
            Security ratings consider current best-known attacks as of 2024.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: 20 }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={S.tableHeader}>{t('crypto.algorithm')}</th>
                  <th style={S.tableHeader}>{t('crypto.security')}</th>
                  <th style={S.tableHeader}>{t('crypto.keySize')}</th>
                  <th style={S.tableHeader}>{t('crypto.speed')}</th>
                  <th style={S.tableHeader}>{t('crypto.useCases')}</th>
                </tr>
              </thead>
              <tbody>
                <ComparisonRow name="Caesar Cipher" security="Broken" keySize="5 bits" speed="Very Fast" useCase="Educational only" color="#ef4444" />
                <ComparisonRow name="Vigenere" security="Broken" keySize="Variable" speed="Fast" useCase="Historical interest" color="#ef4444" />
                <ComparisonRow name="AES-128" security="Strong" keySize="128 bits" speed="Very Fast" useCase="HTTPS, WiFi, disk encryption" color="#10b981" />
                <ComparisonRow name="AES-256" security="Maximum" keySize="256 bits" speed="Fast" useCase="Military, classified data, post-quantum" color="#10b981" />
                <ComparisonRow name="RSA-2048" security="Strong" keySize="2048 bits" speed="Slow" useCase="Key exchange, digital signatures" color="#10b981" />
                <ComparisonRow name="RSA-4096" security="Very Strong" keySize="4096 bits" speed="Very Slow" useCase="High-security applications" color="#10b981" />
                <ComparisonRow name="Diffie-Hellman" security="Strong" keySize="2048+ bits" speed="Moderate" useCase="Key exchange, TLS handshake" color="#10b981" />
                <ComparisonRow name="MD5" security="Broken" keySize="N/A (hash)" speed="Very Fast" useCase="Legacy checksums (DO NOT use for security)" color="#ef4444" />
                <ComparisonRow name="SHA-256" security="Strong" keySize="N/A (hash)" speed="Fast" useCase="Digital signatures, Bitcoin, TLS" color="#10b981" />
                <ComparisonRow name="SHA-3" security="Very Strong" keySize="N/A (hash)" speed="Moderate" useCase="Next-gen applications, Ethereum" color="#10b981" />
              </tbody>
            </table>
          </div>

          {/* Time to break estimates */}
          <h4 style={S.sectionTitle}>{t('crypto.timeToBreak')}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { alg: 'Caesar (brute force)', time: '< 1 second', color: '#ef4444', bar: 1 },
              { alg: 'Vigenere (Kasiski)', time: 'Minutes to hours', color: '#ef4444', bar: 5 },
              { alg: 'DES (56-bit)', time: '~1 day (specialized hardware)', color: '#f59e0b', bar: 15 },
              { alg: 'AES-128', time: '~10^18 years (brute force)', color: '#10b981', bar: 75 },
              { alg: 'AES-256', time: '~10^50 years (brute force)', color: '#10b981', bar: 95 },
              { alg: 'RSA-2048', time: '~300 trillion years (GNFS)', color: '#10b981', bar: 85 },
            ].map((item, i) => (
              <div key={i} style={{
                padding: 12, background: 'var(--bg-primary)', borderRadius: 8,
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{item.alg}</span>
                  <span style={{ fontSize: 11, color: item.color, fontWeight: 600 }}>{item.time}</span>
                </div>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 20, height: 6, overflow: 'hidden' }}>
                  <div style={{
                    width: `${item.bar}%`, height: '100%', borderRadius: 20,
                    background: `linear-gradient(90deg, ${item.color}, ${item.color}cc)`,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Attack Scenarios */}
          <h4 style={S.sectionTitle}>{t('crypto.attackScenarios')}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div className="exercise-card" style={{ padding: 14, borderLeft: '3px solid #ef4444' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#ef4444' }}>
                Man-in-the-Middle (MITM)
              </div>
              <p style={S.explanation}>
                An attacker intercepts communication between two parties, potentially reading and
                altering messages. This is why Diffie-Hellman alone is vulnerable -- it needs
                authentication (certificates) to prevent MITM attacks. HTTPS/TLS solves this by
                combining DH key exchange with RSA/ECDSA certificate verification.
              </p>
            </div>
            <div className="exercise-card" style={{ padding: 14, borderLeft: '3px solid #f59e0b' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#f59e0b' }}>
                Side-Channel Attacks
              </div>
              <p style={S.explanation}>
                Instead of attacking the math, these attacks exploit implementation details: timing
                variations, power consumption, electromagnetic emissions, or even sound. Constant-time
                implementations and hardware security modules (HSMs) defend against these.
              </p>
            </div>
            <div className="exercise-card" style={{ padding: 14, borderLeft: '3px solid #8b5cf6' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#8b5cf6' }}>
                Quantum Computing Threat
              </div>
              <p style={S.explanation}>
                Shor's algorithm on a sufficiently large quantum computer could break RSA and
                Diffie-Hellman in polynomial time. AES-256 would still provide 128-bit security
                against Grover's algorithm. Post-quantum cryptography (lattice-based, hash-based)
                is being standardized by NIST to prepare for this threat.
              </p>
            </div>
            <div className="exercise-card" style={{ padding: 14, borderLeft: '3px solid #22d3ee' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#22d3ee' }}>
                Rainbow Table Attack (Hashing)
              </div>
              <p style={S.explanation}>
                Precomputed tables mapping common passwords to their hashes allow instant password
                cracking. Defense: use salted hashes (add random data before hashing) and slow hash
                functions like bcrypt, scrypt, or Argon2 that make table generation impractical.
              </p>
            </div>
          </div>

          {/* Best Practices */}
          <h4 style={S.sectionTitle}>{t('crypto.bestPractices')}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 20 }}>
            {[
              { rule: 'Use AES-256 for symmetric encryption of sensitive data', color: '#10b981' },
              { rule: 'Use RSA-2048+ or ECDSA for asymmetric operations and digital signatures', color: '#10b981' },
              { rule: 'Use SHA-256 or SHA-3 for hashing; NEVER use MD5 or SHA-1 for security', color: '#f59e0b' },
              { rule: 'Use bcrypt/Argon2 for password hashing, NEVER plain SHA-256', color: '#f59e0b' },
              { rule: 'Always use authenticated encryption (AES-GCM) instead of raw AES-CBC', color: '#10b981' },
              { rule: 'Use TLS 1.3 for all network communications', color: '#10b981' },
              { rule: 'Never implement your own cryptography; use established libraries', color: '#ef4444' },
              { rule: 'Rotate keys regularly and use proper key management', color: '#8b5cf6' },
              { rule: 'Plan for post-quantum migration: evaluate lattice-based algorithms', color: '#8b5cf6' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
                background: 'var(--bg-primary)', borderRadius: 8,
                border: '1px solid var(--border)', borderLeft: `3px solid ${item.color}`,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 12,
                  background: `${item.color}22`, color: item.color, fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item.rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Structure Diagrams */}
      <div className="card">
        <div className="card-header">{t('crypto.diagrams')}</div>
        <div className="card-body">
          {/* Symmetric Encryption Flow */}
          <h4 style={S.sectionTitle}>{t('crypto.symmetricFlow')}</h4>
          <div style={{
            padding: 20, background: 'var(--bg-primary)', borderRadius: 12,
            border: '1px solid var(--border)', marginBottom: 20,
          }}>
            <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              Same key encrypts and decrypts
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={S.flowBox('#3b82f6')}>Plaintext</div>
              <div style={S.flowArrow}>&rarr;</div>
              <div style={{
                ...S.flowBox('#10b981'), position: 'relative',
              }}>
                Encrypt
                <div style={{
                  position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 10, color: '#f59e0b', whiteSpace: 'nowrap', fontWeight: 600,
                }}>
                  Secret Key
                </div>
              </div>
              <div style={S.flowArrow}>&rarr;</div>
              <div style={S.flowBox('#ef4444')}>Ciphertext</div>
              <div style={S.flowArrow}>&rarr;</div>
              <div style={{
                ...S.flowBox('#10b981'), position: 'relative',
              }}>
                Decrypt
                <div style={{
                  position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 10, color: '#f59e0b', whiteSpace: 'nowrap', fontWeight: 600,
                }}>
                  Same Key
                </div>
              </div>
              <div style={S.flowArrow}>&rarr;</div>
              <div style={S.flowBox('#3b82f6')}>Plaintext</div>
            </div>
          </div>

          {/* Asymmetric Encryption Flow */}
          <h4 style={S.sectionTitle}>{t('crypto.asymmetricFlow')}</h4>
          <div style={{
            padding: 20, background: 'var(--bg-primary)', borderRadius: 12,
            border: '1px solid var(--border)', marginBottom: 20,
          }}>
            <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              Different keys for encryption (public) and decryption (private)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={S.flowBox('#3b82f6')}>Plaintext</div>
              <div style={S.flowArrow}>&rarr;</div>
              <div style={{
                ...S.flowBox('#10b981'), position: 'relative',
              }}>
                Encrypt
                <div style={{
                  position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 10, color: '#10b981', whiteSpace: 'nowrap', fontWeight: 600,
                }}>
                  Public Key
                </div>
              </div>
              <div style={S.flowArrow}>&rarr;</div>
              <div style={S.flowBox('#ef4444')}>Ciphertext</div>
              <div style={S.flowArrow}>&rarr;</div>
              <div style={{
                ...S.flowBox('#8b5cf6'), position: 'relative',
              }}>
                Decrypt
                <div style={{
                  position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 10, color: '#ef4444', whiteSpace: 'nowrap', fontWeight: 600,
                }}>
                  Private Key
                </div>
              </div>
              <div style={S.flowArrow}>&rarr;</div>
              <div style={S.flowBox('#3b82f6')}>Plaintext</div>
            </div>
          </div>

          {/* Digital Signature Flow */}
          <h4 style={S.sectionTitle}>{t('crypto.digitalSignatureFlow')}</h4>
          <div style={{
            padding: 20, background: 'var(--bg-primary)', borderRadius: 12,
            border: '1px solid var(--border)', marginBottom: 20,
          }}>
            <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              Signing uses private key; verification uses public key
            </div>

            {/* Signing */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', marginBottom: 8, textAlign: 'center' }}>
                {t('crypto.signing')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={S.flowBox('#3b82f6')}>Document</div>
                <div style={S.flowArrow}>&rarr;</div>
                <div style={S.flowBox('#22d3ee')}>Hash</div>
                <div style={S.flowArrow}>&rarr;</div>
                <div style={{
                  ...S.flowBox('#ef4444'), position: 'relative',
                }}>
                  Sign
                  <div style={{
                    position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 10, color: '#ef4444', whiteSpace: 'nowrap', fontWeight: 600,
                  }}>
                    Private Key
                  </div>
                </div>
                <div style={S.flowArrow}>&rarr;</div>
                <div style={S.flowBox('#f59e0b')}>Signature</div>
              </div>
            </div>

            {/* Verification */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 8, textAlign: 'center' }}>
                {t('crypto.verification')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                  <div style={S.flowBox('#3b82f6')}>Document</div>
                  <div style={S.flowBox('#f59e0b')}>Signature</div>
                </div>
                <div style={S.flowArrow}>&rarr;</div>
                <div style={{
                  ...S.flowBox('#10b981'), position: 'relative',
                }}>
                  Verify
                  <div style={{
                    position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 10, color: '#10b981', whiteSpace: 'nowrap', fontWeight: 600,
                  }}>
                    Public Key
                  </div>
                </div>
                <div style={S.flowArrow}>&rarr;</div>
                <div style={S.flowBox('#10b981')}>Valid / Invalid</div>
              </div>
            </div>
          </div>

          {/* Hash Function Pipeline */}
          <h4 style={S.sectionTitle}>{t('crypto.hashPipeline')}</h4>
          <div style={{
            padding: 20, background: 'var(--bg-primary)', borderRadius: 12,
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={S.flowBox('#3b82f6')}>
                Input
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>(any size)</div>
              </div>
              <div style={S.flowArrow}>&rarr;</div>
              <div style={S.flowBox('#22d3ee')}>
                Pre-process
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>(pad to block size)</div>
              </div>
              <div style={S.flowArrow}>&rarr;</div>
              <div style={{
                padding: '10px 14px', borderRadius: 8, textAlign: 'center', fontSize: 12,
                fontWeight: 600, border: '2px dashed #f59e0b',
                background: '#f59e0b15', color: '#f59e0b', minWidth: 80,
              }}>
                Compress
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>(repeated per block)</div>
              </div>
              <div style={S.flowArrow}>&rarr;</div>
              <div style={S.flowBox('#10b981')}>
                Finalize
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>(truncate/format)</div>
              </div>
              <div style={S.flowArrow}>&rarr;</div>
              <div style={S.flowBox('#8b5cf6')}>
                Hash
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>(fixed size)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Render active tab ───────────────────────────────────── */
  const renderTab = () => {
    switch (activeTab) {
      case 'classical': return renderClassical();
      case 'symmetric': return renderSymmetric();
      case 'asymmetric': return renderAsymmetric();
      case 'hashing': return renderHashing();
      case 'analysis': return renderAnalysis();
      default: return renderClassical();
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{t('crypto.title')}</h2>
          <div className="subtitle">{t('crypto.subtitle')}</div>
        </div>
      </div>

      <div className="page-body">
        <div className="tabs" style={{ marginBottom: 20 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {renderTab()}
      </div>
    </>
  );
}
