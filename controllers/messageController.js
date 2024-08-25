const { db } = require("../config/firebase");
const { scheduleMessage } = require("../services/whatsappService.js");
const { matchTeams } = require("../services/apiFootballService");
const { format } = require("date-fns");

const date = new Date();
const today = format(date, "yyyy-MM-dd");

exports.scheduleMessage = async (req, res) => {
  console.log("executou");
  const { phoneNumberAlter, teamId } = req.body;
  try {
    // Valida os dados recebidos
    if (!phoneNumberAlter || !teamId) {
      return res.status(400).send("Número de telefone e time são obrigatórios");
    }
    await validateData(phoneNumberAlter, teamId);
    const partidas = await matchTeams(teamId);
    partidas.forEach((partida) => {
      const dataPartida = partida.data_hora_partida.split("T")[0];
      if (dataPartida == today) {
        console.log("vai ter jogoo");
        const datetime = `${dataPartida}T${partida.hora_partida}`;
        scheduleMessage(
          phoneNumberAlter,
          new Date(datetime),
          partida.partida_id,
          partida.campeonato,
          partida.placar,
          partida.hora_partida,
          partida.nome_estadio
        );
      }
    });
    res.status(200).send("Mensagem agendada com sucesso!");
    return;
  } catch (error) {
    console.error("Erro ao agendar mensagem:", error);
    res.status(500).send("Erro ao agendar mensagem.");
  }
};

async function validateData(phoneNumber, teamId) {
  const querySnapshot = await db
    .collection("messages")
    .where("phoneNumber", "==", phoneNumber)
    .where("teamId", "==", teamId)
    .get();

  if (!querySnapshot.empty) {
    // Documento já existe, não adiciona um novo
    console.log("Documento já existe.");
    return;
  }

  const docRef = await db.collection("messages").add({
    phoneNumber,
    //datetime: admin.firestore.Timestamp.fromDate(new Date(datetime)),
    teamId,
  });
  console.log("Documento adicionado com ID: ", docRef.id);
}
