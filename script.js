const input = document.getElementById('inputText');
const output = document.getElementById('outputText');
const inputCount = document.getElementById('inputCount');
const outputCount = document.getElementById('outputCount');
const delimiterField = document.getElementById('delimiter');
const delimiterSettings = document.getElementById('delimiterSettings');
const copyStatus = document.getElementById('copyStatus');
let selectedDelimiter = null;
const delimiterButtons = [...document.querySelectorAll('.delimiter-btn')];

function getSelectedFormat() {
  return document.querySelector('input[name="format"]:checked')?.value || 'line';
}
function splitList(raw) {
  return raw.split(/[\n\r,:;|]+/);
}
function detectDelimiter(raw) {
  const match = raw.match(/[,;:|]/);
  if (match) return match[0];
  // Если исходные данные были столбиком, а на выходе нужна строка,
  // используем запятую как понятный разделитель по умолчанию.
  return ',';
}
function countItems(raw) {
  const items = splitList(raw).filter(item => item.trim() !== '');
  return items.length;
}
function updateInputCount() {
  const count = countItems(input.value);
  inputCount.textContent = `${count} ${count === 1 ? 'элемент' : count >= 2 && count <= 4 ? 'элемента' : 'элементов'}`;
}
function convert() {
  let items = splitList(input.value);
  if (document.getElementById('trim').checked) items = items.map(x => x.trim());
  // Пустые строки и значения пропускаются автоматически всегда.
  items = items.filter(x => x.trim() !== '');
  if (document.getElementById('dedupe').checked) {
    const seen = new Set();
    items = items.filter(x => {
      const key = x.toLocaleLowerCase('ru');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  if (document.getElementById('sort').checked) items.sort((a, b) => a.localeCompare(b, 'ru', { sensitivity: 'base' }));
  if (document.getElementById('wrapItems').checked) {
    const prefix = document.getElementById('prefix').value;
    const suffix = document.getElementById('suffix').value;
    items = items.map(x => `${prefix}${x}${suffix}`);
  }
  const format = getSelectedFormat();
  const customDelimiter = delimiterField.value;
  const outputDelimiter = customDelimiter !== '' ? customDelimiter : (selectedDelimiter !== null ? selectedDelimiter : detectDelimiter(input.value));
  output.value = format === 'column' ? items.join('\n') : items.join(outputDelimiter);
  outputCount.textContent = `${items.length} ${items.length === 1 ? 'элемент' : items.length >= 2 && items.length <= 4 ? 'элемента' : 'элементов'}`;
  copyStatus.textContent = '';
}
delimiterButtons.forEach(button => button.addEventListener('click', () => {
  const value = button.dataset.delimiter;
  selectedDelimiter = selectedDelimiter === value ? null : value;
  delimiterButtons.forEach(option => {
    const active = option.dataset.delimiter === selectedDelimiter;
    option.classList.toggle('active', active);
    option.setAttribute('aria-pressed', String(active));
  });
  delimiterField.value = '';
  copyStatus.textContent = '';
}));
delimiterField.addEventListener('input', () => {
  if (delimiterField.value !== '') {
    selectedDelimiter = null;
    delimiterButtons.forEach(option => {
      option.classList.remove('active');
      option.setAttribute('aria-pressed', 'false');
    });
  }
  copyStatus.textContent = '';
});
document.getElementById('wrapItems').addEventListener('change', event => {
  document.getElementById('wrapFields').classList.toggle('visible', event.target.checked);
});
document.querySelectorAll('input[name="format"]').forEach(radio => radio.addEventListener('change', () => {
  delimiterSettings.style.opacity = getSelectedFormat() === 'line' ? '1' : '.45';
  delimiterSettings.style.pointerEvents = getSelectedFormat() === 'line' ? 'auto' : 'none';
}));
input.addEventListener('input', updateInputCount);
document.getElementById('convert').addEventListener('click', convert);
document.getElementById('clearInput').addEventListener('click', () => {
  input.value = '';
  output.value = '';
  inputCount.textContent = '0 элементов';
  outputCount.textContent = '—';
  copyStatus.textContent = '';
  input.focus();
});
document.getElementById('copyOutput').addEventListener('click', async () => {
  if (!output.value) { copyStatus.textContent = 'Сначала преобразуй список'; return; }
  try {
    await navigator.clipboard.writeText(output.value);
    copyStatus.textContent = 'Скопировано!';
  } catch {
    output.focus(); output.select();
    const ok = document.execCommand('copy');
    copyStatus.textContent = ok ? 'Скопировано!' : 'Выдели результат и скопируй';
  }
});
updateInputCount();
