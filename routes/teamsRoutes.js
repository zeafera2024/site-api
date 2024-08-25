const express = require("express");
const router = express.Router();
const { getTeams } = require("../services/apiFootballService");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 36000 });

router.get("/external-data", async (req, res) => {
  const cacheKey = "teams";
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log("Dados do cache");
    return res.json(cachedData);
  }
  try {
    const teams = await getTeams();
    cache.set(cacheKey, teams);
    console.log("Dados da API");
    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).send("Erro ao enviar os times");
  }
});

module.exports = router;
