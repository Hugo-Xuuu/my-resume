'use strict';

import { saveTodos, loadTodos } from './storage.js';

// --- DOM元素查询 (无变化) ---
const addTodoForm = document.getElementById('add-todo-form');
const newTodoInput = document.getElementById('new-todo-input');
const todoList = document.getElementById('todo-list');
const filterButtons = document.querySelector('.filter-buttons');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const activeCountSpan = document.getElementById('active-count');
const dateDisplay = document.getElementById('date-display');

// --- 状态管理 (无变化) ---
let currentFilter = 'all'; 
let todos = [];

// --- 核心功能函数 ---

/**
 * 核心渲染函数。现在它的职责更纯粹：仅根据数据创建和更新DOM。
 */
const renderTodos = () => {
    todoList.innerHTML = '';
    const filteredTodos = getFilteredTodos();

    filteredTodos.forEach(todo => {
        const li = createTodoElement(todo);
        todoList.appendChild(li);
    });
    
    updateActiveCount();
    saveTodos(todos); 
};

/**
 * 新增: 创建单个todo元素的函数，方便复用。
 */
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = todo.id;
    if (todo.completed) {
        li.classList.add('done');
    }
    li.innerHTML = `
        <div class="todo-item-left">
            <input type="checkbox" class="custom-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="task-text ${todo.completed ? 'done' : ''}">${todo.text}</span>
        </div>
        <button class="delete-btn">×</button>
    `;
    return li;
}

/**
 * 新增: 根据当前过滤器返回筛选后的数据
 */
function getFilteredTodos() {
    return todos.filter(todo => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
    });
}

const updateActiveCount = () => {
    const activeCount = todos.filter(todo => !todo.completed).length;
    activeCountSpan.textContent = activeCount;
};

const handleAddTodo = (event) => {
    event.preventDefault();
    const text = newTodoInput.value.trim();
    if (text) {
        const newTodo = { id: Date.now(), text: text, completed: false };
        // 新任务总是添加到未完成列表的顶部
        todos.unshift(newTodo);
        renderTodos();
        // 给最新添加的元素一个动画效果
        const firstItem = todoList.firstChild;
        if(firstItem) {
            firstItem.classList.add('new');
            firstItem.addEventListener('animationend', () => firstItem.classList.remove('new'), { once: true });
        }
        newTodoInput.value = '';
    }
};

/**
 * 知识点: 排序动画的核心逻辑
 * 处理列表区域的点击事件（完成/删除）。
 */
const handleListClick = (event) => {
    const target = event.target;
    const parentLi = target.closest('.todo-item');
    if (!parentLi) return;
    const todoId = Number(parentLi.dataset.id);

    // 删除逻辑
    if (target.classList.contains('delete-btn')) {
        parentLi.classList.add('removing');
        parentLi.addEventListener('animationend', () => {
            todos = todos.filter(todo => todo.id !== todoId);
            renderTodos();
        }, { once: true });
    } 
    // 完成/取消完成 逻辑
    else if (target.classList.contains('custom-checkbox')) {
        // 1. 更新数据状态
        const todo = todos.find(t => t.id === todoId);
        if (todo) {
            todo.completed = !todo.completed;
        }

        // 2. 知识点: 数组排序
        // 对整个`todos`数组进行重新排序。
        // `a.completed - b.completed` 是一个技巧：
        // `false`被当作0, `true`被当作1。
        // `0 - 1 = -1` (未完成的排前面), `1 - 0 = 1` (完成的排后面)。
        // 这样就能确保所有未完成的任务总是在已完成任务的前面。
        todos.sort((a, b) => a.completed - b.completed);

        // 3. 知识点: DOM重新排序触发动画
        // 我们不使用 `renderTodos()` 进行完全重绘，而是直接操纵DOM顺序。
        // `appendChild` 一个已经存在的子元素，会自动把它“移动”到列表的末尾。
        // 因为我们在CSS中给 <li> 添加了 transition 属性，
        // 浏览器会捕捉到这个位置变化，并自动播放平滑的过渡动画！
        const filteredTodos = getFilteredTodos();
        filteredTodos.forEach(todo => {
            const elementToMove = todoList.querySelector(`[data-id="${todo.id}"]`);
            if (elementToMove) {
                todoList.appendChild(elementToMove);
            }
        });

        // 4. 更新UI状态和保存
        parentLi.classList.toggle('done');
        parentLi.querySelector('.task-text').classList.toggle('done');
        updateActiveCount();
        saveTodos(todos);
    }
};

const handleFilterClick = (event) => {
    if (event.target.matches('.filter-btn')) {
        currentFilter = event.target.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        renderTodos(); // 切换过滤器时，需要完全重绘
    }
};

const handleClearCompleted = () => {
    // 为每个要删除的项添加动画
    const completedItems = todoList.querySelectorAll('.todo-item.done');
    if(completedItems.length === 0) return;
    
    completedItems.forEach(item => {
        item.classList.add('removing');
    });
    
    // 在最后一个动画结束后，统一处理数据和UI
    const lastItem = completedItems[completedItems.length - 1];
    lastItem.addEventListener('animationend', () => {
        todos = todos.filter(todo => !todo.completed);
        renderTodos();
    }, { once: true });
};

const displayDate = () => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateDateString('zh-CN', options);
};

const init = () => {
    addTodoForm.addEventListener('submit', handleAddTodo);
    todoList.addEventListener('click', handleListClick);
    filterButtons.addEventListener('click', handleFilterClick);
    clearCompletedBtn.addEventListener('click', handleClearCompleted);
    todos = loadTodos();
    displayDate();
    renderTodos();
};

document.addEventListener('DOMContentLoaded', init);
