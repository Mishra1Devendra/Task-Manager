
/* =================================
   1. SELECT HTML ELEMENTS
================================= */

const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const dueDateInput = document.querySelector("#dueDate");

const taskList = document.querySelector("#taskList");
const taskFilters = document.querySelector("#taskFilters");
const searchInput = document.querySelector("#searchInput");
const emptyState = document.querySelector("#emptyState");

const totalTasks = document.querySelector("#totalTasks");
const completedCount = document.querySelector("#completedCount");
const pendingCount = document.querySelector("#pendingCount");
const overdueCount = document.querySelector("#overdueCount");


/* =================================
   2. APPLICATION DATA
================================= */

// Load previously saved tasks.
// If nothing is saved, start with an empty array.

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem("myTasks");

        return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
        console.error("Could not load saved tasks:", error);
        return [];
    }
}

let tasks = loadTasks();

let currentFilter = "all";


/* =================================
   3. HELPER FUNCTIONS
================================= */

// Get today's date in YYYY-MM-DD format.

function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Check whether a task is overdue.

function isOverdue(task) {
    return (
        task.dueDate !== "" &&
        task.dueDate < getToday() &&
        !task.completed
    );
}


// Save tasks in browser storage.

function saveTasks() {
    localStorage.setItem("myTasks", JSON.stringify(tasks));
}


/* =================================
   4. ADD A NEW TASK
================================= */

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    // Create a task object.

    const newTask = {
        id: crypto.randomUUID(),
        title: taskText,
        dueDate: dueDate,
        completed: false
    };

    // Add object to array.

    tasks.push(newTask);

    // Save and update webpage.

    saveTasks();
    renderTasks();

    // Clear input fields.

    taskInput.value = "";
    dueDateInput.value = "";

});


/* =================================
   5. DISPLAY TASKS
================================= */

function renderTasks() {

    taskList.innerHTML = "";

    const searchText = searchInput.value.trim().toLowerCase();

    // Filter tasks according to selected filter.

    const filteredTasks = tasks.filter(function(task) {

        const matchesSearch = task.title.toLowerCase().includes(searchText);

        let matchesFilter = true;

        if (currentFilter === "pending") {
            matchesFilter = !task.completed;
        }

        else if (currentFilter === "completed") {
            matchesFilter = task.completed;
        }

        else if (currentFilter === "overdue") {
            matchesFilter = isOverdue(task);
        }

        return matchesSearch && matchesFilter;

    });


    // Create HTML for every visible task.

    filteredTasks.forEach(function(task) {

        const li = document.createElement("li");
        li.classList.add("taskItem");

        if (task.completed) {
            li.classList.add("completed");
        }

        const content = document.createElement("div");
        content.classList.add("task-content");

        const title = document.createElement("p");
        title.classList.add("task-title");
        title.textContent = task.title;

        const date = document.createElement("p");
        date.classList.add("task-date");

        if (task.dueDate) {
            date.textContent = "Due: " + task.dueDate;
        } else {
            date.textContent = "No due date";
        }

        if (isOverdue(task)) {
            date.classList.add("overdue-label");
            date.textContent += " (Overdue)";
        }

        content.appendChild(title);
        content.appendChild(date);


        // Complete button.

        const completeBtn = document.createElement("button");

        completeBtn.type = "button";
        completeBtn.classList.add("complete-btn");

        completeBtn.textContent = task.completed
            ? "Undo"
            : "Complete";

        completeBtn.dataset.action = "complete";
        completeBtn.dataset.id = task.id;


        // Delete button.

        const deleteBtn = document.createElement("button");

        deleteBtn.type = "button";
        deleteBtn.classList.add("delete-btn");

        deleteBtn.textContent = "Delete";

        deleteBtn.dataset.action = "delete";
        deleteBtn.dataset.id = task.id;


        // Add elements to task card.

        li.appendChild(content);
        li.appendChild(completeBtn);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);

    });


    // Show empty state when no tasks match.

    emptyState.hidden = filteredTasks.length !== 0;

    updateStatistics();

}


/* =================================
   6. COMPLETE AND DELETE TASKS
================================= */

// Event delegation: listen for clicks on the task list.

taskList.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button || !taskList.contains(button)) {
        return;
    }

    const taskId = button.dataset.id;
    const action = button.dataset.action;


    if (action === "complete") {

        tasks = tasks.map(function(task) {

            if (task.id === taskId) {
                return {
                    ...task,
                    completed: !task.completed
                };
            }

            return task;

        });

    }


    else if (action === "delete") {

        tasks = tasks.filter(function(task) {
            return task.id !== taskId;
        });

    }


    saveTasks();
    renderTasks();

});


/* =================================
   7. FILTER TASKS
================================= */

taskFilters.addEventListener("click", function(event) {

    const button = event.target.closest("[data-filter]");

    if (!button) {
        return;
    }

    currentFilter = button.dataset.filter;

    // Update active filter button.

    document.querySelectorAll(".filter-btn").forEach(function(btn) {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    renderTasks();

});


/* =================================
   8. SEARCH TASKS
================================= */

searchInput.addEventListener("input", function() {
    renderTasks();
});


/* =================================
   9. UPDATE STATISTICS
================================= */

function updateStatistics() {

    const completed = tasks.filter(function(task) {
        return task.completed;
    }).length;

    const pending = tasks.filter(function(task) {
        return !task.completed;
    }).length;

    const overdue = tasks.filter(function(task) {
        return isOverdue(task);
    }).length;

    totalTasks.textContent = tasks.length;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
    overdueCount.textContent = overdue;

}


/* =================================
   10. DISPLAY CURRENT DATE
================================= */

document.querySelector("#currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });


/* =================================
   11. INITIALIZE APPLICATION
================================= */

// Display saved tasks when the page opens.

renderTasks();
