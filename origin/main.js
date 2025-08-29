'use strict';

// 知识点: ES6模块化 (Import)
// 从我们的“工具箱”模块中，导入需要的功能。
import { saveTodos, loadTodos } from './storage.js';

// --- 模块一：DOM元素查询 ---
// 知识点: DOM查询
// 在代码开始时，一次性获取所有需要操作的DOM元素。
const addTodoForm = document.getElementById('add-todo-form');
const newTodoInput = document.getElementById('new-todo-input');
const todoList = document.getElementById('todo-list');
const filterButtons = document.querySelector('.filter-buttons'); // 使用 querySelector
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const activeCountSpan = document.getElementById('active-count');
const dateDisplay = document.getElementById('date-display');

// --- 模块二：状态管理 ---
let currentFilter = 'all'; 
let todos = [];

// --- 模块三：核心功能函数 ---

/**
 * 核心渲染函数。根据当前的 todos 数组和 currentFilter 状态，重新绘制整个列表。
 */
const renderTodos = () => {
    // 1. 清空当前的列表内容
    todoList.innerHTML = '';

    // 2. 根据当前的过滤器筛选出需要显示的待办事项。
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
    });

    // 3. 遍历筛选后的数组，为每一项数据创建一个对应的<li>元素。
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item'; // 应用CSS样式
        li.dataset.id = todo.id; // 存储ID，方便后续操作
        
        if (todo.completed) {
            li.classList.add('done');
        }

        // 知识点: innerHTML & 模板字符串
        // 使用模板字符串构建复杂的HTML结构，非常方便。
        li.innerHTML = `
            <div class="todo-item-left">
                <input type="checkbox" class="custom-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="task-text ${todo.completed ? 'done' : ''}">${todo.text}</span>
            </div>
            <button class="delete-btn">×</button>
        `;
        
        todoList.appendChild(li);
        
        // 为新添加的元素添加动画效果
        li.classList.add('new');
        // 知识点: 事件监听
        // 监听动画结束事件，然后移除动画class，避免重复触发。
        li.addEventListener('animationend', () => li.classList.remove('new'));
    });
    
    updateActiveCount();
    saveTodos(todos); // 每次重新渲染后，都将最新状态保存到localStorage
};

/**
 * 更新未完成任务的计数器。
 */
const updateActiveCount = () => {
    const activeCount = todos.filter(todo => !todo.completed).length;
    activeCountSpan.textContent = activeCount;
};

/**
 * 添加一个新的待办事项。
 */
const handleAddTodo = (event) => {
    // 知识点: 事件对象 & event.preventDefault()
    // 阻止表单的默认提交行为（即页面刷新）。
    event.preventDefault();
    
    const text = newTodoInput.value.trim();
    if (text) {
        const newTodo = {
            id: Date.now(), // 使用时间戳作为唯一ID
            text: text,
            completed: false
        };
        todos.push(newTodo);
        newTodoInput.value = '';
        renderTodos();
    }
};

/**
 * 知识点: 事件委托
 * 处理列表区域的点击事件（完成/删除）。
 */
const handleListClick = (event) => {
    const target = event.target;
    
    // 知识点: Element.closest()
    // 向上查找最接近的 .todo-item 祖先元素。
    const parentLi = target.closest('.todo-item');
    if (!parentLi) return;

    const todoId = Number(parentLi.dataset.id);

    // 如果点击的是删除按钮
    if (target.classList.contains('delete-btn')) {
        // 知识点: Array.filter (不可变操作)
        // 通过筛选出所有ID不匹配的项，来实现删除。
        todos = todos.filter(todo => todo.id !==todoId);
        
        // 添加删除动画
        parentLi.classList.add('removing');
        // 动画结束后再重新渲染整个列表
        parentLi.addEventListener('animationend', renderTodos);

    // 如果点击的是checkbox
    } else if (target.classList.contains('custom-checkbox')) {
        // 知识点: Array.map (不可变操作)
        // 找到对应的todo项，并切换其completed状态。
        todos = todos.map(todo => {
            if (todo.id === todoId) {
                // 返回一个更新了completed属性的新对象
                return { ...todo, completed: !todo.completed }; 
            }
            return todo;
        });
        renderTodos();
    }
};

/**
 * 处理过滤按钮的点击。
 */
const handleFilterClick = (event) => {
    if (event.target.matches('.filter-btn')) {
        currentFilter = event.target.dataset.filter;
        
        // 更新按钮的激活样式
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        renderTodos();
    }
};

/**
 * 清除所有已完成的任务。
 */
const handleClearCompleted = () => {
    todos = todos.filter(todo => !todo.completed);
    renderTodos();
};

/**
 * 设置并显示当前日期
 */
const displayDate = () => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString('zh-CN', options);
};

// --- 模块四：初始化与事件绑定 ---

const init = () => {
    addTodoForm.addEventListener('submit', handleAddTodo);
    todoList.addEventListener('click', handleListClick);
    filterButtons.addEventListener('click', handleFilterClick);
    clearCompletedBtn.addEventListener('click', handleClearCompleted);

    todos = loadTodos();
    displayDate();
    renderTodos();
};

// 知识点: DOMContentLoaded 事件
// 确保在整个HTML文档加载并解析完毕后，再执行我们的初始化脚本。
document.addEventListener('DOMContentLoaded', init);
