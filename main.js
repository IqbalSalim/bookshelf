let books = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "BOOK_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const searchBook = document.getElementById("searchBook");
  searchBook.addEventListener("submit", function (event) {
    const searchBookTitle = document.getElementById("searchBookTitle").value;
    event.preventDefault();
    searcBook(searchBookTitle);
  });
});

function searcBook(searchBookTitle) {
  if (isStorageExist()) {
    books = [];
    loadDataFromStorage();
  }
  let re = new RegExp(`${searchBookTitle}` + ".*", "gi");
  let searchArray = books.filter((i) => i.title.match(re));
  books = searchArray;
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBook() {
  const id = generateId();
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("inputBookIsComplete").checked;

  const bookObject = generateBookObject(id, title, author, year, isComplete);
  books.push(bookObject);
  console.log(books);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  clearForm();
}

function clearForm() {
  document.getElementById("inputBookTitle").value = "";
  document.getElementById("inputBookAuthor").value = "";
  document.getElementById("inputBookYear").value = "";
  document.getElementById("inputBookIsComplete").checked = false;
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: parseInt(year),
    isComplete,
  };
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser ini tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  incompleteBookshelfList.innerHTML = "";

  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );
  completeBookshelfList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) incompleteBookshelfList.append(bookElement);
    else completeBookshelfList.append(bookElement);
  }

  document.getElementById("bookSubmit").style.display = "block";
  const buttonFormEditContainer = document.getElementById("buttonFormEdit");
  buttonFormEditContainer.innerHTML = "";
  clearForm();
});

function makeBook(bookObject) {
  const article = document.createElement("article");
  article.setAttribute("class", "book_item");
  article.setAttribute("id", `book-${bookObject.id}`);

  const bookTitle = document.createElement("h3");
  bookTitle.innerText = bookObject.title;

  const author = document.createElement("p");
  author.innerText = bookObject.author;

  const year = document.createElement("p");
  year.innerText = bookObject.year;

  const action = document.createElement("div");
  action.setAttribute("class", "action");

  article.append(bookTitle, author, year, action);

  if (bookObject.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("green");
    undoButton.innerText = "Belum selesai di Baca";

    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus buku";

    deleteButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("blue");
    editButton.innerText = "Edit buku";

    editButton.addEventListener("click", function () {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      editBook(bookObject.id);
    });

    action.append(undoButton, deleteButton, editButton);
  } else {
    const finishButton = document.createElement("button");
    finishButton.classList.add("green");
    finishButton.innerText = "Selesai dibaca";

    finishButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus buku";

    deleteButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("blue");
    editButton.innerText = "Edit buku";

    editButton.addEventListener("click", function () {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      editBook(bookObject.id);
    });

    action.append(finishButton, deleteButton, editButton);
  }

  return article;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function editBook(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  showDataToFromEdit(bookTarget);
  changeButtonFormEdit(bookTarget);
}

function showDataToFromEdit(bookTarget) {
  document.getElementById("inputBookTitle").value = bookTarget.title;
  document.getElementById("inputBookAuthor").value = bookTarget.author;
  document.getElementById("inputBookYear").value = bookTarget.year;
  document.getElementById("inputBookIsComplete").checked =
    bookTarget.isComplete;
}

function changeButtonFormEdit(bookTarget) {
  document.getElementById("bookSubmit").style.display = "none";
  const buttonFormEditContainer = document.getElementById("buttonFormEdit");
  buttonFormEditContainer.innerHTML = "";
  const btnEdit = document.createElement("button");
  btnEdit.setAttribute("id", "btn_edit");
  btnEdit.setAttribute("type", "submit");
  btnEdit.innerText = "Simpan Perubahan";

  btnEdit.addEventListener("click", function () {
    updateData(bookTarget);
  });

  const btnCancelled = document.createElement("button");
  btnCancelled.setAttribute("id", "btn_cancelled");
  btnCancelled.setAttribute("type", "button");
  btnCancelled.innerText = "Batal";

  btnCancelled.addEventListener("click", function () {
    document.getElementById("bookSubmit").style.display = "block";
    buttonFormEditContainer.innerHTML = "";
    clearForm();
  });

  buttonFormEditContainer.append(btnEdit, btnCancelled);
}

function updateData(bookTarget) {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("inputBookIsComplete").checked;

  bookTarget.title = title;
  bookTarget.author = author;
  bookTarget.year = parseInt(year);
  bookTarget.isComplete = isComplete;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
