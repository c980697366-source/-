import express from "express";
import cors from "cors";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/api/hello", (req, res) => {
  res.send("AI服务器已启动");
});

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB);
}

app.post("/api/embedding-match", async (req, res) => {
  try {
    const { myText, list } = req.body;
    if (!myText || !list || list.length === 0) {
      return res.status(400).json({ error: "参数错误" });
    }

    const myEmbeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: myText,
    });
    const myVector = myEmbeddingRes.data[0].embedding;

    const texts = list.map((item) => item.content || "");
    const listEmbeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });
    const listVectors = listEmbeddingRes.data.map((d) => d.embedding);

    const results = list
      .map((item, index) => ({
        ...item,
        score: cosineSimilarity(myVector, listVectors[index]),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json(results);
  } catch (err) {
    console.error("AI错误：", err);
    res.status(500).json({ error: "embedding error" });
  }
});

app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});