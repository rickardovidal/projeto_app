import { create } from 'zustand';
import { todosService, type Todo, type TodoMutation } from '../services/todosService';

interface TodosState {
  todos: Todo[];
  isLoading: boolean;
  fetchTodos: () => Promise<void>;
  addTodo: (data: TodoMutation) => Promise<void>;
  updateTodo: (id: string, data: TodoMutation) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export const useTodosStore = create<TodosState>((set, get) => ({
  todos: [],
  isLoading: false,

  fetchTodos: async () => {
    set({ isLoading: true });
    try {
      const { data } = await todosService.getTodos();
      set({ todos: data });
    } finally {
      set({ isLoading: false });
    }
  },

  addTodo: async (data) => {
    const { data: newTodo } = await todosService.createTodo(data);
    set({ todos: [newTodo, ...get().todos] });
  },

  updateTodo: async (id, data) => {
    const { data: updated } = await todosService.updateTodo(id, data);
    set({
      todos: get().todos.map((t) => (t.id === id ? { ...t, ...updated } : t)),
    });
  },

  toggleTodo: async (id) => {
    // Optimistic update
    const previousTodos = get().todos;
    set({
      todos: previousTodos.map((t) => 
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    });

    try {
      await todosService.toggleTodo(id);
    } catch (error) {
      set({ todos: previousTodos }); // Revert on error
      throw error;
    }
  },

  deleteTodo: async (id) => {
    await todosService.deleteTodo(id);
    set({ todos: get().todos.filter((t) => t.id !== id) });
  },
}));
