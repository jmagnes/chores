let tasks = [];
let selectedTask = null;

// Fetch data from JSON files
async function fetchData(file) {
  const response = await fetch(`/${file}`);
  return response.json();
}

// Load and render users
async function loadUsers() {
  const users = await fetchData('users.json');
  const userList = document.getElementById('users-list');
  userList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = `${user.name} - Points: ${user.totalPoints}`;
    li.dataset.userId = user.id;
    userList.appendChild(li);
  });
}

// Load and render tasks
async function loadTasks() {
  tasks = await fetchData('tasks.json');
  const taskList = document.getElementById('tasks-list');
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    const completions = task.completions || [];
    li.innerHTML = `
      ${task.name} (${task.points} points) 
      <br> Completions: ${completions.length > 0 ? completions.join(', ') : 'None'}
    `;
    li.dataset.taskId = task.id;

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => openEditModal(task.id);
    li.appendChild(editBtn);

    const completeBtn = document.createElement('button');
    completeBtn.textContent = 'Complete';
    completeBtn.onclick = () => completeTask(task.id);
    li.appendChild(completeBtn);

    taskList.appendChild(li);
  });
}

// Add/Edit a task
async function editTask(taskId) {
  const tasks = await fetchData('tasks.json');
  const task = tasks.find(t => t.id === taskId) || {};
  const name = prompt('Enter task name:', task.name || '');
  const points = parseInt(prompt('Enter task points:', task.points || 0), 10);

  if (name && !isNaN(points)) {
    if (task.id) {
      task.name = name;
      task.points = points;
    } else {
      tasks.push({
        id: tasks.length + 1,
        name,
        points,
        assignedTo: null,
        completions: [],
      });
    }
    saveData('tasks.json', tasks);
    loadTasks();
  }
}

// Mark a task as completed
async function completeTask(taskId) {
  const tasks = await fetchData('tasks.json');
  const users = await fetchData('users.json');
  const task = tasks.find(t => t.id == taskId);

  if (task) {
    const timestamp = new Date().toISOString();
    task.completions = task.completions || [];
    task.completions.push(timestamp);

    const user = users.find(u => u.id == task.assignedTo);
    if (user) user.totalPoints += task.points;

    saveData('tasks.json', tasks);
    saveData('users.json', users);

    alert(`Task "${task.name}" completed at ${timestamp}!`);
    loadTasks();
    loadUsers();
  }
}

// Open modal for editing a task
function openEditModal(taskId) {
  const modal = document.getElementById('edit-modal');
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    selectedTask = task;
    document.getElementById('task-name').value = task.name;
    document.getElementById('task-points').value = task.points;
    document.getElementById('last-completion').textContent = `Last Completion: ${
      task.completions && task.completions.length > 0
        ? task.completions[task.completions.length - 1]
        : 'None'
    }`;
    modal.classList.remove('hidden');
  }
}

// Close modal
function closeModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  selectedTask = null;
}

// Save task edits
document.getElementById('edit-task-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const taskName = document.getElementById('task-name').value;
  const taskPoints = document.getElementById('task-points').value;

  if (selectedTask !== null) {
    const taskIndex = tasks.findIndex(task => task.id === selectedTask);
    if (taskIndex !== -1) {
      tasks[taskIndex].name = taskName;
      tasks[taskIndex].points = taskPoints;
      await saveData('tasks.json', tasks);
      loadTasks();
      closeModal();
    }
  }
});

// Mark a task as completed
async function completeTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    const timestamp = new Date().toISOString();
    task.completions = task.completions || [];
    task.completions.push(timestamp);
    saveData('tasks.json', tasks);
    alert(`Task "${task.name}" completed at ${timestamp}!`);
    loadTasks();
  }
}

// Save data back to JSON (for demonstration only)
async function saveData(file, data) {
  await fetch(`/${file}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

// Initial Load
loadUsers();
loadTasks();
