'use strict'
const STORAGE_KEY = "my-todos-app-css";

export function saveTodos(todos){
    localStorage.setItem(STORAGE_KEY,JSON.stringify(todos));
}

export function loadTodos(){
    try{
        const todosStr = localStorage.getItem(STORAGE_KEY);
        return todosStr ? JSON.parse(todosStr) : [];
    } catch (error){
        console.error("加载数据失败:", error);
        return [];
    }
}