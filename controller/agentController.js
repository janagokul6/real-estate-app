import Agent from "../model/agentModel.js";

export const createAgent = async (req, res) => {
  try {
    const agent = new Agent(req.body);
    await agent.save();
    res.status(201).send(agent);
  } catch (err) {
    res.status(400).send(err);
  }
};

export const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find();
    res.send(agents);
  } catch (err) {
    res.status(500).send(err);
  }
};

export const updateAgent = async (req, res) => {
    try {
      const updatedAgent = await Agent.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true } // This option returns the updated document
      );
      if (!updatedAgent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(updatedAgent);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

// export { createAgent, getAgents };
