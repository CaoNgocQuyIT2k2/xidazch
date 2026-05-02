import { useEffect, useState } from "react";
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

  // load history
  useEffect(() => {
    const saved = localStorage.getItem("tienlen_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveHistory = (data) => {
    setHistory(prev => {
      const newHistory = [data, ...prev];
      localStorage.setItem("tienlen_history", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // update tiền
  const changeMoney = (id, amount) => {
    setPlayers(prev =>
      prev.map(p =>
        p.id === id ? { ...p, money: p.money + amount } : p
      )
    );
  };

  const updateName = (id, value) => {
    setPlayers(prev =>
      prev.map(p =>
        p.id === id ? { ...p, name: value } : p
      )
    );
  };

  // 🔥 AUTO tính người thứ 4 nếu chỉ nhập 3 người
  const autoBalance = () => {
    const filledPlayers = players.filter(p => p.name.trim() !== "");

    if (filledPlayers.length === 3) {
      const total = filledPlayers.reduce((sum, p) => sum + p.money, 0);

      const emptyPlayer = players.find(p => p.name.trim() === "");

      if (emptyPlayer) {
        setPlayers(prev =>
          prev.map(p =>
            p.id === emptyPlayer.id
              ? { ...p, name: "Người 4", money: -total }
              : p
          )
        );
      }
    }
  };

  useEffect(() => {
    autoBalance();
  }, [players]);

  // lưu ván
  const commitRound = () => {
    const snapshot = {
      time: new Date().toLocaleTimeString(),
      players: players.map(p => ({
        name: p.name || "Chưa đặt tên",
        money: p.money,
      })),
    };

    saveHistory(snapshot);

    setPlayers(prev =>
      prev.map(p => ({
        ...p,
        money: 0,
      }))
    );
  };

  // tổng kết
  const handleSettlement = () => {
    let total = 0;

    const result = players.map(p => {
      total += p.money;
      return {
        name: p.name || "Chưa đặt tên",
        money: p.money,
      };
    });

    const snapshot = {
      time: new Date().toLocaleString(),
      players: result,
    };

    saveHistory(snapshot);
    setResultPopup(snapshot);
  };

  const renderMoney = (value) => {
    if (value === 0) return "Hoà";
    if (value > 0) return `Nhận ${value.toLocaleString()} đ`;
    return `Trả ${Math.abs(value).toLocaleString()} đ`;
  };

  return (
    <div className="container">
      <button onClick={() => navigate("/")}>⬅ Back</button>

      <h2>🃏 Tiến Lên</h2>

      <div className="players">
        {players.map(player => (
          <div key={player.id} className="player-block">
            <input
              value={player.name}
              onChange={(e) => updateName(player.id, e.target.value)}
              placeholder="Tên người chơi"
            />

            <div>
              <button onClick={() => changeMoney(player.id, -1000)}>−</button>
              <span>{player.money.toLocaleString()}</span>
              <button onClick={() => changeMoney(player.id, 1000)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={commitRound}>✔ CHỐT VÁN</button>
      <button onClick={handleSettlement}>💰 TỔNG KẾT</button>

      {/* HISTORY */}
      <details>
        <summary>📜 Lịch sử</summary>

        {history.map((round, idx) => (
          <div key={idx}>
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
        <div className="popup">
          <h3>Kết quả</h3>

          {resultPopup.players.map((p, i) => (
            <div key={i}>
              {p.name}: {renderMoney(p.money)}
            </div>
          ))}

          <button onClick={() => setResultPopup(null)}>Đóng</button>
        </div>
      )}
    </div>
  );
      }
