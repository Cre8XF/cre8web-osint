// tools.js - Enhanced with modern APIs and better UX
import { ls } from './helpers.js';
import { showNotification, showError } from './error-handler.js';

const qs = (s, root = document) => root.querySelector(s);

/**
 * CSV to JSON converter
 */
function csvToJson(csv) {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length === 0) {
    throw new Error('Tom CSV-input');
  }

  const headers = lines.shift().split(',').map(s => s.trim());
  const rows = lines.map(line => {
    const cols = line.split(',').map(s => s.trim());
    return Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? '']));
  });

  return JSON.stringify(rows, null, 2);
}

/**
 * JSON to CSV converter
 */
function jsonToCsv(json) {
  const obj = JSON.parse(json);
  const arr = Array.isArray(obj) ? obj : [obj];

  if (arr.length === 0) {
    throw new Error('Tomt JSON-array');
  }

  const headers = [...new Set(arr.flatMap(o => Object.keys(o)))];
  const rows = arr.map(o => headers.map(h => (o[h] ?? '')).join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Modern Clipboard API with fallback
 * @param {string} text - Text to copy
 */
async function copyToClipboard(text) {
  try {
    // Modern Clipboard API (preferred)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      showNotification('✅ Kopiert til utklippstavlen', 'success');
      return true;
    }

    // Fallback for older browsers or non-HTTPS
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    textarea.setAttribute('aria-hidden', 'true');

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (successful) {
      showNotification('✅ Kopiert', 'success');
      return true;
    } else {
      throw new Error('Kunne ikke kopiere');
    }
  } catch (error) {
    showError(error, { function: 'copyToClipboard' });
    return false;
  }
}

/**
 * Setup tools panel functionality
 */
function setupToolsPanel() {
  const panel = qs('#toolsPanel');
  const open = qs('#toolsToggle');
  const close = qs('#toolsClose');

  if (!panel) return;

  // Panel toggle handlers (also in page-init.js, but defensive programming)
  if (open) {
    open.addEventListener('click', () => panel.classList.add('active'));
  }

  if (close) {
    close.addEventListener('click', () => panel.classList.remove('active'));
  }

  // JSON/CSV Converters
  const jsonToCsvBtn = qs('[data-tool="json-to-csv"]');
  const csvToJsonBtn = qs('[data-tool="csv-to-json"]');
  const jsonInput = qs('#jsonInput');
  const jsonOutput = qs('#jsonOutput');

  if (jsonToCsvBtn && jsonInput && jsonOutput) {
    jsonToCsvBtn.addEventListener('click', () => {
      try {
        const inputValue = jsonInput.value.trim();
        if (!inputValue) {
          showNotification('⚠️ Skriv inn JSON først', 'warning');
          return;
        }

        jsonOutput.value = jsonToCsv(inputValue);
        showNotification('✅ Konvertert til CSV', 'success');
      } catch (error) {
        showNotification('❌ Ugyldig JSON: ' + error.message, 'error');
      }
    });
  }

  if (csvToJsonBtn && jsonInput && jsonOutput) {
    csvToJsonBtn.addEventListener('click', () => {
      try {
        const inputValue = jsonInput.value.trim();
        if (!inputValue) {
          showNotification('⚠️ Skriv inn CSV først', 'warning');
          return;
        }

        jsonOutput.value = csvToJson(inputValue);
        showNotification('✅ Konvertert til JSON', 'success');
      } catch (error) {
        showNotification('❌ Ugyldig CSV: ' + error.message, 'error');
      }
    });
  }

  // URL Encoder/Decoder
  const urlEncodeBtn = qs('[data-tool="url-encode"]');
  const urlDecodeBtn = qs('[data-tool="url-decode"]');
  const urlBox = qs('#urlBox');

  if (urlEncodeBtn && urlBox) {
    urlEncodeBtn.addEventListener('click', () => {
      const value = urlBox.value.trim();
      if (!value) {
        showNotification('⚠️ Skriv inn tekst først', 'warning');
        return;
      }

      urlBox.value = encodeURIComponent(value);
      showNotification('✅ URL encoded', 'success');
    });
  }

  if (urlDecodeBtn && urlBox) {
    urlDecodeBtn.addEventListener('click', () => {
      try {
        const value = urlBox.value.trim();
        if (!value) {
          showNotification('⚠️ Skriv inn tekst først', 'warning');
          return;
        }

        urlBox.value = decodeURIComponent(value);
        showNotification('✅ URL decoded', 'success');
      } catch (error) {
        showNotification('❌ Ugyldig encoded tekst', 'error');
      }
    });
  }

  // Base64 Encoder/Decoder
  const b64EncodeBtn = qs('[data-tool="b64-encode"]');
  const b64DecodeBtn = qs('[data-tool="b64-decode"]');
  const b64Box = qs('#b64Box');

  if (b64EncodeBtn && b64Box) {
    b64EncodeBtn.addEventListener('click', () => {
      try {
        const value = b64Box.value.trim();
        if (!value) {
          showNotification('⚠️ Skriv inn tekst først', 'warning');
          return;
        }

        // Modern approach using TextEncoder
        const encoder = new TextEncoder();
        const data = encoder.encode(value);
        const base64 = btoa(String.fromCharCode(...data));

        b64Box.value = base64;
        showNotification('✅ Base64 encoded', 'success');
      } catch (error) {
        showNotification('❌ Kunne ikke encode: ' + error.message, 'error');
      }
    });
  }

  if (b64DecodeBtn && b64Box) {
    b64DecodeBtn.addEventListener('click', () => {
      try {
        const value = b64Box.value.trim();
        if (!value) {
          showNotification('⚠️ Skriv inn tekst først', 'warning');
          return;
        }

        // Modern approach using TextDecoder
        const binary = atob(value);
        const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
        const decoder = new TextDecoder();
        const decoded = decoder.decode(bytes);

        b64Box.value = decoded;
        showNotification('✅ Base64 decoded', 'success');
      } catch (error) {
        showNotification('❌ Ugyldig Base64', 'error');
      }
    });
  }

  // Copy button - Modern Clipboard API
  const copyBtn = qs('.copy[data-copy]');
  if (copyBtn) {
    copyBtn.addEventListener('click', async (e) => {
      const targetSel = e.currentTarget.getAttribute('data-copy');
      const el = qs(targetSel);

      if (!el) {
        showNotification('❌ Fant ikke element å kopiere fra', 'error');
        return;
      }

      const textToCopy = el.value || el.textContent;

      if (!textToCopy || textToCopy.trim() === '') {
        showNotification('⚠️ Ingen tekst å kopiere', 'warning');
        return;
      }

      await copyToClipboard(textToCopy);
    });
  }

  // Clear localStorage
  const clearLsBtn = qs('#clearLs');
  if (clearLsBtn) {
    clearLsBtn.addEventListener('click', () => {
      // Show more informative confirmation
      const usage = ls.getUsage();
      const usageMB = (usage.used / (1024 * 1024)).toFixed(2);

      if (confirm(
        `Vil du virkelig tømme ALL lagret data?\n\n` +
        `Dette vil slette:\n` +
        `• Alle favoritter\n` +
        `• Tema-innstillinger\n` +
        `• All annen lagret data\n\n` +
        `Nåværende bruk: ${usageMB} MB (${usage.percentage.toFixed(1)}%)\n\n` +
        `Dette kan IKKE angres!`
      )) {
        try {
          localStorage.clear();
          showNotification('✅ localStorage tømt. Laster siden på nytt...', 'info');
          setTimeout(() => location.reload(), 2000);
        } catch (error) {
          showError(error, { function: 'clearLocalStorage' });
        }
      }
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', setupToolsPanel);
