import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [dealer, setDealer] = useState("");
  const [players, setPlayers] = useState([
    { id: 1, name: "", money: 0 },
  ]);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("xi_dach_history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveHistory = (data) => {
    const newHistory = [data, ...history];
    setHistory(newHistory);
    sessionStorage.setItem(
      "xi_dach_history",
      JSON.stringify(newHistory)
    );
  };

  const clearHistory = () => {
    sessionStorage.removeItem("xi_dach_history");
    setHistory([]);
  };

  const addPlayer = () => {
    setPlayers([
      ...players,
      { id: Date.now(), name: "", money: 0 },
    ]);
  };

  const removePlayer = (player) => {
    const displayName = player.name || "người chơi này";

    const ok = window.confirm(
      `Bạn có muốn xoá ${displayName} không?`
    );

    if (!ok) return;

    setPlayers(players.filter(p => p.id !== player.id));
  };


  const updatePlayer = (id, field, value) => {
    setPlayers(players.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const changeMoney = (id, amount) => {
    setPlayers(players.map(p =>
      p.id === id ? { ...p, money: p.money + amount } : p
    ));
  };

  const handleSettlement = () => {
    const ok = window.confirm("Bạn có muốn tổng kết sòng không?");
    if (!ok) return;

    const playersTotal = players.reduce(
      (sum, p) => sum + p.money,
      0
    );

    const dealerMoney = -playersTotal;

    const snapshot = {
      time: new Date().toLocaleString(),
      dealer: dealer || "Chủ sòng",
      dealerMoney,
      players: players.map(p => ({
        name: p.name || "Chưa đặt tên",
        money: p.money,
      })),
    };

    saveHistory(snapshot);

    // reset tiền
    setPlayers(players.map(p => ({ ...p, money: 0 })));
  };

  const renderMoney = (value) => {
    if (value === 0) return "Hoà";
    if (value > 0) return `Nhận ${value.toLocaleString()} đ`;
    return `Trả ${Math.abs(value).toLocaleString()} đ`;
  };

  return (
    <div className="container">
      <h2>🃏 Tính Tiền Xì Dách</h2>

      <div className="card">
        <label>Chủ sòng</label>
        <input
          value={dealer}
          onChange={(e) => setDealer(e.target.value)}
          placeholder="Nhập tên chủ sòng"
        />
      </div>

      <div className="players">
        {players.map((player) => (
          <div key={player.id} className="player-row">
            <input
              className="player-name"
              value={player.name}
              onChange={(e) =>
                updatePlayer(player.id, "name", e.target.value)
              }
              placeholder="Tên thành viên"
            />

            <span className="money">
              {player.money.toLocaleString()}
            </span>

            <button onClick={() => changeMoney(player.id, -1000)}>−</button>
            <button onClick={() => changeMoney(player.id, 1000)}>+</button>

            <button
              className="remove"
              onClick={() => removePlayer(player)}
            >
              ✕
            </button>

          </div>
        ))}
      </div>

      <button className="add-btn" onClick={addPlayer}>
        + Thêm thành viên
      </button>

      <button className="settle-btn" onClick={handleSettlement}>
        ✅ TỔNG KẾT
      </button>

      <details className="history">
        <summary>📜 XEM LỊCH SỬ</summary>

        {history.length === 0 && (
          <div className="empty">Chưa có lịch sử</div>
        )}

        {history.map((item, index) => (
          <div key={index} className="history-card">
            <div className="history-time">{item.time}</div>

            <div className="history-dealer">
              🎯 {item.dealer}: <b>{renderMoney(item.dealerMoney)}</b>
            </div>

            {item.players.map((p, i) => (
              <div key={i} className="history-player">
                • {p.name}: {renderMoney(p.money)}
              </div>
            ))}
          </div>
        ))}

        {history.length > 0 && (
          <button className="clear-btn" onClick={clearHistory}>
            🗑 Xoá lịch sử
          </button>
        )}
      </details>
    </div>
  );
}
