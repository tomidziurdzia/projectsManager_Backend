import Project from "../models/Project.js";
import User from "../models/User.js";

const getProjects = async (req, res) => {
  const projects = await Project.find({
    $or: [{ collaborators: { $in: req.user } }, { creator: { $in: req.user } }],
  }).select("-tasks");
  res.json(projects);
};

const newProject = async (req, res) => {
  const project = new Project(req.body);
  project.creator = req.user._id;

  try {
    const projectStored = await project.save();
    res.json(projectStored);
  } catch (error) {
    console.log(error);
  }
};
const getProject = async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id)
    .populate({
      path: "tasks",
      populate: { path: "completed", select: "name" },
    })
    .populate("collaborators", "name email");
  if (!project) {
    const error = new Error("Not found");
    return res.status(404).json({ msg: error.message });
  }

  if (
    project.creator.toString() !== req.user._id.toString() &&
    !project.collaborators.some(
      (collaborator) => collaborator._id.toString() === req.user._id.toString()
    )
  ) {
    const error = new Error("Invalid action");
    return res.status(404).json({ msg: error.message });
  }

  // Obtener las tareas del proyecto
  res.json(project);
};

const updateProject = async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);
  if (!project) {
    const error = new Error("Not found");
    return res.status(404).json({ msg: error.message });
  }

  if (project.creator.toString() !== req.user._id.toString()) {
    const error = new Error("Invalid action");
    return res.status(404).json({ msg: error.message });
  }

  project.name = req.body.name || project.name;
  project.description = req.body.description || project.description;
  project.dueDate = req.body.dueDate || project.dueDate;
  project.client = req.body.client || project.client;

  try {
    const projectStored = await project.save();
    return res.json(projectStored);
  } catch (error) {
    console.log(error);
  }
};

const deleteProject = async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);
  if (!project) {
    const error = new Error("Not found");
    return res.status(404).json({ msg: error.message });
  }

  if (project.creator.toString() !== req.user._id.toString()) {
    const error = new Error("Invalid action");
    return res.status(404).json({ msg: error.message });
  }

  try {
    await project.deleteOne();
    res.json({ msg: "Project deleted successfully" });
  } catch (error) {
    console.log(error);
  }
};

const searchCollaborator = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select(
    "-confirmed -password -createdAt -updatedAt -token -__v"
  );

  if (!user) {
    const error = new Error("User not found");
    return res.status(404).json({ msg: error.message });
  }

  res.json(user);
};

const addCollaborator = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    const error = new Error("Proyect not found");
    return res.status(404).json({ msg: error.message });
  }

  if (project.creator.toString() !== req.user._id.toString()) {
    const error = new Error("Invalid action");
    return res.status(404).json({ msg: error.message });
  }

  const { email } = req.body;
  const user = await User.findOne({ email }).select(
    "-confirmed -password -createdAt -updatedAt -token -__v"
  );

  if (!user) {
    const error = new Error("User not found");
    return res.status(404).json({ msg: error.message });
  }

  // El colabordor no es el admin del proyecto
  if (project.creator.toString() === user._id.toString()) {
    const error = new Error("The project creator cannot be a collaborator");
    return res.status(404).json({ msg: error.message });
  }

  // Revisar que no este ya agregado
  if (project.collaborators.includes(user._id)) {
    const error = new Error("The user already belongs to the project");
    return res.status(404).json({ msg: error.message });
  }

  // Se puede agregar
  project.collaborators.push(user._id);
  await project.save();
  res.json({ msg: "Collaborator added successfully", error: false });
};

const deleteCollaborator = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    const error = new Error("Proyect not found");
    return res.status(404).json({ msg: error.message });
  }

  if (project.creator.toString() !== req.user._id.toString()) {
    const error = new Error("Invalid action");
    return res.status(404).json({ msg: error.message });
  }

  // Se puede eliminar
  project.collaborators.pull(req.body.id);
  await project.save();
  res.json({ msg: "Collaborator removed successfully", error: false });
};

export {
  getProjects,
  newProject,
  getProject,
  updateProject,
  deleteProject,
  searchCollaborator,
  addCollaborator,
  deleteCollaborator,
};
