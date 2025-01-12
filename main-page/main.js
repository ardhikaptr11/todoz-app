let categories = {
	personal: { todo: [], done: [] },
	business: { todo: [], done: [] },
	work: { todo: [], done: [] }
};

let currentActiveCategory = "personal";
let currentActiveTab = "todo";
let selectedPriority = null;
let addTaskCardClicked = false;
let taskCardClicked = false;
let categoryTabs = document.querySelectorAll(".category");
let firstRender = true;
let totalTodo = 0;
let totalDone = 0;

const navbar = document.getElementById("navbar");
const reminderText = document.getElementById("reminder");
const platformLogo = document.getElementById("platform-logo");

for (const category in categories) {
	if (categories[category].todo.length === 0) {
		reminderText.textContent = "You have not added some tasks yet";
	}
}

const statusColumn = document.getElementById("status-column");
const todoTab = document.getElementById("todo");
const doneTab = document.getElementById("done");
const tasksArea = document.getElementById("tasks-area");
const addTaskCard = document.getElementById("add-task");
const addTaskButton = document.getElementById("add-task-button");
const fields = document.querySelectorAll(
	"#add-task-modal .modal-content > div:not(.checkbox-wrapper-42):not(.cta-button)"
);
const categoryNameInput = document.getElementById("category-name-input");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const checkbox = document.querySelector("#cbx-42");
const dueDateInput = document.getElementById("due-date-input");
const taskDueDate = document.getElementById("task-due-date");
const priorityLevelSelection = taskDueDate.addEventListener("input", () => {
	taskDueDate.value === "" ? (taskDueDate.style.color = "#ccc") : (taskDueDate.style.color = "#4a505c");
});
const selected = document.getElementById("selected");
const options = document.querySelectorAll(".option");
const optionsContainer = document.getElementById("options");
const categoryInput = document.getElementById("category-name");
const ctaButton = document.querySelector(".cta-button");
const cancelButton = ctaButton.querySelector("button:not(:first-of-type)");
const confirmButton = ctaButton.querySelector("button:first-of-type");
const addCategoryModal = document.getElementById("add-category-modal");
const addTaskModal = document.getElementById("add-task-modal");
const addCategoryButton = document.querySelector("button#add-category");

const totalTasks = Object.values(categories).reduce((total, category) => total + category.todo.length, 0);
const screenWidth = window.innerWidth;

if (totalTasks === 0 && screenWidth <= 576) {
	tasksArea.style.justifyContent = "center";
}

const resetCheckboxState = () => {
	checkbox.checked = false;
	dueDateInput.classList.remove("show");
	dueDateInput.classList.add("hide");
	dueDateInput.classList.remove("error");
	taskDueDate.value = "";
	taskDueDate.style.color = "#ccc";
};

const resetError = () => {
	fields.forEach((field) => {
		field.classList.remove("error");
	});
};

const disablePointerEvents = () => {
	fields.forEach((field) => {
		const inputs = field.querySelectorAll("input, textarea");
		inputs.forEach((input) => {
			input.style.pointerEvents = "none";
		});
	});
	checkbox.nextElementSibling.style.pointerEvents = "none";
	selected.style.pointerEvents = "none";
};

const resetPointerEvents = () => {
	fields.forEach((field) => {
		const inputs = field.querySelectorAll("input, textarea");
		inputs.forEach((input) => {
			input.style.pointerEvents = "auto";
		});
	});
	checkbox.nextElementSibling.style.pointerEvents = "auto";
	selected.style.pointerEvents = "auto";
};

// Reset all the previous states include the checkbox
const resetAll = () => {
	titleInput.value = "";
	descriptionInput.value = "";
	resetCheckboxState();
	resetError();
	resetPointerEvents();
	selectedPriority = null;
	selected.querySelector("p").textContent = "Select priority level";
	selected.style.color = "#ccc";
};

const stripTime = (date) => new Date(date.toDateString());

const isLate = (deadline, currentDate = new Date()) => {
	if (!deadline) return false;

	const deadlineDate = stripTime(new Date(deadline));
	const today = stripTime(new Date(currentDate));

	return today > deadlineDate;
};

const setPriorityLevel = (priority) => {
	switch (priority) {
		case "High":
			return "high";
			break;
		case "Medium":
			return "medium";
			break;
		case "Low":
			return "low";
			break;
		default:
			return "";
	}
};

const createPriorityLevelBar = (priority) => {
	switch (priority) {
		case "High":
			return `<div class="bar high"></div>
			<div class="bar high"></div>
			<div class="bar high"></div>`;
		case "Medium":
			return `<div class="bar medium"></div>
			<div class="bar medium"></div>
			<div class="bar"></div>`;
		case "Low":
			return `<div class="bar low"></div>
			<div class="bar"></div>
			<div class="bar"></div>`;
		default:
			return `<div class="bar"></div>
			<div class="bar"></div>
			<div class="bar"></div>`;
	}
};

const getDayFromDate = (date) => {
	const day = new Date(date).getDay();
	const dayInNumber = {
		1: "Mon",
		2: "Tue",
		3: "Wed",
		4: "Thu",
		5: "Fri",
		6: "Sat",
		7: "Sun"
	};

	const adjustedDay = day === 0 ? 7 : day;
	return dayInNumber[adjustedDay];
};

const validateInput = () => {
	let isValid = true;
	fields.forEach((field) => {
		const inputs = field.querySelectorAll("input[required], textarea[required]");

		if (field.classList.contains("hide")) {
			return;
		}

		inputs.forEach((input) => {
			field.classList.toggle("error", !input.value);
		});

		if (!descriptionInput.value) {
			field.id.includes("description-input") ? field.classList.toggle("error", true) : null;
			isValid = false;
		}

		if (checkbox.checked && !taskDueDate.value) {
			dueDateInput.classList.toggle("error", true);
			isValid = false;
		}

		if (!selectedPriority) {
			field.id.includes("priority-level-selection") ? field.classList.toggle("error", true) : null;
			isValid = false;
		}
	});

	return isValid;
};

const toTitleCase = (str) => {
	return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const setIcon = (category) => {
	switch (category) {
		case "sport":
			return "<ion-icon name='bicycle-outline'></ion-icon>";
		case "productivity":
			return '<ion-icon name="bulb-outline"></ion-icon>';
		case "coding":
			return '<ion-icon name="code-slash-outline"></ion-icon>';
		case "school":
			return '<ion-icon name="library-outline"></ion-icon>';
		case "fitness":
			return '<ion-icon name="fitness-outline"></ion-icon>';
		default:
			return '<ion-icon name="heart-outline"></ion-icon>';
	}
};

const renderCategoryTab = (category) => {
	const categoryButton = document.createElement("button");
	categoryButton.className = "category";
	categoryButton.id = category;
	categoryButton.innerHTML = `
		${setIcon(category.toLowerCase())}
		<p>${toTitleCase(category)}</p>
	`;
	categoryButton.addEventListener("click", (e) => {
		switchCategory(category);
		toggleCategoryTabs();
		renderTasks();
	});
	document.querySelector("#category-list").appendChild(categoryButton);

	categoryTabs = document.querySelectorAll(".category");
};

const addNewCategory = (category) => {
	if (!category) {
		closeAddCategoryModal();
		return;
	}

	if (category.includes(" ")) {
		categoryNameInput.classList.toggle("error-contain-whitespace", true);
		return;
	}

	if (category in categories) {
		categoryNameInput.classList.toggle("error", true);
		return;
	}

	categories[category] = { todo: [], done: [] };
	renderCategoryTab(category);
	closeAddCategoryModal();
};

const addTask = () => {
	const taskTitle = titleInput.value;
	const taskDescription = descriptionInput.value;
	const taskHasDueDate = checkbox.checked ? true : false;
	const dueDate = taskHasDueDate ? taskDueDate.value : null;
	const taskPriority = selectedPriority;

	const isValid = validateInput();

	if (isValid) {
		categories[currentActiveCategory].todo.push({
			title: taskTitle,
			description: taskDescription,
			hasDueDate: taskHasDueDate,
			dueDate: dueDate,
			priority: taskPriority
		});

		const task = categories[currentActiveCategory].todo[categories[currentActiveCategory].todo.length - 1];
		renderTaskCard(task);
		totalTodo++;
		renderHeadContent();
	}
};

const closeAddTaskModal = () => {
	const addTaskModal = document.getElementById("add-task-modal");
	const screenWidth = window.innerWidth;
	addTaskModal.classList.remove("show");
	addTaskModal.classList.add("hide");
	screenWidth >= 768 ? (addTaskButton.style.display = "none") : (addTaskButton.style.display = "block");
	navbar.style.zIndex = "999";
	document.documentElement.style.overflow = "auto";
	addTaskCardClicked = false;
	resetAll();
};

const closeAddCategoryModal = () => {
	categoryInput.value = "";
	addCategoryModal.classList.remove("show");
	categoryNameInput.classList.remove("error");
	categoryNameInput.classList.remove("error-contain-whitespace");
};

const openAddTaskModal = () => {
	addTaskModal.classList.toggle("show");
	addTaskButton.style.display = "none";
	addTaskModal.style.zIndex = "999";
	document.documentElement.style.overflow = "hidden";

	if (addTaskCardClicked) {
		confirmButton.textContent = "OK";
		cancelButton.textContent = "Cancel";
		resetPointerEvents();
	} else {
		confirmButton.textContent = "Cancel";
		cancelButton.textContent = "Delete";
		disablePointerEvents();
	}

	fields.forEach((field) => {
		const inputs = field.querySelectorAll("input, textarea");
		inputs.forEach((input) => {
			input.addEventListener("input", () => {
				field.classList.remove("error");
			});
		});

		options.forEach((option) => {
			option.addEventListener("click", () => {
				field.id.includes("priority-level-selection") ? field.classList.remove("error") : null;
			});
		});
	});
};

const addCategoryConfirmationButton = document.querySelector("#add-category-modal .cta-button button");
const openAddCategoryModal = () => {
	addCategoryModal.classList.toggle("show");
	categoryInput.addEventListener("input", () => {
		categoryNameInput.classList.remove("error");
		categoryNameInput.classList.remove("error-contain-whitespace");
	});
};

addCategoryConfirmationButton.addEventListener("click", () => {
	const categoryName = categoryInput.value;
	addNewCategory(categoryName);
});

addCategoryButton.addEventListener("click", openAddCategoryModal);
[addTaskCard, addTaskButton].forEach((el) =>
	el.addEventListener("click", () => {
		addTaskCardClicked = true;
		openAddTaskModal();
	})
);

cancelButton.addEventListener("click", () => {
	cancelButton.textContent === "Cancel" ? closeAddTaskModal() : deleteTask(titleInput.value);
});

confirmButton.addEventListener("click", () => {
	confirmButton.textContent === "OK" ? addTask() : closeAddTaskModal();
});

const calculateTotalIncompleteTasks = () => {
	const todoTasks = Object.values(categories).reduce((total, category) => total + category.todo.length, 0);
	return todoTasks;
};

const calculateTotalCompletedTasks = () => {
	const completedTasks = Object.values(categories).reduce((total, category) => total + category.done.length, 0);
	return completedTasks;
};

const renderHeadContent = () => {
	const tracker = document.getElementById("tracker");

	const totalIncomplete = calculateTotalIncompleteTasks();

	if (totalDone === totalTodo) {
		tracker.innerHTML = `
			<div class="platform-logo">
				<p><span>T</span>o<span>D</span>o<span>Z</span></p>
			</div>
		`;

		const totalDoneTasks = Object.values(categories).reduce((total, category) => total + category.done.length, 0);
		totalDoneTasks >= 1
			? (reminderText.textContent = "You have completed all tasks")
			: (reminderText.textContent = "You have not added some tasks yet");
	} else {
		tracker.innerHTML = `
			<div id="days">
				<h1 id="completed">${totalDone}</h1>
				<hr />
				<h1 id="incomplete">${totalTodo}</h1>
			</div>
		`;
		reminderText.innerHTML = `You have <span id='tasks-incomplete'></span> incomplete tasks`;
		const tasksIncomplete = document.getElementById("tasks-incomplete");
		tasksIncomplete.textContent = totalIncomplete;
	}

	if (firstRender) {
		firstRender = false;
	}
};

const markTaskAsDone = (e) => {
	taskCardClicked = false;
	totalDone++;
	const taskCard = e.target.closest(".task-card");
	const taskTitle = taskCard.querySelector(".task-title");
	const completedPerDay = document.getElementById("completed");

	taskTitle.style.textDecoration = "line-through";
	taskTitle.style.transition = "text-decoration 0.5s ease";

	setTimeout(() => {
		const taskToRemove = categories[currentActiveCategory].todo.find(
			(task) => task.title === taskTitle.textContent
		);

		categories[currentActiveCategory].todo = categories[currentActiveCategory].todo.filter(
			(task) => task.title !== taskTitle.textContent
		); // This will equal to empty list because the test is failed

		categories[currentActiveCategory].done.push(taskToRemove);
		renderTasks();
		renderHeadContent();
	}, 500);
};

const toggleModal = (modal, button) => {
	const isVisible = modal.style.display === "block";
	const modals = document.querySelectorAll(".delete-task-modal");
	modals.forEach((m) => (m.style.display = "none"));
	if (!isVisible) {
		const rect = button.getBoundingClientRect();
		modal.style.top = `${button.offsetTop + button.offsetHeight + 3}px`;

		if (screenWidth <= 320) {
			modal.style.left = `${screenWidth - 0.45 * screenWidth}px`;
		} else if (screenWidth <= 390) {
			modal.style.left = `${screenWidth - 0.375 * screenWidth}px`;
		} else if (screenWidth <= 395) {
			modal.style.left = `${screenWidth - 0.365 * screenWidth}px`;
		} else if (screenWidth <= 420) {
			modal.style.left = `${screenWidth - 0.35 * screenWidth}px`;
		} else if (screenWidth <= 430) {
			modal.style.left = `${screenWidth - 0.335 * screenWidth}px`;
		} else if (screenWidth <= 576) {
			modal.style.left = `${screenWidth - 0.25 * screenWidth}px`;
		} else {
			modal.style.left = `${button.offsetLeft + 3}px`;
		}
		modal.style.display = "flex";
	} else {
		modal.style.display = "none";
	}
};

const deleteTask = (titleToDelete) => {
	if (!taskCardClicked) {
		categories[currentActiveCategory][currentActiveTab] = categories[currentActiveCategory][
			currentActiveTab
		].filter((task) => task.title !== titleToDelete);
	} else {
		const index = categories[currentActiveCategory][currentActiveTab].findIndex(
			(task) => task.title === titleToDelete
		);
		categories[currentActiveCategory][currentActiveTab].splice(index, 1);
		totalTodo--;
		closeAddTaskModal();
		renderHeadContent();
	}

	renderTasks();
};

const renderTaskCard = (task) => {
	const taskCard = document.createElement("div");
	const index = categories[currentActiveCategory][currentActiveTab].indexOf(task);
	taskCard.className = "task-card";
	taskCard.innerHTML = `
		<div class="head">
			<h6 class="task-title">${task.title}</h6>
			<ion-icon name="ellipsis-vertical-outline" class="options-icon"></ion-icon>
			<p class="task-status ${isLate(task.dueDate) ? "late" : "on-track"}">${isLate(task.dueDate) ? "Late" : "On track"}</p>
		</div>
		<div class="body">
			<p class="description">
				${task.description}
			</p>
			<div class="task-details">
				<div class="due-date ${!task.hasDueDate ? "hide" : "show"} ${setPriorityLevel(task.priority)}">
					<p>${getDayFromDate(task.dueDate)}</p>
				</div>
				<div class="priority-level-bar">
					${createPriorityLevelBar(task.priority)}
				</div>
			</div>
		</div>
		<div class="foot">
			<div class="checkbox-wrapper-23">
				<input type="checkbox" class="check-23" />
				<label for="check-23">
					<svg viewBox="0,0,50,50">
						<path d="M5 30 L 20 45 L 45 5"></path>
					</svg>
				</label>
			</div>
			<p>Mark as done</p>
		</div>
		<div class="delete-task-modal" id="modal-${index}">
			<ion-icon name="trash-outline"></ion-icon>
			<p>Delete</p>
		</div>
		`;

	const addTaskCard = document.getElementById("add-task");

	currentActiveTab === "done" ? tasksArea.appendChild(taskCard) : tasksArea.insertBefore(taskCard, addTaskCard);

	closeAddTaskModal();

	if (currentActiveTab === "todo") {
		if (screenWidth <= 576 && tasksArea.querySelector("#no-tasks-added")) {
			tasksArea.querySelector("#no-tasks-added").style.display = "none";
		}

		if (screenWidth <= 992) {
			taskCard.classList.add("no-hover");
		}

		const head = taskCard.querySelector(".head");
		head.style.rowGap = "0";

		taskCard.addEventListener("click", (e) => {
			taskCardClicked = true;
			const isCheckbox = e.target.classList.contains("check-23");

			if (!isCheckbox) {
				openAddTaskModal();
				const addTaskModal = document.getElementById("add-task-modal");
				addTaskModal.querySelector("#task-title").value = task.title;
				addTaskModal.querySelector("#task-description").value = task.description;
				addTaskModal.querySelector("#cbx-42").checked = task.hasDueDate;
				if (task.hasDueDate) {
					addTaskModal.querySelector("#due-date-input").classList.remove("hide");
					addTaskModal.querySelector("#due-date-input").classList.add("show");
				}
				addTaskModal.querySelector("#task-due-date").value = task.dueDate;
				addTaskModal.querySelector("#selected p").textContent = task.priority;
			}
		});

		taskCard.querySelectorAll(".options-icon").forEach((icon) => {
			icon.style.display = "none";
		});

		taskCard.querySelectorAll(".delete-task-modal").forEach((modal) => {
			modal.style.display = "none";
		});
	}

	if (currentActiveTab === "done") {
		taskCard.classList.add("no-hover");
		taskCard.style.cursor = "default";

		taskCard.querySelectorAll(".foot").forEach((foot) => {
			foot.style.display = "none";
		});

		const optionsIcon = taskCard.querySelector(".options-icon");
		const deletionModal = taskCard.querySelector(`#modal-${index}`);
		optionsIcon.addEventListener("click", (e) => {
			const taskTitle = taskCard.querySelector(".task-title").textContent;
			toggleModal(deletionModal, e.target);
			deletionModal.addEventListener(
				"click",
				() => {
					deleteTask(task.title);
				},
				{ once: true }
			);
		});

		if (taskCard.contains(deletionModal)) {
			document.addEventListener("click", (e) => {
				if (!e.target.closest(`#modal-${index}`) && !e.target.closest(".options-icon")) {
					deletionModal.style.display = "none";
				}
			});
		}
	}

	const checkbox = taskCard.querySelector(".check-23");
	checkbox.addEventListener("change", markTaskAsDone);
};

const renderTasks = () => {
	tasksArea.innerHTML = "";
	tasksArea.style.justifyContent = "stretch";
	const tasks = categories[currentActiveCategory][currentActiveTab];

	if (tasks.length === 0 && currentActiveTab === "todo" && screenWidth <= 576) {
		tasksArea.style.justifyContent = "center";
		tasksArea.innerHTML = "<p id='no-tasks-added'>No tasks added yet.</p>";
		return;
	}

	if (tasks.length === 0 && currentActiveTab === "done") {
		tasksArea.style.justifyContent = "center";
		tasksArea.innerHTML = "<p>No tasks completed yet.</p>";
		return;
	}

	tasks.forEach((task) => {
		renderTaskCard(task);
	});

	if (currentActiveTab === "todo") {
		const addTaskCard = document.createElement("div");
		addTaskCard.id = "add-task";
		addTaskCard.innerHTML = `
				<ion-icon name="add-outline"></ion-icon>
				<p>Add new task</p>
			`;
		addTaskCard.addEventListener("click", () => {
			addTaskCardClicked = true;
			openAddTaskModal();
		});
		tasksArea.appendChild(addTaskCard);
	}
};

const toggleStatusTabs = () => {
	todoTab.classList.toggle("active", currentActiveTab === "todo");
	doneTab.classList.toggle("active", currentActiveTab === "done");
};

const toggleCategoryTabs = () => {
	categoryTabs.forEach((button) => {
		button.classList.toggle("active", button.innerText.toLowerCase() === currentActiveCategory);
	});
};

const switchTab = (tab) => {
	currentActiveTab = tab;
	const screenWidth = window.innerWidth;

	currentActiveTab === "todo"
		? screenWidth >= 768
			? (addTaskButton.style.display = "none")
			: (addTaskButton.style.display = "block")
		: (addTaskButton.style.display = "none");

	toggleStatusTabs();
	renderTasks();
};

const switchCategory = (category) => {
	currentActiveCategory = category;
	switchTab("todo");
	toggleCategoryTabs();
	renderTasks();
};

categoryTabs.forEach((button) => {
	button.addEventListener("click", (e) => {
		const category = e.target.innerText.toLowerCase();
		switchCategory(category);
		renderTasks();
	});
});

todoTab.addEventListener("click", () => switchTab("todo"));
doneTab.addEventListener("click", () => switchTab("done"));

addCategoryModal.addEventListener("click", (e) => {
	if (!e.target.closest(".modal-content")) {
		closeAddCategoryModal();
	}
});

checkbox.addEventListener("change", () => {
	if (checkbox.checked) {
		dueDateInput.classList.remove("hide");
		dueDateInput.classList.add("show");
	} else {
		dueDateInput.classList.remove("show");
		dueDateInput.classList.add("hide");
		dueDateInput.classList.remove("error");
	}
});

selected.addEventListener("click", () => {
	optionsContainer.classList.toggle("show");

	optionsContainer.classList.contains("show")
		? (selected.style.borderBottom = "2px solid #5d60ef")
		: (selected.style.borderBottom = "2px solid #ccc");
});

options.forEach((option) => {
	option.addEventListener("click", () => {
		selected.querySelector("p").textContent = option.textContent;
		selectedPriority = option.textContent;
		selected.style.color = "#4a505c";
		selected.style.fontSize = "16px";
		optionsContainer.classList.remove("show");
		selected.style.borderBottom = "2px solid #ccc";
		selected.querySelector(".icon").style.display = "block";
	});
});

window.addEventListener("click", (e) => {
	if (!e.target.closest("#priority-level-selection")) {
		optionsContainer.classList.remove("show");
		selected.style.borderBottom = "2px solid #ccc";
	}
});
