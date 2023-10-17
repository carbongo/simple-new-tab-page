// Import the JSON data from data.json
import initialData from "./initialData.json";

// Store initial data in localStorage if it's not already stored
if (!localStorage.getItem("websiteData")) {
  localStorage.setItem("websiteData", JSON.stringify(initialData));
}

// Function to save to localStorage
const saveToLocalStorage = (data) => {
  localStorage.setItem("websiteData", JSON.stringify(data));
};

// Function to restore initial data
const restoreInitialData = () => {
  const userConfirmed = confirm(
    "Are you sure you want to restore to initial data? This action cannot be undone."
  );
  if (userConfirmed) {
    elements = JSON.parse(JSON.stringify(initialData));
    saveToLocalStorage(elements);
    updateGrid();
    closeModal();
  }
};

// Retrieve data from localStorage
const storedData = localStorage.getItem("websiteData");
let elements = JSON.parse(storedData);

// Get the grid container
const gridContainer = document.getElementById("grid");

let draggedItem = null;

// Function to handle drag start
function handleDragStart(e) {
  draggedItem = this;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", this.innerHTML);
  document.body.style.overflow = "hidden";
}

// Function to handle drag over
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = "move";
  return false;
}

// Function to handle drop
function handleDrop(e) {
  if (e.stopImmediatePropagation) {
    e.stopImmediatePropagation();
  }

  // Don't do anything if dropping on the same item
  if (draggedItem !== this) {
    draggedItem.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData("text/html");

    // Update the elements array based on the new order
    const fromIndex = Number(draggedItem.dataset.index);
    const toIndex = Number(this.dataset.index);
    const movedItem = elements.splice(fromIndex, 1)[0];
    elements.splice(toIndex, 0, movedItem);

    // Save the new order to localStorage
    saveToLocalStorage(elements);
    updateGrid();
  }
  document.body.style.overflow = "auto";

  return false;
}

// Function to show the context menu
function showContextMenu(e, gridItem, index, element) {
  e.preventDefault();
  const contextMenu = document.createElement("div");
  contextMenu.className = "context-menu";

  const editOption = document.createElement("button");
  editOption.textContent = "Edit";
  editOption.className = "edit-button";
  editOption.addEventListener("click", (e) => {
    e.stopImmediatePropagation();
    const newTitle = prompt("Enter new title:", element.title);
    const newUrl = prompt("Enter new url:", element.url);
    const newIcon = prompt("Enter new icon URL:", element.icon);
    elements[index].title = newTitle;
    elements[index].url = newUrl;
    elements[index].icon = newIcon;
    saveToLocalStorage(elements);
    updateGrid();
  });

  const deleteOption = document.createElement("button");
  deleteOption.textContent = "Delete";
  deleteOption.className = "delete-button";
  deleteOption.addEventListener("click", (e) => {
    e.stopImmediatePropagation();
    elements.splice(index, 1);
    saveToLocalStorage(elements);
    updateGrid();
  });

  contextMenu.appendChild(editOption);
  contextMenu.appendChild(deleteOption);

  gridItem.appendChild(contextMenu);
}

const updateGrid = () => {
  // Clear existing items
  gridContainer.innerHTML = "";
  // Loop through each element and populate the grid
  elements.forEach((element, index) => {
    const gridItem = document.createElement("div");
    gridItem.className = "grid-item";
    gridItem.dataset.index = index;

    const img = document.createElement("img");
    img.src = element.icon ? element.icon : `${element.url}/favicon.ico`;

    const title = document.createElement("p");
    title.textContent = element.title;

    gridItem.appendChild(img);
    gridItem.appendChild(title);

    gridItem.addEventListener("click", (e) => {
      e.stopImmediatePropagation();
      window.open(element.url, "_self");
    });

    // Right-click context menu
    gridItem.addEventListener(
      "contextmenu",
      (e) => showContextMenu(e, gridItem, index, element),
      { once: true }
    );
    // Attach touch event to mimic long press context menu on mobile devices
    gridItem.addEventListener(
      "touchstart",
      function (e) {
        touchTimer = setTimeout(() => showContextMenu(e, this, index), 500); // 500 milliseconds (1/2 second) to trigger
      },
      { once: true }
    );

    gridItem.addEventListener("touchend", function (e) {
      clearTimeout(touchTimer);
    });

    gridItem.addEventListener("touchmove", function (e) {
      clearTimeout(touchTimer);
    });
    gridItem.addEventListener("dragstart", handleDragStart, false);
    gridItem.addEventListener("dragover", handleDragOver, false);
    gridItem.addEventListener("drop", handleDrop, false);
    gridItem.setAttribute("draggable", "true");

    gridContainer.appendChild(gridItem);
  });
};

// Initialize the grid
updateGrid();

// Add new item functionality
const addNewItem = () => {
  const title = prompt("Enter the title:");
  const url = prompt("Enter the URL:");
  const icon = prompt("Enter the icon URL:");
  elements.push({ title, url, icon });
  saveToLocalStorage(elements);
  updateGrid();
};

// Function to export data to a JSON file
const exportData = () => {
  const dataStr = JSON.stringify(elements);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.download = "exported_data.json";
  link.href = url;
  link.click();
};

// Function to import data from a JSON file
const importData = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        elements = importedData;
        saveToLocalStorage(elements);
        updateGrid();
        closeModal();
      } catch (error) {
        alert("Invalid JSON file. Please select a valid exported JSON file.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

// Function to open modal
const openModal = () => {
  document.getElementById("modal").classList.add("open");
};

// Function to close modal
const closeModal = () => {
  document.getElementById("modal").classList.remove("open");
};

document.addEventListener("click", (e) => {
  e.stopImmediatePropagation();
  updateGrid();
});
document.getElementById("add").addEventListener("click", addNewItem);
document.getElementById("reset").addEventListener("click", restoreInitialData);
document.getElementById("export").addEventListener("click", exportData);
document.getElementById("import").addEventListener("click", importData);
document.getElementById("openModal").addEventListener("click", openModal);
document.getElementById("closeModal").addEventListener("click", closeModal);
