'use strict';

// 定义一个常量作为 localStorage 的键。
const STORAGE_KEY = 'my-todos-app-css';

/**
 * 知识点: ES6模块化 (Export) & localStorage & JSON
 * 负责将当前的待办事项数组保存到 localStorage。
 * @param {Array} todos - 当前的待办事项数组。
 */
export function saveTodos(todos) {
    // 知识点: JSON.stringify()
    // 将JavaScript的数组对象转换为JSON格式的字符串。
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

/**
 * 知识点: ES6模块化 (Export) & localStorage & JSON
 * 负责从 localStorage 加载待办事项数组。
 * @returns {Array} - 返回从存储中加载的数组，如果没有任何存储则返回空数组。
 */
export function loadTodos() {
    // 知识点: try...catch 错误处理
    // 防止存储的数据损坏导致JSON.parse失败而使整个应用崩溃。
    try {
        const todosStr = localStorage.getItem(STORAGE_KEY);
        // 如果从未存储过，返回一个空数组。
        return todosStr ? JSON.parse(todosStr) : [];
    } catch (error) {
        console.error("加载数据失败:", error);
        // 如果加载失败，也返回一个空数组作为安全默认值。
        return [];
    }
}
