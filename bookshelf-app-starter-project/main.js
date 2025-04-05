//inisiasi 1 varabel nama storage, formBook Data dan listBookData menjadi kesatuan
const appConfig = {
  STORAGE_KEY: 'bookshelf_app',
  formBookData: ['bookFormTitle', 'bookFormAuthor', 'bookFormYear', 'bookFormIsComplete'],
  listBookData: ['incompleteBookList', 'completeBookList']
};

//inisiasi data buku awal
let bookList = [];
let editBook = { isActive: false, currentId: null };

//inisiasi elemen DOM
const [inCompleteList, completeList] = appConfig.listBookData.map(id => document.getElementById(id));
const formElements = appConfig.formBookData.reduce((acc, id) => {
  const key = id.replace('bookForm', '').toLowerCase();
  acc[key] = document.getElementById(id);
  return acc;
}, {});

//inisiasi aplikasi dengan 3 fungsi utama
const initializeApp = () => {
  loadBooksData();
  setupEventListener();
  renderBooksData();
};

const loadBooksData = () => {
  const savedData = localStorage.getItem(appConfig.STORAGE_KEY);
  bookList = savedData ? JSON.parse(savedData) : [];
};

//fungsi untuk menyimpan data buku di local storage
const saveBooks = () => {
  localStorage.setItem(appConfig.STORAGE_KEY, JSON.stringify(bookList));
};

const handleFormSubmit = (n) => {
  n.preventDefault();
  editBook.isActive ? updateDataBook() : addNewBook();
};

//fungsi untuk menambah data buku 
const addNewBook = () => {
  const newDataBook = {
    id: Date.now(),
    title: formElements.title.value,
    author: formElements.author.value,
    year: parseInt(formElements.year.value), //parseInt untuk mengambil value tahun berupa integer bukan string
    isComplete: formElements.iscomplete.checked
  };

  bookList.push(newDataBook);
  saveBooks();
  resetFormBook(); //menyimpan update buku di UI
  renderBooksData(); //menampilkan data buku di UI
};

//fungsi untuk perubahan data buku baik dari UI dan local storage
const updateDataBook = () => {
  bookList = bookList.map(book => 
    book.id === editBook.currentId ? getUpdateBookData(book) : book
  );
  saveBooks();
  cancelEdit();
  renderBooksData();
};

//mengambil value data buku yang diubah
const getUpdateBookData = (bookData) => ({
  ...bookData,
  title: formElements.title.value,
  author: formElements.author.value,
  year: parseInt(formElements.year.value),
  isComplete: formElements.iscomplete.checked
});

const handleBookAction = (n) => {
  const bookElement = n.target.closest('[data-bookid]');
  if (!bookElement) return;

  const bookId = Number(bookElement.dataset.bookid);
  const actionType = n.target.dataset.testid?.split('bookItem')[1].replace('Button', '');

  switch(actionType) {
    case 'IsComplete': completeStatus(bookId); break;
    case 'Delete': removeBook(bookId); break;
    case 'Edit': editBookForm(bookId); break;
  }
};

const completeStatus = (id) => {
  bookList = bookList.map(book =>
    book.id === id ? {...book, isComplete: !book.isComplete} : book
  );
  saveBooks();
  renderBooksData();
};

const removeBook = (id) => {
  bookList = bookList.filter(book => book.id !== id);
  saveBooks();
  renderBooksData();
};

const editBookForm = (id) => {
  const targetBook = bookList.find(book => book.id === id);
  if (!targetBook) return;

  editBook = {isActive: true, currentId: id};
  Object.entries(targetBook).forEach(([key, value]) => {
    if (formElements[key]) formElements[key].value = value;
    if (key === 'isComplete') formElements[key].checked = value;
  });
  document.getElementById('bookFormSubmit').textContent = 'Perbarui Buku';
};

const cancelEdit = () => {
  editBook = { isActive: false, currentId: null };
  resetFormBook();
  document.getElementById('bookFormSubmit').innerHTML = 
    'Masukkan Buku ke rak <span>Belum selesai dibaca</span>';
};

const resetFormBook = () => {
  document.getElementById('bookForm').reset();
};

const createBookItem = (book) => {
  const item = document.createElement('div');
  item.className = 'book-item';
  item.dataset.bookid = book.id;
  item.dataset.testid = 'bookItem';

  item.innerHTML = `
    <h3 data-testid="bookItemTitle">${book.title}</h3>
    <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
    <p data-testid="bookItemYear">Tahun: ${book.year}</p>
    <div>
      <button data-testid="bookItemIsCompleteButton">
        ${book.isComplete ? 'Belum selesai' : 'Selesai dibaca'}
      </button>
      <button data-testid="bookItemDeleteButton">Hapus Buku</button>
      <button data-testid="bookItemEditButton">Edit Buku</button>
    </div>
  `;

  return item;
};

const renderBooksData = (filteredList) => {
  const showBooks = filteredList || bookList;

  inCompleteList.innerHTML = '';
  completeList.innerHTML = '';

  showBooks.forEach(book => {
    const container = book.isComplete ? completeList : inCompleteList;
    container.appendChild(createBookItem(book));
  });
};

const setupEventListener = () => {
  document.getElementById('bookForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('searchBook').addEventListener('submit', (n) => {
    n.preventDefault();
    const searchTerm = document.getElementById('searchBookTitle').value.toLowerCase();
    const filtered = bookList.filter(book => book.title.toLowerCase().includes(searchTerm));
    renderBooksData(filtered);
  });
  document.addEventListener('click', handleBookAction);
};

document.addEventListener('DOMContentLoaded', initializeApp);