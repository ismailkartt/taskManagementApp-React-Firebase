// src/redux/reducers/taskReducer.js
import { createSlice } from "@reduxjs/toolkit";
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where
} from 'firebase/firestore';
import { db } from '../../firebase/config';

const initialState = {
    tasks: [],
    filteredTasks: [],
    loading: false,
    error: null,
    filter: 'all',
    sortBy: 'date'
};

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setTasks: (state, action) => {
            state.tasks = action.payload;
            state.filteredTasks = action.payload;
            state.loading = false;
        },
        addTaskSuccess: (state, action) => {
            state.tasks.push(action.payload);
            state.filteredTasks = state.tasks;
            state.loading = false;
        },
        updateTaskSuccess: (state, action) => {
            const index = state.tasks.findIndex(task => task.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
                state.filteredTasks = state.tasks;
            }
            state.loading = false;
        },
        deleteTaskSuccess: (state, action) => {
            state.tasks = state.tasks.filter(task => task.id !== action.payload);
            state.filteredTasks = state.tasks;
            state.loading = false;
        },
        setFilter: (state, action) => {
            state.filter = action.payload;
            // Filtrelemeyi uygula
            state.filteredTasks = state.tasks.filter(task => {
                if (action.payload === 'completed') return task.completed;
                if (action.payload === 'active') return !task.completed;
                return true; // 'all' durumu
            });
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
            // Sıralamayı uygula
            state.filteredTasks = [...state.filteredTasks].sort((a, b) => {
                if (action.payload === 'date') {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                if (action.payload === 'priority') {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                }
                return 0;
            });
        }
    }
});

export const {
    setLoading,
    setError,
    setTasks,
    addTaskSuccess,
    updateTaskSuccess,
    deleteTaskSuccess,
    setFilter,
    setSortBy
} = taskSlice.actions;

// Thunk'lar aynı kalacak
export const fetchTasks = (userId) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const q = query(collection(db, 'tasks'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const tasks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        dispatch(setTasks(tasks));
    } catch (error) {
        dispatch(setError(error.message));
    }
};

export const createTask = (taskData) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const docRef = await addDoc(collection(db, 'tasks'), {
            ...taskData,
            createdAt: new Date().toISOString(),
            completed: false
        });
        const newTask = { 
            id: docRef.id, 
            ...taskData,
            createdAt: new Date().toISOString(),
            completed: false
        };
        dispatch(addTaskSuccess(newTask));
        return newTask;
    } catch (error) {
        dispatch(setError(error.message));
        throw error;
    }
};

export const editTask = (taskId, taskData) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, taskData);
        dispatch(updateTaskSuccess({ id: taskId, ...taskData }));
    } catch (error) {
        dispatch(setError(error.message));
        throw error;
    }
};

export const removeTask = (taskId) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const taskRef = doc(db, 'tasks', taskId);
        await deleteDoc(taskRef);
        dispatch(deleteTaskSuccess(taskId));
    } catch (error) {
        dispatch(setError(error.message));
        throw error;
    }
};

export default taskSlice.reducer;