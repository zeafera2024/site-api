const { db } = require("../config/firebase");
const { matchTeams } = require("../services/apiFootballService");
const schedule = require("node-schedule");
const { getDataTime, convertDataTimeMatch } = require("../utils/dataTime");
const { checkMatch } = require("../utils/checkMatches");
const { scheduleMessage } = require("../services/whatsappService");

// Função auxiliar para obter a data e a região do timezone

// Função para validar dados e adicionar no Firestore
const validateData = async (phoneNumber, teamId) => {
  try {
    const querySnapshot = await db
      .collection("messages")
      .where("phoneNumber", "==", phoneNumber)
      .where("teamId", "==", teamId)
      .get();

    if (!querySnapshot.empty) {
      console.log("Documento já existe.");
      return querySnapshot.docs[0].id; // Retorna o ID do documento existente
    }

    const docRef = await db.collection("messages").add({
      phoneNumber,
      teamId,
    });

    return docRef.id;
  } catch (error) {
    console.error("Erro ao validar dados:", error);
    throw error;
  }
};

// Função para agendar a mensagem
const scheduleMessageController = async (req, res) => {
  const { phoneNumberAlter, teamId } = req.body;
  if (!phoneNumberAlter || !teamId) {
    return res.status(400).send("Número de telefone e time são obrigatórios");
  }

  try {
    const docIdUser = await validateData(phoneNumberAlter, teamId);
    const partidas = await matchTeams(teamId);
    const { today, timezoneRegion } = getDataTime();

    for (const partida of partidas) {
      const dataPartida = partida.data_hora_partida.split("T")[0];
      if (dataPartida === today) {
        const docId = await checkMatch(
          partida.partida_id,
          partida.placar,
          docIdUser
        );

        if (docId) {
          console.log("Vai ter jogo");
          const scheduleTime = convertDataTimeMatch(
            partida.data_hora_partida,
            timezoneRegion
          );

          console.log("schedule Message = " + scheduleMessage);

          console.log("Este é o scheduleTime = " + scheduleTime);

          scheduleMessage(
            phoneNumberAlter,
            new Date(scheduleTime),
            partida.partida_id,
            partida.campeonato,
            partida.placar,
            partida.hora_partida,
            partida.nome_estadio,
            docId
          );
        }
      }
    }

    res.status(200).send("Mensagem agendada com sucesso!");
  } catch (error) {
    console.error("Erro ao agendar mensagem:", error);
    res.status(500).send("Erro ao agendar mensagem.");
  }
};

module.exports = {
  scheduleMessageController,
};
