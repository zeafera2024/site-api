const checkMatch = async (partida_id, placar, docIdUser) => {
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

module.exports = {
  checkMatch,
};
