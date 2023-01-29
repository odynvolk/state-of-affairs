function logError(msg: string) {
  console.log(msg);
  Deno.exit(1);
}

let ws: WebSocket;

async function init() {
  if (ws) return Promise.resolve(true);

  return new Promise((resolve) => {
    ws = new WebSocket("ws://localhost:7777");
    ws.onopen = () => {
      console.log("Connected to sentiment server...");
      resolve(true);
    };
    ws.onclose = () => logError("Disconnected from server...");
    ws.onerror = (e) =>
      console.log(e instanceof ErrorEvent ? e.message : e.type);
  });
}

function analyse(text: string, cb: Function) {
  if (!text || text.length < 10) return NaN;

  try {
    ws.onmessage = (m) => {
      const sentiment = JSON.parse(m.data)[0];
      if (sentiment.score <= 0.5) return;

      let score = 0;
      if (sentiment.label === "positive") score = 1;
      else if (sentiment.label === "negative") score = -1;

      cb(score);
    };
    ws.send(text);
  } catch (_) {
    logError("Error analysing text");
  }
}

export default {
  analyse,
  init,
};
