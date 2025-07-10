const Team = require("../Models/Team");

exports.getTeams = async (req, res) => {
  try {
    const { userid } = req.body;
    const p = await Team.find({userid})
    
    res.status(201).json({ data: p });
  } catch (e) {
    res.status(500).json({ message: "error on getting teams: ", e });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name, userid } = req.body;
    // Check if team already exists for this user
    const existing = await Team.findOne({ name: name, userid: userid });
    if (existing) {
      return res.status(201).json({ message: "Team already exists" });
    }
    const k = await Team.create({
      name: name,
      userid: userid,
    });
    res.status(201).json({ data: k });
  } catch (e) {
    res.status(500).json({ message: "error on creating team: ", e });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const k = await Team.deleteOne({ name: name });
    res.status(200).json({ data: k });
  } catch (e) {
    res.status(500).json({ message: "error on deleting team: ", e });
  }
}; 