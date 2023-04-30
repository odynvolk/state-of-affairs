import asyncio
import json
import websockets

from transformers import AutoModelForSequenceClassification, AutoTokenizer, AutoConfig, pipeline

MODEL = f"cardiffnlp/twitter-roberta-base-sentiment-latest"

sentiment_task = pipeline("sentiment-analysis", model=MODEL, tokenizer=MODEL)

async def handler(websocket, path):
    while True:
        text = await websocket.recv()
        sentiment = sentiment_task(text)
        print(f"=========================================================================")
        print(f"Got: {text}")
        print(f"Label: {sentiment[0]['label']}, Score: {sentiment[0]['score']}")

        await websocket.send(f"{json.dumps(sentiment)}")

async def main():
    async with websockets.serve(handler, "localhost", 7777):
        print(f"Sentiment server started on port 7777...")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
