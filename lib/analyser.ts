const logError = (msg: string) => {
  console.log(msg);
};

let ws: WebSocket;

const init = () => {
  if (ws) return Promise.resolve(true);

  return new Promise((resolve) => {
    ws = new WebSocket("ws://localhost:7777");
    ws.onopen = () => {
      console.log("Connected to sentiment server.");
      resolve(true);
    };
    ws.onclose = () => logError("Disconnected from sentiment server.");
    ws.onerror = (e) => console.log(e instanceof ErrorEvent ? e.message : e.type);

    Deno.addSignalListener("SIGINT", () => {
      console.log("Closing connection to sentiment server.");
      ws.close();
    });
  });
};

const THRESHOLD = parseFloat(
  Deno.env.get("ANALYSER_SCORE_THRESHOLD") ?? "0.55",
);

const analyse = (text: string, cb: Function) => {
  if (!text || text.length < 10) return NaN;

  try {
    ws.onmessage = (m) => {
      const sentiment = JSON.parse(m.data)[0];
      if (sentiment.score < THRESHOLD) return;

      if (sentiment.label === "positive") cb(1);
      else if (sentiment.label === "negative") cb(-1);
      else cb(0);
    };
    ws.send(text);
  } catch (_) {
    logError("Error analysing text");
  }
};

export default {
  analyse,
  init,
};
