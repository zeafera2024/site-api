require("dotenv").config();
//const key = process.env.PRIVATE_KEY;
const key = process.env.SECRET_KEY;

const serieA_id = 10;
const serieB_id = 14;
const libertadores_id = 7;
const sulamericana_id = 8;
const paulista_id = 9;
const copaBR_id = 2;

const getTeamsSerieA = async () => {
  const response = await fetch(
    `https://api.api-futebol.com.br/v1/campeonatos/${serieA_id}/partidas`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Network response was not ok ${response.statusText}. Response: ${errorText}`
    );
  }
  const data = await response.json();
  const partidas = data.partidas["fase-unica"]["1a-rodada"];
  const times = partidas.flatMap((partida) => [
    {
      time_id: partida.time_mandante.time_id,
      nome_popular: partida.time_mandante.nome_popular,
    },
    {
      time_id: partida.time_visitante.time_id,
      nome_popular: partida.time_visitante.nome_popular,
    },
  ]);
  return times;
};

const getTeamsSerieB = async () => {
  const response = await fetch(
    `https://api.api-futebol.com.br/v1/campeonatos/${serieB_id}/partidas`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  const partidas = data.partidas["fase-unica"]["1a-rodada"];
  const times = partidas.flatMap((partida) => [
    {
      time_id: partida.time_mandante.time_id,
      nome_popular: partida.time_mandante.nome_popular,
    },
    {
      time_id: partida.time_visitante.time_id,
      nome_popular: partida.time_visitante.nome_popular,
    },
  ]);
  return times;
};

const getTeamsPaulista = async () => {
  const response = await fetch(
    `https://api.api-futebol.com.br/v1/campeonatos/${paulista_id}/partidas`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  const partidas = data.partidas["primeira-fase"]["1a-rodada"];
  const times = partidas.flatMap((partida) => [
    {
      time_id: partida.time_mandante.time_id,
      nome_popular: partida.time_mandante.nome_popular,
    },
    {
      time_id: partida.time_visitante.time_id,
      nome_popular: partida.time_visitante.nome_popular,
    },
  ]);
  return times;
};

const getTeamsSulamericana = async () => {
  const response = await fetch(
    `https://api.api-futebol.com.br/v1/campeonatos/${sulamericana_id}/partidas`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  const partidas = data.partidas["fase-de-grupos"]["1a-rodada"];
  const times = partidas.flatMap((partida) => [
    {
      time_id: partida.time_mandante.time_id,
      nome_popular: partida.time_mandante.nome_popular,
    },
    {
      time_id: partida.time_visitante.time_id,
      nome_popular: partida.time_visitante.nome_popular,
    },
  ]);
  return times;
};

const getTeamsLibertadores = async () => {
  const response = await fetch(
    `https://api.api-futebol.com.br/v1/campeonatos/${libertadores_id}/partidas`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Network response was not ok ${response.statusText}. Response: ${errorText}`
    );
  }
  const data = await response.json();
  const partidas = data.partidas["fase-de-grupos"]["1a-rodada"];
  const times = partidas.flatMap((partida) => [
    {
      time_id: partida.time_mandante.time_id,
      nome_popular: partida.time_mandante.nome_popular,
    },
    {
      time_id: partida.time_visitante.time_id,
      nome_popular: partida.time_visitante.nome_popular,
    },
  ]);
  return times;
};

const getTeamsCopaBR = async () => {
  const response = await fetch(
    `https://api.api-futebol.com.br/v1/campeonatos/${copaBR_id}/partidas`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  const partidas = data.partidas["primeira-fase"];

  const times = Object.values(partidas).flatMap(({ ida }) => [
    {
      time_id: ida.time_mandante.time_id,
      nome_popular: ida.time_mandante.nome_popular,
    },
    {
      time_id: ida.time_visitante.time_id,
      nome_popular: ida.time_visitante.nome_popular,
    },
  ]);
  return times;
};

const getTeams = async () => {
  const times = [].concat(
    await getTeamsSerieA(),
    await getTeamsSerieB(),
    await getTeamsPaulista(),
    await getTeamsSulamericana(),
    await getTeamsLibertadores(),
    await getTeamsCopaBR()
  );

  return times.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (time) =>
          time.time_id === item.time_id &&
          time.nome_popular === item.nome_popular
      )
  );
};

const matchTeams = async (id_team) => {
  const response = await fetch(
    `https://api.api-futebol.com.br/v1/times/${id_team}/partidas/proximas`,
    {
      method: "GET",
      headers: {
        //Authorization: `Bearer ${key}`,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Network response was not ok ${response.statusText}. Response: ${errorText}`
    );
  }
  const data = await response.json();

  if (data.error === 404) {
    return data.error;
  }

  let partidas_campeonato = [];
  for (const campeonato in data) {
    const partidas = await data[campeonato]
      .map((partida) => {
        const {
          partida_id,
          campeonato,
          placar,
          data_realizacao,
          hora_realizacao,
          data_realizacao_iso,
          estadio,
        } = partida;

        if (
          partida_id != null &&
          campeonato != null &&
          campeonato.nome != null &&
          placar != null &&
          data_realizacao != null &&
          hora_realizacao != null &&
          data_realizacao_iso != null &&
          estadio != null &&
          estadio.estadio_id != null &&
          estadio.nome_popular != null
        ) {
          return {
            partida_id: partida.partida_id,
            campeonato: partida.campeonato.nome,
            placar: partida.placar,
            data_partida: partida.data_realizacao,
            //data_partida: "2024-08-27",
            hora_partida: partida.hora_realizacao,
            data_hora_partida: partida.data_realizacao_iso,
            //data_hora_partida: "2024-08-27T15:30:00-0300",
            estadio_id: partida.estadio.estadio_id,
            nome_estadio: partida.estadio.nome_popular,
          };
        }
        return null;
      })
      .filter((partida) => partida !== null);

    partidas_campeonato.push(...partidas);
  }

  return partidas_campeonato;
};

//matchTeams(23);
module.exports = { getTeams, matchTeams };
