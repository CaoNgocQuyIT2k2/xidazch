import { useNavigate } from "react-router-dom";

export default function Mode() {
  const navigate = useNavigate();

  return (
    <div className="mode-screen">
      <h2>🃏 Xì Dách</h2>

      <button onClick={() => navigate("/round")}>
        🎯 Tính từng ván
      </button>

      <button onClick={() => navigate("/total")}>
        💰 Tính tổng sòng
      </button>
    </div>
  );
}
