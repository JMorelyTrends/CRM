const express = require("express");
const router = express.Router();
const TeamController = require("../Controllers/TeamController");

router.post("/getTeams", TeamController.getTeams);
router.post("/createTeam", TeamController.createTeam);
router.delete("/deleteTeam", TeamController.deleteTeam);

module.exports = router; 