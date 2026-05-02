import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function TienLenGame() {
  const navigate = useNavigate();

  const [players, setPlayers] = useState([
    { id: 1, name: "", money: 0 },
    { id: 2, name: "", money: 0 },
    { id: 3, name: "", money: 0 },
    { id: 4, name: "", money: 0 },
  ]);

  const [history, setHistory] = useState([]);
  const [resultPopup, setResultPopup] = useState(null);

  // ================= LOAD HISTORY =================
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tienlen_history");
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      console.warn("History corrupted");
    }
  }, []);

  const saveHistory = (data) => {
    setHistory((prev) => {
      const newHistory = [data, ...prev];
      localStorage.setItem("tienlen_history", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // ================= UPDATE =================
  const changeMoney = (id, amount) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, money: p.money + amount } : p
      )
    );
  };

  const updateName = (id, value) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name: value } : p
      )
    );
  };

  // ================= AUTO BALANCE =================
  const autoBalance = useCallback(() => {
    const filled = players.filter((p) => p.name.trim() !== "");
    const empty = players.find((p) => p.name.trim() === "");

    // chỉ auto khi đúng 3 người và người thứ 4 chưa có tiền
    if (filled.length === 3 && empty && empty.money === 0) {
      const total = filled.reduce((sum, p) => sum + p.money, 0);

      // tránh set lại nếu đã đúng rồi
      if (empty.money === -total) return;

      setPlayers((prev) =>
        prev.map((p) =>
          p.id === empty.id
            ? { ...p, name: "Người 4", money: -total }
            : p
        )
      );
    }
  }, [players]);

  useEffect(() => {
    autoBalance();
  }, [autoBalance]);

  // ================= CHỐT VÁN =================
  const commitRound = () => {
    const total = players.reduce((sum, p) => sum + p.money, 0);

    if (total !== 0) {
      alert("⚠️ Tổng tiền phải = 0");
      return;
    }

    const snapshot = {
      time: new Date().toLocaleTimeString(),
      players: players.map((p) => ({
        name: p.name || "Chưa đặt tên",
        money: p.money,
      })),
    };

    saveHistory(snapshot);

    // reset tiền
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        money: 0,
      }))
    );
  };

  // ================= TỔNG KẾT =================
  const handleSettlement = () => {
    const total = players.reduce((sum, p) => sum + p.money, 0);

    if (total !== 0) {
      alert("⚠️ Tổng tiền chưa cân bằng!");
      return;
    }

    const snapshot = {
      time: new Date().toLocaleString(),
      players: players.map((p) => ({
        name: p.name || "Chưa đặt tên",
        money: p.money,
      })),
    };

    saveHistory(snapshot);
    setResultPopup(snapshot);
  };

  const renderMoney = (value) => {
    if (value === 0) return "Hoà";
    if (value > 0) return `Nhận ${value.toLocaleString()} đ`;
    return `Trả ${Math.abs(value).toLocaleString()} đ`;
  };

  // ================= UI =================
  return (
    <div className="container">
      <button className="back-btn" onClick={() => navigate("/")}>
        ⬅ Back
      </button>

      <h2>🃏 Tiến Lên</h2>

      <div className="players">
        {players.map((player) => (
          <div key={player.id} className="player-block">
            <input
              className="player-name"
              value={player.name}
              onChange={(e) =>
                updateName(player.id, e.target.value)
              }
              placeholder="Tên người chơi"
            />

            <div className="money-row">
              <button onClick={() => changeMoney(player.id, -1000)}>
                −
              </button>

              <span className="money">
                {player.money.toLocaleString()}
              </span>

              <button onClick={() => changeMoney(player.id, 1000)}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="commit-btn" onClick={commitRound}>
        ✔ CHỐT VÁN
      </button>

      <button className="settle-btn" onClick={handleSettlement}>
        💰 TỔNG KẾT
      </button>

      {/* HISTORY */}
      <details className="history">
        <summary>📜 Lịch sử</summary>

        {history.length === 0 && (
          <div>Chưa có lịch sử</div>
        )}

        {history.map((round, idx) => (
          <div key={idx} className="history-card">
            <b>{round.time}</b>

            {round.players.map((p, i) => (
              <div key={i}>
                • {p.name}: {p.money.toLocaleString()}
              </div>
            ))}
          </div>
        ))}
      </details>

      {/* POPUP */}
      {resultPopup && (
        <div
          className="popup-overlay"
          onClick={() => setResultPopup(null)}
        >
          <div
            className="popup"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>🏆 KẾT QUẢ</h3>

            {resultPopup.players.map((p, i) => (
              <div key={i}>
                {p.name}: {renderMoney(p.money)}
              </div>
            ))}

            <button onClick={() => setResultPopup(null)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
            }
