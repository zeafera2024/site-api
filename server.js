const express = require("express");
const { db } = require("./config/firebase");
const app = express();
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const {
  generateQRCode,
  onAuthenticated,
  onDisconnected,
  disconnectClient,
} = require("./services/whatsappService");
const messageRoutes = require("./routes/messageRoutes");
const teamsRoutes = require("./routes/teamsRoutes"); // Se aplicável
require("dotenv").config();

const server = http.createServer(app); // Crie um servidor HTTP com Express
const wss = new WebSocket.Server({ server }); // Crie um servidor WebSocket

app.use(
  cors({
    origin: "https://strong-gaufre-8c8014.netlify.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    // URL do frontend
  })
);

app.use(express.json());
app.use("/api/messages", messageRoutes);
app.use("/api/teams", teamsRoutes);

const updateConnectionStatus = async (status, qrCodeUrl = "") => {
  try {
    const docRef = db
      .collection("connectionStatus")
      .doc("5WOUrPm0liRirZ1fENUY");
    const data = {
      status: status,
      qrCodeUrl: qrCodeUrl,
    };

    await docRef.set(data);
    console.log("Documento sobrescrito com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar status de conexão:", error);
  }
};

const sendQRCodeToClients = async () => {
  try {
    const qrCodeUrl = await generateQRCode();
    const qrCodeData = JSON.stringify({ type: "qr", qr: qrCodeUrl });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log("enviando o qrcode");
        client.send(qrCodeData);
      }
    });
  } catch (error) {
    console.error("Erro ao gerar e enviar QR Code:", error);
  }
};

const notifyAuthenticationSuccess = async () => {
  await updateConnectionStatus("authenticated");
  const authData = JSON.stringify({ type: "auth", status: "authenticated" });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(authData);
    }
  });
};

const notifyDisconnection = async () => {
  console.log("Cliente desconectado");
  console.log("atualizando o status json");
  await updateConnectionStatus("disconnected");
  const authData = JSON.stringify({
    type: "auth",
    status: "disconnected",
    qr: "",
  });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(authData);
    }
  });
  return true;
};

const initializeConnectionStatus = async () => {
  try {
    const docRef = db
      .collection("connectionStatus")
      .doc("5WOUrPm0liRirZ1fENUY");
    const snapshot = await docRef.get();
    const statusData = snapshot.data();
    const initialData = JSON.stringify({
      type: "auth",
      status: statusData.status,
      qr: statusData.qrCodeUrl,
    });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(initialData);
      }
    });
  } catch (error) {
    console.error("Erro ao recuperar status de conexão:", error);
  }
};

wss.on("connection", (ws) => {
  console.log("Novo cliente WebSocket conectado");
  initializeConnectionStatus();
  ws.on("message", async (message) => {
    console.log(`Recebido: ${message}`);

    try {
      const data = JSON.parse(message);
      console.log(data);
      if (data.action === "disconnect") {
        console.log("Chamado a função disconnect");
        const response = await notifyDisconnection();
        if (response) {
          await disconnectClient();
          console.log("Notificando");
        }
      }
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
    }
  });

  ws.on("close", () => {
    console.log("Cliente WebSocket desconectado");
  });

  ws.on("error", (error) => {
    console.error("Erro no WebSocket:", error);
  });
});

const simulateQRCodeGeneration = async () => {
  sendQRCodeToClients();
  setInterval(async () => {
    const doc = await db
      .collection("connectionStatus")
      .doc("5WOUrPm0liRirZ1fENUY")
      .get();
    const status = doc.data().status;
    console.log("querySnapshot " + status);
    if (status === "disconnected" || "") {
      sendQRCodeToClients();
    }
  }, 5000); // Ajuste o intervalo conforme necessário
};

simulateQRCodeGeneration();

setTimeout(() => {
  onAuthenticated(async () => {
    await notifyAuthenticationSuccess();
  });

  onDisconnected(async () => {
    await notifyDisconnection();
  });
}, 5000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
