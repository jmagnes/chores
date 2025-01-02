// Fetch data from JSON files
async function fetchData(file) {
  const response = await fetch(file);
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
  const tasks = await fetchData('tasks.json');
  const taskList = document.getElementById('tasks-list');
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.textContent = `${task.name} (${task.points} points)`;
    li.dataset.taskId = task.id;

    if (task.completed) {
      li.classList.add('completed');
      li.textContent += ' - Completed';
    } else {
      const assignBtn = document.createElement('button');
      assignBtn.textContent = 'Assign';
      assignBtn.onclick = () => assignTask(task.id);
      li.appendChild(assignBtn);

      const completeBtn = document.createElement('button');
      completeBtn.textContent = 'Complete';
      completeBtn.onclick = () => completeTask(task.id);
      li.appendChild(completeBtn);
    }
    taskList.appendChild(li);
  });
}

// Assign a task to a user
async function assignTask(taskId) {
  const userId = prompt('Enter User ID to assign the task:');
  const tasks = await fetchData('tasks.json');
  const task = tasks.find(t => t.id == taskId);

  if (task) {
    task.assignedTo = parseInt(userId);
    saveData('tasks.json', tasks);
    alert(`Task "${task.name}" assigned to User ID ${userId}`);
    loadTasks();
  }
}

// Mark a task as completed
async function completeTask(taskId) {
  const tasks = await fetchData('tasks.json');
  const users = await fetchData('users.json');
  const task = tasks.find(t => t.id == taskId);

  if (task) {
    task.completed = true;
    const user = users.find(u => u.id == task.assignedTo);
    if (user) user.totalPoints += task.points;
    saveData('tasks.json', tasks);
    saveData('users.json', users);
    alert(`Task "${task.name}" marked as completed!`);
    loadTasks();
    loadUsers();
  }
}

// Save data back to JSON (for demonstration only)
function saveData(file, data) {
  console.log(`Data for ${file}:`, JSON.stringify(data, null, 2));
}

// Initial Load
loadUsers();
loadTasks();
