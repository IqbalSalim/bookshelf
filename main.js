const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
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

  const searchForm = document.getElementById("searchSubmit");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searcBook();
  });
});

function searcBook(title) {}

function addBook() {
  const id = generateId();
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("inputBookIsComplete").checked;

  const bookObject = generateBookObject(id, title, author, year, isComplete);
  books.push(bookObject);

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
    year,
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
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

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

  //   const textTitle = document.createElement("h2");
  //   textTitle.innerText = todoObject.task;

  //   const textTimestamp = document.createElement("p");
  //   textTimestamp.innerText = todoObject.timestamp;

  //   const textContainer = document.createElement("div");
  //   textContainer.classList.add("inner");
  //   textContainer.append(textTitle, textTimestamp);

  //   const container = document.createElement("div");
  //   container.classList.add("item", "shadow");
  //   container.append(textContainer);
  //   container.setAttribute("id", `todo-${todoObject.id}`);

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

    action.append(undoButton, deleteButton);
  } else {
    const finishButton = document.createElement("button");
    finishButton.classList.add("green");
    finishButton.innerText = "Selesai dibaca";

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus buku";

    finishButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    action.append(finishButton, deleteButton);
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
