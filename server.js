import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 把 YOUR_OPENAI_KEY 替换成你的新 key（旧的已泄露，必须重新生成）
const openai = new OpenAI({
  apiKey: "YOUR_OPENAI_KEY"
});

// 余弦相似度
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB);
}

// 测试接口
app.get("/", (req, res) => {
  res.send("AI服务器已启动");
});

// 匹配接口
app.post("/embedding-match", async (req, res) => {
  try {
    const { myText, list } = req.body;

    if (!myText || !list || list.length === 0) {
      return res.status(400).json({ error: "参数错误" });
    }

    // 我的向量
    const myEmbeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: myText,
    });
    const myVector = myEmbeddingRes.data[0].embedding;

    // 对方的向量（批量）
    const texts = list.map((item) => item.content || "");
    const listEmbeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });
    const listVectors = listEmbeddingRes.data.map((d) => d.embedding);

    // 相似度计算 + 排序
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

app.listen(3001, () => {
  console.log("🔥 Embedding server running on http://localhost:3001");
});