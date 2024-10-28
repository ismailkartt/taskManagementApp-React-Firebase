// src/services/taskService.js
import { 
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    doc,
    query,
    where 
} from "firebase/firestore";
import { db } from "../firebase/config";

// Kullanıcının görevlerini getir
export const fetchUserTasks = async (userId) => {
    try {
        const q = query(
            collection(db, "tasks"), 
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw error;
    }
};

// Yeni görev ekle
export const createTask = async (taskData) => {
    try {
        const docRef = await addDoc(collection(db, "tasks"), taskData);
        return {
            id: docRef.id,
            ...taskData
        };
    } catch (error) {
        throw error;
    }
};

// Görev güncelle
export const updateTask = async (taskId, taskData) => {
    try {
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, taskData);
        return {
            id: taskId,
            ...taskData
        };
    } catch (error) {
        throw error;
    }
};

// Görev sil
export const deleteTask = async (taskId) => {
    try {
        const taskRef = doc(db, "tasks", taskId);
        await deleteDoc(taskRef);
        return taskId;
    } catch (error) {
        throw error;
    }
};