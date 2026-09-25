import React, { useState } from 'react';
import { Tag, Plus, Trash2, Check, Sparkles, MoreVertical, Pencil } from 'lucide-react';
import { formatPrefix, parsePrefixList } from '../utils/qrUtils';

export default function PrefixManager({
  prefixes,
  activePrefix,
  onSelectPrefix,
  onAddPrefix,
  onEditPrefix,
  onDeletePrefix,
  onPrefixInputChange,
}) {
  const [newPrefixInput, setNewPrefixInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editDraft, setEditDraft] = useState('');
  const [editError, setEditError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const closeMenu = () => {
    setMenuOpenId(null);
    setMenuAnchor(null);
  };

  const openMenuForPrefix = (event, prefix) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 160;
    const padding = 12;
    const maxX = window.innerWidth - menuWidth - padding;
    const maxY = window.innerHeight - 140;

    setMenuOpenId(prefix._id);
    setMenuAnchor({
      x: Math.min(Math.max(padding, rect.right - 16), maxX),
      y: Math.min(Math.max(padding, rect.bottom + 8), maxY),
    });
  };

  const handleAddNew = (e) => {
    e.preventDefault();
    const parsedPrefixes = parsePrefixList(newPrefixInput);

    if (parsedPrefixes.length === 0) {
      setErrorMsg('Please enter at least one prefix (e.g. PCM, PBHM)');
      return;
    }

    const existingMatches = parsedPrefixes.filter((prefix) =>
      prefixes.some((item) => item.prefix === prefix)
    );

    if (existingMatches.length > 0) {
      setErrorMsg(`These prefixes already exist: ${existingMatches.join(', ')}`);
      return;
    }

    onAddPrefix(parsedPrefixes);
    setNewPrefixInput('');
    setErrorMsg('');
    setShowAddForm(false);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const cleanValue = formatPrefix(editDraft);

    if (!cleanValue) {
      setEditError('Please enter a valid prefix');
      return;
    }

    const duplicate = prefixes.some(
      (item) => item._id !== editId && item.prefix === cleanValue
    );

    if (duplicate) {
      setEditError(`"${cleanValue}" already exists`);
      return;
    }

    const saved = await onEditPrefix(editId, cleanValue);
    if (saved) {
      setEditId(null);
      setEditDraft('');
      setEditError('');
      setMenuOpenId(null);
    }
  };

  return (
    <div className="bg-[#1b1d24] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-visible">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-zinc-300 font-semibold text-base sm:text-lg">
            <Tag className="w-4 h-4 text-[#00e676]" />
            <span>Choose or Add Prefix</span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Click any prefix to load it into the input box
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setErrorMsg('');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/30 hover:bg-[#00e676]/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus
            className="w-3.5 h-3.5 transition-transform duration-300"
            style={{ transform: showAddForm ? 'rotate(45deg)' : 'rotate(0deg)' }}
          />
          <span>{showAddForm ? 'Cancel' : 'Add Custom Prefix'}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddNew} className="mb-5 p-4 rounded-xl bg-zinc-900/90 border border-zinc-700/60 transition-all">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newPrefixInput}
              onChange={(e) => {
                setNewPrefixInput(formatPrefix(e.target.value));
                setErrorMsg('');
              }}
              placeholder="e.g. PCM, PBHM, BB-NOW, SB-IFC"
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 uppercase focus:outline-none focus:border-[#00e676] focus:ring-1 focus:ring-[#00e676]"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#00e676] text-black font-semibold text-sm rounded-lg hover:bg-[#00c864] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Prefix</span>
            </button>
          </div>
          {errorMsg && <p className="text-rose-400 text-xs mt-2">{errorMsg}</p>}
        </form>
      )}

      <div className="mb-5">
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          Active Prefix (Type directly or click a button below):
        </label>
        <div className="relative">
          <input
            type="text"
            value={activePrefix}
            onChange={(e) => onPrefixInputChange(formatPrefix(e.target.value))}
            placeholder="TYPE OR SELECT A PREFIX..."
            className="w-full bg-zinc-900/90 border border-zinc-750 rounded-xl px-4 py-3 text-white text-base sm:text-lg font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-[#00e676] focus:ring-2 focus:ring-[#00e676]/20 transition-all"
          />
          {activePrefix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#00e676]/15 text-[#00e676] border border-[#00e676]/30">
              ACTIVE
            </span>
          )}
        </div>
      </div>

      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-[#171a21] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-zinc-200">Edit Prefix</p>
                <p className="text-xs text-zinc-400">Update the selected prefix value</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setEditDraft('');
                  setEditError('');
                }}
                className="text-zinc-400 hover:text-white text-xl leading-none"
                aria-label="Close edit dialog"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              <input
                type="text"
                value={editDraft}
                onChange={(e) => {
                  setEditDraft(e.target.value);
                  setEditError('');
                }}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white uppercase focus:outline-none focus:border-[#00e676] focus:ring-2 focus:ring-[#00e676]/20"
                autoFocus
              />

              {editError && <p className="text-rose-400 text-xs">{editError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-3 py-2 bg-zinc-800 text-zinc-200 text-sm font-semibold rounded-lg hover:bg-zinc-700"
                  onClick={() => {
                    setEditId(null);
                    setEditDraft('');
                    setEditError('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#00e676] text-black text-sm font-semibold rounded-lg hover:bg-[#00c864]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-[#171a21] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-amber-500/15 p-2 text-amber-300">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-base font-semibold text-zinc-100">Delete Prefix</p>
                <p className="text-xs text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-zinc-200 mb-5">
              Delete <span className="font-mono text-white">{deleteTarget.prefix}</span> from your saved prefix list?
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-2 bg-zinc-800 text-zinc-200 text-sm font-semibold rounded-lg hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onDeletePrefix(deleteTarget);
                  setDeleteTarget(null);
                }}
                className="px-3 py-2 bg-rose-500 text-white text-sm font-semibold rounded-lg hover:bg-rose-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {menuOpenId && menuAnchor && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={closeMenu}
            aria-hidden="true"
          />

          <div
            className="fixed z-50 w-40 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden"
            style={{ left: menuAnchor.x, top: menuAnchor.y }}
          >
            {prefixes
              .filter((prefix) => prefix._id === menuOpenId)
              .map((prefix) => (
                <React.Fragment key={prefix._id}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditId(prefix._id);
                      setEditDraft(prefix.prefix);
                      setEditError('');
                      closeMenu();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#00e676]" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(prefix);
                      closeMenu();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    Delete
                  </button>
                </React.Fragment>
              ))}
          </div>
        </>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Available Prefixes ({prefixes.length})
          </span>
        </div>

        {prefixes.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/40">
            <p className="text-xs text-zinc-500">
              No prefixes left. Click "Add Custom Prefix" to add one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {prefixes.map((prefix) => {
              const isSelected = activePrefix === prefix.prefix;

              return (
                <div
                  key={prefix._id}
                  className="group relative"
                >
                  <button
                    type="button"
                    onClick={() => onSelectPrefix(prefix.prefix)}
                    className={`w-full text-left sm:text-center pl-3 pr-10 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-between gap-1.5 ${isSelected
                      ? 'bg-[#00e676] text-zinc-950 shadow-[0_0_15px_rgba(0,230,118,0.35)] scale-[1.01]'
                      : 'bg-zinc-800/80 hover:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-700/60 hover:border-zinc-500'
                      }`}
                  >
                    <span className="truncate min-w-0">{prefix.prefix}</span>
                    {isSelected && <Sparkles className="w-3 h-3 flex-shrink-0" />}
                  </button>

                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20">
                    <button
                      type="button"
                      onClick={(e) => openMenuForPrefix(e, prefix)}
                      className={`p-2 sm:p-1.5 rounded-md transition-all cursor-pointer ${isSelected
                        ? 'text-zinc-900/70 hover:text-zinc-950 hover:bg-black/10'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'}
                      `}
                      title={`Options for ${prefix.prefix}`}
                    >
                      <MoreVertical className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
