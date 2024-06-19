import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  handleAddProject,
  handleGetProject,
  handleGetProjects,
  handleUpdateProject,
} from "../controllers/project.controller.js";

const router = express.Router();

// ROUTE: ADD PROJECT
// PATH: /api/v1/project/add
// METHOD: POST
router.post("/add", authenticate, handleAddProject);

// ROUTE: GET ALL PROJECTS
// PATH: /api/v1/project/getall
// METHOD: GET
router.get("/getall", handleGetProjects);

// ROUTE: GET PROJECT
// PATH: /api/v1/project/get/:id
// METHOD: GET
router.get("/get/:id", handleGetProject);

// ROUTE: UPDATE PROJECT
// PATH: /api/v1/project/update/:id
// METHOD: PUT
router.put("/update/:id", authenticate, handleUpdateProject);

export default router;
