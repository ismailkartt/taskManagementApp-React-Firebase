// src/pages/TaskPage/index.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, createTask, editTask, removeTask, setFilter, setSortBy } from '../../redux/reducers/taskReducer';

const TaskPage = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { tasks, filteredTasks, loading, error, filter, sortBy } = useSelector(state => state.tasks);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Form state for new/edit task
    const initialFormState = {
        title: '',
        description: '',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0]
    };
    const [taskForm, setTaskForm] = useState(initialFormState);

    useEffect(() => {
        if (user) {
            dispatch(fetchTasks(user.uid));
        }
    }, [dispatch, user]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            await dispatch(createTask({
                ...taskForm,
                userId: user.uid,
                createdAt: new Date().toISOString()
            })).unwrap();
            
            setShowAddModal(false);
            setTaskForm(initialFormState);
            
            // Görevleri yeniden yükle
            dispatch(fetchTasks(user.uid));
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleEditTask = async (e) => {
        e.preventDefault();
        if (selectedTask) {
            try {
                await dispatch(editTask(selectedTask.id, {
                    ...taskForm,
                    userId: user.uid
                }));
                setShowEditModal(false);
                setSelectedTask(null);
                setTaskForm(initialFormState);
            } catch (error) {
                console.error('Error editing task:', error);
            }
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
            try {
                await dispatch(removeTask(taskId));
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Görevlerim
                </h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md"
                >
                    Yeni Görev
                </button>
            </div>

            {/* Filters Section */}
            <div className="flex space-x-4">
                <select
                    value={filter}
                    onChange={(e) => dispatch(setFilter(e.target.value))}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="all">Tümü</option>
                    <option value="completed">Tamamlananlar</option>
                    <option value="active">Devam Edenler</option>
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => dispatch(setSortBy(e.target.value))}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="date">Tarihe Göre</option>
                    <option value="priority">Önceliğe Göre</option>
                </select>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="col-span-full text-red-600 text-center">
                        {error}
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="col-span-full text-gray-500 text-center">
                        Henüz görev bulunmuyor
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <div
                            key={task.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    {task.title}
                                </h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setSelectedTask(task);
                                            setTaskForm(task);
                                            setShowEditModal(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                {task.description}
                            </p>
                            <div className="mt-4 flex justify-between items-center">
                                <span className={`px-2 py-1 rounded text-sm ${
                                    task.priority === 'high' 
                                        ? 'bg-red-100 text-red-800'
                                        : task.priority === 'medium'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                }`}>
                                    {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Task Modal */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            {showAddModal ? 'Yeni Görev' : 'Görevi Düzenle'}
                        </h2>
                        <form onSubmit={showAddModal ? handleAddTask : handleEditTask}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Başlık
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={taskForm.title}
                                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Açıklama
                                    </label>
                                    <textarea
                                        value={taskForm.description}
                                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        rows="3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Öncelik
                                    </label>
                                    <select
                                        value={taskForm.priority}
                                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="low">Düşük</option>
                                        <option value="medium">Orta</option>
                                        <option value="high">Yüksek</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Bitiş Tarihi
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={taskForm.dueDate}
                                        onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setShowEditModal(false);
                                        setSelectedTask(null);
                                        setTaskForm(initialFormState);
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    {showAddModal ? 'Ekle' : 'Güncelle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskPage;