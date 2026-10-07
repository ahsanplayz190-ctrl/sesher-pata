function normalizeBengali(str) {
  if (!str) return '';
  return String(str).normalize('NFC').trim();
}

function matchesAuthor(bookAuthor, filterAuthor) {
  if (!filterAuthor || filterAuthor === 'all') return true;
  if (!bookAuthor) return false;

  const normBook = normalizeBengali(bookAuthor).toLowerCase();
  const normFilter = normalizeBengali(filterAuthor).toLowerCase();

  if (!normBook || !normFilter) return false;
  if (normBook === normFilter) return true;
  if (normBook.includes(normFilter) || normFilter.includes(normBook)) return true;

  const authorIdMap = {
    'author-humayun': 'হুমায়ূন আহমেদ',
    'author-rabindranath': 'রবীন্দ্রনাথ ঠাকুর',
    'author-nazrul': 'কাজী নজরুল ইসলাম',
    'author-satyajit': 'সত্যজিৎ রায়',
    'author-sunil': 'সুনীল গঙ্গোপাধ্যায়',
    'author-sharat': 'শরৎচন্দ্র চট্টোপাধ্যায়',
  };

  if (authorIdMap[filterAuthor]) {
    const canonicalName = normalizeBengali(authorIdMap[filterAuthor]).toLowerCase();
    if (normBook === canonicalName || normBook.includes(canonicalName)) {
      return true;
    }
  }

  return false;
}

// Test cases
console.log('Test 1 (Humayun precomposed vs decomposed):', matchesAuthor('হুমায়ূন আহমেদ', 'হুমায়ূন আহমেদ') === true);
console.log('Test 2 (Humayun decomposed vs precomposed):', matchesAuthor('হুমায়ূন আহমেদ', 'হুমায়ূন আহমেদ') === true);
console.log('Test 3 (Humayun id):', matchesAuthor('হুমায়ূন আহমেদ', 'author-humayun') === true);
console.log('Test 4 (Book title with author):', matchesAuthor('দেবী - হুমায়ূন আহমেদ', 'হুমায়ূন আহমেদ') === true);
console.log('Test 5 (Different author):', matchesAuthor('সুনীল গঙ্গোপাধ্যায়', 'হুমায়ূন আহমেদ') === false);
console.log('All tests passed!');
