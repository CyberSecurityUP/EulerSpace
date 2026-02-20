import { useState } from 'react';
import LatexRenderer from '../components/LatexRenderer';
import { useI18n } from '../i18n/context';

export default function Research() {
  const { t } = useI18n();
  const [notes, setNotes] = useState([
    { id: 1, title: 'Untitled Note', content: '\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)', created: new Date().toISOString() },
  ]);
  const [activeNote, setActiveNote] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      title: `Note ${notes.length + 1}`,
      content: '',
      created: new Date().toISOString(),
    };
    setNotes(prev => [...prev, newNote]);
    setActiveNote(notes.length);
  };

  const updateNote = (field, value) => {
    setNotes(prev => prev.map((n, i) =>
      i === activeNote ? { ...n, [field]: value } : n
    ));
  };

  const deleteNote = (index) => {
    if (notes.length <= 1) return;
    setNotes(prev => prev.filter((_, i) => i !== index));
    setActiveNote(Math.max(0, activeNote - 1));
  };

  const current = notes[activeNote];

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{t('research.title')}</h2>
          <div className="subtitle">{t('research.subtitle')}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={addNote}>
          {t('research.newNote')}
        </button>
      </div>
      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr', gap: 20, height: '100%' }}>
          <div className="card" style={{ overflow: 'auto' }}>
            <div className="card-header">{t('research.notes')}</div>
            <div style={{ padding: 8 }}>
              {notes.map((note, i) => (
                <div
                  key={note.id}
                  className={`nav-item ${activeNote === i ? 'active' : ''}`}
                  onClick={() => setActiveNote(i)}
                  style={{ justifyContent: 'space-between' }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {note.title}
                  </span>
                  {notes.length > 1 && (
                    <span
                      onClick={e => { e.stopPropagation(); deleteNote(i); }}
                      style={{ opacity: 0.4, cursor: 'pointer', fontSize: 14 }}
                    >
                      ×
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setEditingTitle(true)}>
              {editingTitle ? (
                <input
                  className="input"
                  value={current?.title || ''}
                  onChange={e => updateNote('title', e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
                  autoFocus
                  style={{ padding: '4px 8px', fontSize: 13 }}
                />
              ) : (
                <span>{current?.title || 'Select a note'}</span>
              )}
            </div>
            <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <textarea
                className="input"
                value={current?.content || ''}
                onChange={e => updateNote('content', e.target.value)}
                placeholder={t('research.placeholder')}
                style={{ flex: 1, minHeight: 300, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
                spellCheck={false}
              />
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">{t('research.preview')}</div>
            <div className="card-body" style={{ flex: 1, overflow: 'auto' }}>
              {current?.content ? (
                <div>
                  {current.content.split('\n').map((line, i) => (
                    <div key={i} style={{ marginBottom: 8, minHeight: 20 }}>
                      {line.trim() ? (
                        line.includes('\\') || line.includes('^') || line.includes('_') ? (
                          <LatexRenderer math={line} display />
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{line}</span>
                        )
                      ) : (
                        <br />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>{t('research.previewHere')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
