import { useNavigate } from "react-router-dom";

export default function Mode() {
  const navigate = useNavigate();

  return (
    <div className="mode-screen">
      <h2>🃏 Game tính tiền</h2>

      <button onClick={() => navigate("/round")}>
        🎯 Xì Dách (từng ván)
      </button>

      <button onClick={() => navigate("/total")}>
        💰 Xì Dách (tổng)
      </button>

      {/* ✅ thêm cái này */}
      <button onClick={() => navigate("/tienlen")}>
        🃏 Tiến Lên
      </button>
    </div>
  );
}
