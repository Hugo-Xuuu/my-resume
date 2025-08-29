'use strict';
import { saveTodos,loadTodos } from "./storage.js";

const addTodoForm = document.getElementById('add-todo-form');
const newTodoInput = document.getElementById('new-todo-input');
const todoList = document.getElementById('todo-list');
const filterButtons = document.querySelector('.filter-buttons'); // 使用 querySelector
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const activeCountSpan = document.getElementById('active-count');
const dateDisplay = document.getElementById('date-display');

let currentFilter ='all';
let todos = [];

const renderTodos = () => {
    todoList.innerHTML='';
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
    });
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = todo.id;
        if (todo.completed){
            li.classList.add('done');
        }
        li.innerHTML = `
            <div class="todo-item-left">
                <input type="checkbox" class="custom-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="task-text ${todo.completed ? 'done' : ''}">${todo.text}</span>
            </div>
            <button class="delete-btn">×</button>
        `;
        todoList.appendChild(li);
        li.classList.add('new');
        li.addEventListener('animationend', () => li.classList.remove('new'));

    });
    updateActiveCount();
    saveTodos(todos);
};

const updateActiveCount = () =>{
    const activeCount = todos.filter(todo => !todo.completed).length;
    activeCountSpan.textContent = activeCount;
}
const handleAddTodo = (event) => {
    event.preventDefault();

    const text = newTodoInput.value.trim();
    if (text) {
        const newTodo = {
            id:Date.now(),
            text:text,
            completed:false
        };
        todos.push(newTodo);
        newTodoInput.value = '';
        renderTodos();
    }
}
const handleListClick = (event) => {
    const target = event.target;
    const parentLi = target.closest('.todo-item');
    if (!parentLi) return;
    const todoId = Number(parentLi.dataset.id);
    if (target.classList.contains('delete-btn')){
        todos = todos.filter(todo => todo.id !==todoId);
        parentLi.classList.add('removing');
        parentLi.addEventListener('animationend' , renderTodos);
    } else if (target.classList.contains('custom-checkbox')) {
        todos = todos.map(todo => {
            if (todo.id === todoId) {
                return { ...todo, completed: !todo.completed};
            }
            return todo;
        });
        renderTodos();
    }
};
const handleFilterClick = (event) => {
    if (event.target.matches('.filter-btn')){
        currentFilter = event.target.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        renderTodos();
    }
}

const handleClearCompleted = () => {
    todos = todos.filter(todo => !todo.completed);
    renderTodos();
};
const displayDate = () =>{
    const now = new Date();
    const options = {weekday:'long',year:'numeric',month:'long',day:'numeric'};
    dateDisplay.textContent = now.toLocaleDateString('zh-CN',options);
}
const init = () =>{
    addTodoForm.addEventListener('submit',handleAddTodo);    addTodoForm.addEventListener('submit', handleAddTodo);
    todoList.addEventListener('click', handleListClick);
    filterButtons.addEventListener('click', handleFilterClick);
    clearCompletedBtn.addEventListener('click', handleClearCompleted);

    todos = loadTodos();
    displayDate();
    renderTodos();

};

document.addEventListener('DOMContentLoaded',init);