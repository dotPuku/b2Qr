import { useState, useEffect, useCallback } from 'react';
import PrefixManager from './components/PrefixManager';
import CodeInputSection from './components/CodeInputSection';
import QRCodeCard from './components/QRCodeCard';
import RecentHistory from './components/RecentHistory';
import Toast from './components/Toast';
import {
  buildGeneratedCode,
  formatCode,
  formatName,
} from './utils/qrUtils';

const ACCESS_KEY = 'ATANU04@#';
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

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
        const normalizedPrefixes = (data.prefixes || []).map((item) => ({
          ...item,
          name: formatName(item.name ?? item.prefixName ?? item.prefix ?? item.code),
          code: formatCode(item.code ?? item.prefix ?? item.name ?? ''),
        }));
        setPrefixes(normalizedPrefixes);
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

    const name = formatName(newPrefix?.name ?? '');
    const code = formatCode(newPrefix?.code ?? '');

    if (!name || !code) {
      setToast({
        type: 'error',
        message: 'Please enter a valid prefix name and code',
      });
      return;
    }

    try {
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          code,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const savedPrefix = {
          ...data.prefix,
          name: formatName(data.prefix?.name ?? name),
          code: formatCode(data.prefix?.code ?? code),
        };

        setPrefixes((prev) => {
          const next = [...prev];
          const index = next.findIndex((item) => item._id === savedPrefix._id);

          if (index >= 0) {
            next[index] = savedPrefix;
          } else {
            next.push(savedPrefix);
          }

          return next;
        });

        setActivePrefix(savedPrefix.code);
        generateNewCode(savedPrefix.code, true);

        setToast({
          type: 'success',
          message: `Prefix "${savedPrefix.name}" added and selected!`,
        });
      } else {
        setToast({
          type: 'error',
          message: data.message || 'Failed to add prefix',
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Could not connect to server',
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
      const prefix = formatCode(prefixToUse || 'CODE').trim();
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
    const cleanPrefix = formatCode(prefix);
    setActivePrefix(cleanPrefix);
    generateNewCode(cleanPrefix, true);
  };

  const handleEditPrefix = async (prefixId, newCodeValue, newNameValue, accessKey) => {
    if (!isAccessKeyValid(accessKey)) {
      setToast({
        type: 'error',
        message: 'Access key is invalid.',
      });
      return false;
    }

    const normalizedCode = formatCode(newCodeValue);
    const normalizedName = formatName(newNameValue);

    if (!normalizedCode || !normalizedName) {
      setToast({
        type: 'error',
        message: 'Please enter both a valid prefix name and code',
      });
      return false;
    }

    const duplicate = prefixes.some(
      (item) => item._id !== prefixId && (item.code === normalizedCode || item.name === normalizedName)
    );

    if (duplicate) {
      setToast({
        type: 'error',
        message: `Prefix "${normalizedName}" or code "${normalizedCode}" already exists`,
      });
      return false;
    }

    try {
      const response = await fetch(`${SERVER_URL}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: prefixId,
          newCode: normalizedCode,
          newName: normalizedName,
          accessKey,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const oldValue = prefixes.find((item) => item._id === prefixId)?.code;

        setPrefixes((prev) =>
          prev.map((item) =>
            item._id === prefixId ? { ...item, code: normalizedCode, name: normalizedName } : item
          )
        );

        if (activePrefix === oldValue) {
          setActivePrefix(normalizedCode);
          generateNewCode(normalizedCode, true);
        }

        setToast({
          type: 'success',
          message: `Prefix updated to "${normalizedName} - ${normalizedCode}"`,
        });
        return true;
      }

      setToast({
        type: 'error',
        message: data.message || 'Failed to update prefix',
      });
      return false;
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Could not update prefix',
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
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deleteId, accessKey }),
      });

      const data = await response.json();

      if (data.success) {
        const nextPrefixes = prefixes.filter(
          (item) => item._id !== deleteId
        );

        setPrefixes(nextPrefixes);

        if (activePrefix === prefixToDelete.code) {
          const nextActive = nextPrefixes[0]?.code || "";

          setActivePrefix(nextActive);

          if (nextActive) {
            generateNewCode(nextActive, false);
          } else {
            setFullText("");
          }
        }

        setToast({
          type: 'info',
          message: `Prefix "${prefixToDelete.name || prefixToDelete.code}" deleted`,
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
      message: `Loaded from history: ${upper}`,
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
              onPrefixInputChange={(newVal) => setActivePrefix(formatCode(newVal))}
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