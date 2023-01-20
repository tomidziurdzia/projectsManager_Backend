import Project from "../models/Project.js";
import Task from "../models/Task.js";

const newTask = async (req, res) => {
  const { project } = req.body;
  const projectExist = await Project.findById(project);
  if (!projectExist) {
    const error = new Error("The project does not exist");
    return res.status(404).json({ msg: error.message });
  }

  if (projectExist.creator.toString() !== req.user._id.toString()) {
    const error = new Error("You do not have the necessary permissions");
    return res.status(403).json({ msg: error.message });
  }

  try {
    const taskStored = await Task.create(req.body);
    // Almacenar el ID en el proyecto
    projectExist.tasks.push(taskStored._id);
    await projectExist.save();
    res.json(taskStored);
  } catch (error) {
    console.log(error);
  }
};

const getTask = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id).populate("project");

  if (!task) {
    const error = new Error("The task does not exist");
    return res.status(404).json({ msg: error.message });
  }

  if (task.project.creador.toString() !== req.user._id.toString()) {
    const error = new Error("Invalid action");
    return res.status(403).json({ msg: error.message });
  }
  res.json(task);
};

const editTask = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id).populate("project");

  if (!task) {
    const error = new Error("The task does not exist");
    return res.status(404).json({ msg: error.message });
  }

  if (task.project.creator.toString() !== req.user._id.toString()) {
    const error = new Error("Invalid action");
    return res.status(403).json({ msg: error.message });
  }

  task.name = req.body.name || task.name;
  task.description = req.body.description || task.description;
  task.priority = req.body.priority || task.priority;
  task.dueDate = req.body.dueDate || task.dueDate;

  try {
    const taskStored = await task.save();
    res.json(taskStored);
  } catch (error) {
    console.log(error);
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id).populate("project");

  if (!task) {
    const error = new Error("The task does not exist");
    return res.status(404).json({ msg: error.message });
  }

  if (task.project.creator.toString() !== req.user._id.toString()) {
    const error = new Error("Invalid action");
    return res.status(403).json({ msg: error.message });
  }

  try {
    const project = await Project.findById(task.project);
    project.tasks.pull(task._id);

    await Promise.allSettled([await project.save(), await task.deleteOne()]);
    res.json({ msg: "The task has been deleted" });
  } catch (error) {
    console.log(error);
  }
};

const changeState = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id).populate("project");

  if (!task) {
    const error = new Error("The task does not exist");
    return res.status(404).json({ msg: error.message });
  }

  if (
    task.project.creator.toString() !== req.user._id.toString() &&
    !task.project.collaborators.some(
      (collaborator) => collaborator._id.toString() === req.user._id.toString()
    )
  ) {
    const error = new Error("Invalid action");
    return res.status(403).json({ msg: error.message });
  }

  task.state = !task.state;
  task.completed = req.user._id;
  await task.save();

  const taskStored = await Task.findById(id)
    .populate("project")
    .populate("completed");

  res.json(taskStored);
};

export { newTask, getTask, editTask, deleteTask, changeState };
