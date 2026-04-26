import { useState, useEffect } from "react";

export default function App() {
  // ✅ 初始化时直接读取（关键）
  const [list, setList] = useState(() => {
    const saved = localStorage.getItem("my_list");
    return saved ? JSON.parse(saved) : [];
  });

  const [text, setText] = useState("");
  const [category, setCategory] = useState("成长");

  // ✅ 只负责保存（不会覆盖初始化）
  useEffect(() => {
    localStorage.setItem("my_list", JSON.stringify(list));
  }, [list]);

  const handleSubmit = () => {
    if (!text.trim()) return;

    const newItem = {
      text,
      category,
      time: new Date().toLocaleString(),
    };

    setList([newItem, ...list]);
    setText("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>今日状态</h2>

      {/* 状态提示 */}
      {list.length > 0 ? (
        <p style={{ color: "green" }}>今日已发布状态，可参与匹配</p>
      ) : (
        <p style={{ color: "red" }}>今日未发布，无法匹配</p>
      )}

      {/* 分类 */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option>成长</option>
        <option>创业</option>
        <option>情绪</option>
        <option>倾诉</option>
      </select>

      {/* 输入 */}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="你今天做了什么？"
      />

      <button onClick={handleSubmit}>发布</button>

      <button
        onClick={() => {
          if (list.length === 0) {
            alert("今天还没发布，不能匹配");
          } else {
            alert("开始匹配同类人（Demo）");
          }
        }}
      >
        开始匹配
      </button>

      <hr />

      {/* 分类筛选 */}
      <div>
        {["全部", "成长", "创业", "情绪", "倾诉"].map((tab) => (
          <button key={tab} style={{ marginRight: 5 }}>
            {tab}
          </button>
        ))}
      </div>

      {/* 列表 */}
      {list.map((item, i) => (
        <div key={i} style={{ marginTop: 10 }}>
          <p>
            【{item.category}】{item.text}
          </p>
          <small>{item.time}</small>
        </div>
      ))}
    </div>
  );
}