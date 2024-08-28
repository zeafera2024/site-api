const { db } = require("../config/firebase");
const { scheduleMessage } = require("../services/whatsappService.js");
const { matchTeams } = require("../services/apiFootballService");
const { format } = require("date-fns");
const { toZonedTime } = require("date-fns-tz");
const moment = require("moment-timezone");

const timezone = "America/Fortaleza";
const date = new Date();
const utcDate = toZonedTime(date, timezone);
const dataTimeFormatada = format(utcDate, "yyyy-MM-dd HH:mm:ss");
const today = format(utcDate, "yyyy-MM-dd");

// Obtém o timezone do sistema
const timezoneRegion = moment.tz.guess();
console.log("Região do timezone:", timezoneRegion);

exports.scheduleMessage = async (req, res) => {
  console.log("dataFormatada" + dataTimeFormatada);
  console.log("today" + today);
  console.log("executou");
  const { phoneNumberAlter, teamId } = req.body;
  try {
    // Valida os dados recebidos
    if (!phoneNumberAlter || !teamId) {
      return res.status(400).send("Número de telefone e time são obrigatórios");
    }
    await validateData(phoneNumberAlter, teamId);
    const partidas = await matchTeams(teamId);
    await partidas.forEach((partida) => {
      const dataPartida = partida.data_hora_partida.split("T")[0];
      //const dataPartida = partida.data_partida;
      if (dataPartida == today) {
        console.log("vai ter jogoo");
        //const datetime = `${dataPartida}T${partida.hora_partida}`;
        console.log("Data e hora da partida " + partida.data_hora_partida);
        const serverMoment = moment.parseZone(partida.data_hora_partida);
        const convertedMoment = serverMoment.clone().tz(timezoneRegion);
        const adjustedMoment = convertedMoment.clone().subtract(3, "hours");
        const adjustedTime = adjustedMoment.format("YYYY-MM-DDTHH:mm:ssZ");
        console.log(
          "Hora convertida para Africa/Abidjan:",
          convertedMoment.format("YYYY-MM-DDTHH:mm:ssZ")
        );
        // Mostra o ajuste com o objeto Date
        const data = adjustedMoment.toDate();
        console.log("data e hora da mensagem chegar" + data);
        scheduleMessage(
          phoneNumberAlter,
          new Date(adjustedTime),
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
