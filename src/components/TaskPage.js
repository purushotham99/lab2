import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  TextField,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  Divider,
  IconButton,
} from '@mui/material';
import { CheckBox, CheckBoxOutlineBlank, Download } from '@mui/icons-material';

const API_BASE = 'https://northamerica-northeast2-serverless-442504.cloudfunctions.net'; // Replace with your base API URL

function TaskPage() {
  const userId = Cookies.get('userId');
  const email = Cookies.get('email');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    file: null,
  });

  // Memoize fetchTasks using useCallback to avoid dependency issues
  const fetchTasks = useCallback(async () => {
    try {
      const response = await axios.post(`${API_BASE}/get_tasks`, { userId });
      setTasks(response.data.tasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  }, [userId]);

  // Create a new task
  const createTask = async () => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('email', email);
    formData.append('title', newTask.title);
    formData.append('description', newTask.description);
    formData.append('dueDate', newTask.dueDate);
    if (newTask.file) formData.append('file', newTask.file);

    try {
      const response = await axios.post(`${API_BASE}/create_task`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Assume the API returns the created task object with the same structure as existing tasks
      const createdTask = {
        taskId: response.data.taskId || 'temp-id',
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate,
        status: 'Pending', // Default status for a new task
        attachments: newTask.file ? [response.data.fileUrl] : [],
      };

      setTasks((prevTasks) => [createdTask, ...prevTasks]); // Add the new task to the top of the list
      setNewTask({ title: '', description: '', dueDate: '', file: null });
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      await axios.post(`${API_BASE}/delete_task`, { taskId });
      setTasks((prevTasks) => prevTasks.filter((task) => task.taskId !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, status) => {
    try {
      await axios.post(`${API_BASE}/update_task_status`, { taskId, status });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.taskId === taskId ? { ...task, status } : task
        )
      );
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]); // fetchTasks is now a dependency

  return (
    <>
      {/* Top AppBar with Welcome Message */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Welcome, {userId || 'User'}!
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ marginTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Tasks
        </Typography>

        {/* Task List */}
        <Paper elevation={3} sx={{ padding: 4, maxHeight: 600, overflow: 'auto' }}>
          <Grid container spacing={2} direction="column">
            {/* Create Task Form */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Create a New Task</Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      label="Title"
                      variant="outlined"
                      fullWidth
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                    <TextField
                      label="Description"
                      variant="outlined"
                      fullWidth
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                    <TextField
                      type="datetime-local"
                      variant="outlined"
                      fullWidth
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                    <input
                      type="file"
                      onChange={(e) => setNewTask({ ...newTask, file: e.target.files[0] })}
                    />
                    <Button variant="contained" color="primary" onClick={createTask}>
                      Submit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Existing Tasks */}
            {tasks.map((task) => (
              <Grid item xs={12} key={task.taskId}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{task.title || 'Untitled Task'}</Typography>
                    <Typography>{task.description || 'No description provided'}</Typography>
                    <Typography>Due: {task.dueDate || 'No due date specified'}</Typography>
                    <Box display="flex" alignItems="center" gap={1} marginTop={2}>
                      {/* Status Icon */}
                      {task.status === 'Completed' ? (
                        <CheckBox color="success" />
                      ) : (
                        <CheckBoxOutlineBlank color="disabled" />
                      )}
                      <Typography>Status: {task.status}</Typography>
                    </Box>
                    <Divider sx={{ marginY: 1 }} />
                    {task.attachments && task.attachments.length > 0 && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton
                          component="a"
                          href={task.attachments[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download />
                        </IconButton>
                        <Typography variant="body2" color="textSecondary">
                          Download File
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => updateTaskStatus(task.taskId, 'Completed')}
                    >
                      Mark as Completed
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => deleteTask(task.taskId)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </>
  );
}

export default TaskPage;
