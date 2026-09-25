import { useState, useEffect, useCallback } from 'react';
import PrefixManager from './components/PrefixManager';
import CodeInputSection from './components/CodeInputSection';
import QRCodeCard from './components/QRCodeCard';
import RecentHistory from './components/RecentHistory';
import Toast from './components/Toast';
import {
  buildGeneratedCode,
  formatPrefix,
} from './utils/qrUtils';

const ACCESS_KEY = 'ATANU04@#';
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const isAccessKeyValid = (value) => {
  return String(value || '').trim() === ACCESS_KEY;
};

export default function App() {
  const [prefixes, setPrefixes] = useState([]);

  const fetchPrefixes = async () => {
    try {
      const response = await fetch(SERVER_URL);

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setPrefixes(data.prefixes || []);
      }
    } catch (error) {
      setToast({
        type: "error",
        message: "Could not load saved prefixes",
      });
    }
  };

  useEffect(() => {
    fetchPrefixes();
  }, []);

  const [activePrefix, setActivePrefix] = useState('');
  const [fullText, setFullText] = useState('');
  const [history, setHistory] = useState([]);
  const [hasCopied, setHasCopied] = useState(false);
  const [toast, setToast] = useState(null);

  const handleAddPrefix = async (newPrefix, accessKey) => {
    if (!isAccessKeyValid(accessKey)) {
      setToast({
        type: 'error',
        message: 'Access key is invalid.',
      });
      return;
    }

    const rawValues = Array.isArray(newPrefix)
      ? newPrefix
      : String(newPrefix).split(',');

    const cleanPrefixes = [...new Set(
      rawValues
        .map((item) => formatPrefix(item))
        .map((item) => item.replace(/\s+/g, ''))
        .filter(Boolean)
    )];

    if (!cleanPrefixes.length) {
      setToast({
        type: "error",
        message: "Please enter at least one valid prefix",
      });
      return;
    }

    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prefix: cleanPrefixes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const savedPrefixes = Array.isArray(data.prefixes) ? data.prefixes : [data.prefix].filter(Boolean);
        const mergedPrefixes = [...prefixes];

        savedPrefixes.forEach((item) => {
          if (!mergedPrefixes.some((existing) => existing.prefix === item.prefix)) {
            mergedPrefixes.push(item);
          }
        });

        setPrefixes(mergedPrefixes);

        const firstAddedPrefix = savedPrefixes[0]?.prefix || cleanPrefixes[0];
        setActivePrefix(firstAddedPrefix);
        generateNewCode(firstAddedPrefix, true);

        setToast({
          type: "success",
          message:
            savedPrefixes.length > 1
              ? `Added ${savedPrefixes.length} prefixes successfully!`
              : `Prefix "${firstAddedPrefix}" added and selected!`,
        });
      } else {
        setToast({
          type: "error",
          message: data.message || "Failed to add prefix",
        });
      }
    } catch (error) {
      setToast({
        type: "error",
        message: "Could not connect to server",
      });
    }
  };

  const addToHistory = useCallback((code) => {
    if (!code || !code.trim()) return;
    const clean = code.trim().toUpperCase();
    setHistory((prev) => {
      const filtered = prev.filter((item) => item !== clean);
      return [clean, ...filtered].slice(0, 20);
    });
  }, []);

  const generateNewCode = useCallback(
    (prefixToUse = activePrefix, notify = true) => {
      const prefix = formatPrefix(prefixToUse || 'CODE').trim();
      const combined = buildGeneratedCode(prefix);

      setFullText(combined);
      addToHistory(combined);

      if (notify) {
        setToast({
          type: 'success',
          message: `Generated: ${combined}`
        });
      }
      return combined;
    },
    [activePrefix, addToHistory]
  );

  const handleSelectPrefix = (prefix) => {
    const cleanPrefix = formatPrefix(prefix);
    setActivePrefix(cleanPrefix);
    generateNewCode(cleanPrefix, true);
  };

  const handleEditPrefix = async (prefixId, newPrefixValue, accessKey) => {
    if (!isAccessKeyValid(accessKey)) {
      setToast({
        type: 'error',
        message: 'Access key is invalid.',
      });
      return false;
    }

    const normalized = formatPrefix(newPrefixValue);

    if (!normalized) {
      setToast({
        type: "error",
        message: "Please enter a valid prefix",
      });
      return false;
    }

    const duplicate = prefixes.some(
      (item) => item._id !== prefixId && item.prefix === normalized
    );

    if (duplicate) {
      setToast({
        type: "error",
        message: `Prefix "${normalized}" already exists`,
      });
      return false;
    }

    try {
      const response = await fetch(`${SERVER_URL}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: prefixId,
          newPrefix: normalized,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const oldValue = prefixes.find((item) => item._id === prefixId)?.prefix;

        setPrefixes((prev) =>
          prev.map((item) =>
            item._id === prefixId ? { ...item, prefix: normalized } : item
          )
        );

        if (activePrefix === oldValue) {
          setActivePrefix(normalized);
          generateNewCode(normalized, true);
        }

        setToast({
          type: "success",
          message: `Prefix updated to "${normalized}"`,
        });
        return true;
      }

      setToast({
        type: "error",
        message: data.message || "Failed to update prefix",
      });
      return false;
    } catch (error) {
      setToast({
        type: "error",
        message: "Could not update prefix",
      });
      return false;
    }
  };

  const handleDeletePrefix = async (prefixToDelete, accessKey) => {
    if (!isAccessKeyValid(accessKey)) {
      setToast({
        type: 'error',
        message: 'Access key is invalid.',
      });
      return;
    }

    const deleteId = prefixToDelete._id;

    try {
      const response = await fetch(`${SERVER_URL}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deleteId }),
      });

      const data = await response.json();

      if (data.success) {
        const nextPrefixes = prefixes.filter(
          (item) => item._id !== deleteId
        );

        setPrefixes(nextPrefixes);

        if (activePrefix === prefixToDelete.prefix) {
          const nextActive = nextPrefixes[0]?.prefix || "";

          setActivePrefix(nextActive);

          if (nextActive) {
            generateNewCode(nextActive, false);
          } else {
            setFullText("");
          }
        }

        setToast({
          type: "info",
          message: `Prefix "${prefixToDelete.prefix}" deleted`,
        });
      } else {
        setToast({
          type: "error",
          message: data.message || "Failed to delete prefix",
        });
      }
    } catch (error) {
      setToast({
        type: "error",
        message: "Could not connect to server",
      });
    }
  };

  const handleCopyText = async () => {
    if (!fullText) return;
    try {
      await navigator.clipboard.writeText(fullText);
      setHasCopied(true);
      setToast({
        type: 'success',
        message: `Copied "${fullText}" to clipboard!`
      });
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      setToast({
        type: 'error',
        message: 'Could not copy to clipboard'
      });
    }
  };

  const handleSelectRecent = (code) => {
    const upper = code.toUpperCase();
    setFullText(upper);

    setToast({
      type: 'info',
      message: `Loaded from history: ${upper}`
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <main className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <PrefixManager
              prefixes={prefixes}
              activePrefix={activePrefix}
              onSelectPrefix={handleSelectPrefix}
              onAddPrefix={handleAddPrefix}
              onEditPrefix={handleEditPrefix}
              onDeletePrefix={handleDeletePrefix}
              onPrefixInputChange={(newVal) => setActivePrefix(formatPrefix(newVal))}
            />
            <CodeInputSection
              fullText={fullText}
              onFullTextChange={(val) => {
                setFullText(val);
                addToHistory(val);
              }}
              onGenerateNew={() => generateNewCode(activePrefix, true)}
              onCopyText={handleCopyText}
              hasCopied={hasCopied}
            />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <QRCodeCard
              value={fullText}
              onNotify={(notification) => setToast(notification)}
            />
            <RecentHistory
              history={history}
              onSelectCode={handleSelectRecent}
              onCopyCode={(code) => {
                navigator.clipboard.writeText(code);
                setToast({
                  type: 'success',
                  message: `Copied "${code}" to clipboard!`
                });
              }}
              onClearHistory={() => setHistory([])}
            />
          </div>
        </div>
      </main>
    </div>
  );
}