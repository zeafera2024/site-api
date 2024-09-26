const { db } = require("../config/firebase");
const { matchTeams } = require("../services/apiFootballService");
const moment = require("moment-timezone");
const schedule = require("node-schedule");

// Função auxiliar para obter a data e a região do timezone
const getDataTime = () => {
  const timezone = "America/Fortaleza";
  const now = moment().tz(timezone);
  const today = now.clone().format("YYYY-MM-DD");
  const timezoneRegion = moment.tz.guess();

  return {
    today,
    timezoneRegion,
  };
};

const scheduleMessage = async (
  phoneNumber,
  datetime,
  partida_id,
  campeonato,
  placar,
  hora_partida,
  nome_estadio,
  docId
) => {
  console.log("mensagem agendada");
  schedule.scheduleJob(datetime, async () => {
    try {
      await client.sendMessage(
        phoneNumber,
        `*O seu time do coração ❤️ joga hoje*

👉 ${placar}
⏱️ ${hora_partida}
🏟️ ${nome_estadio}
🏆 ${campeonato}
          `
      );
      console.log(`Mensagem enviada para ${phoneNumber}`);

      // Apaga o documento do Firestore após o envio
      await db.collection("matchs").doc(docId).delete();
      console.log(`Documento ${docId} removido do Firestore`);
    } catch (error) {
      console.error(`Falha ao enviar mensagem para ${phoneNumber}: ${error}`);
    }
  });
};

// Função para verificar e adicionar uma partida no Firestore
const checkMatchs = async (partida_id, placar, docIdUser) => {
  try {
    const querySnapshot = await db
      .collection("matchs")
      .where("docIdUser", "==", docIdUser)
      .where("matchID", "==", partida_id)
      .where("matchTeams", "==", placar)
      .get();

    if (!querySnapshot.empty) {
      console.log("Partida já cadastrada");
      return null;
    } else {
      const docRef = await db.collection("matchs").add({
        matchID: partida_id,
        matchTeams: placar,
        docIdUser: docIdUser,
      });

      console.log("Partida registrada - documento com ID:", docRef.id);
      return docRef.id;
    }
  } catch (error) {
    console.error("Erro ao verificar ou adicionar a partida:", error);
    return null;
  }
};

const convertDataTimeMatch = (datatime, timezone) => {
  const serverMoment = moment.parseZone(datatime);
  const convertedMoment = serverMoment.clone().tz(timezone);
  const adjustedMoment = convertedMoment.clone().subtract(3, "hours");
  const adjustedTime = adjustedMoment.format("YYYY-MM-DDTHH:mm:ssZ");

  return adjustedTime;
};

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
        const docId = await checkMatchs(
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
  checkMatchs,
  scheduleMessageController,
  getDataTime,
  convertDataTimeMatch,
};
