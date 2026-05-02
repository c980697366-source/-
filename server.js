import express from "express";
import cors from "cors";
import OpenAI from "openai";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 替换为你自己的 OpenAI Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "YOUR_OPENAI_KEY"
});

// 测试接口
app.get("/api/hello", (req, res) => {
  res.send("AI服务器已启动");
});

// 余弦相似度函数
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB);
}

// 匹配接口
app.post("/api/embedding-match", async (req, res) => {
  try {
    const { myText, list } = req.body;
    if (!myText || !list || list.length === 0) {
      return res.status(400).json({ error: "参数错误" });
    }

    // 计算我的向量
    const myEmbeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: myText,
    });
    const myVector = myEmbeddingRes.data[0].embedding;

    // 计算候选向量
    const texts = list.map((item) => item.content || "");
    const listEmbeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });
    const listVectors = listEmbeddingRes.data.map((d) => d.embedding);

    // 相似度计算
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

// 提供前端静态文件
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// 监听端口（Railway 必须使用 process.env.PORT）
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});