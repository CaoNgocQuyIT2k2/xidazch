import { useEffect, useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

export default function RoundGame() {
  const [dealer, setDealer] = useState("");
  const [resultPopup, setResultPopup] = useState(null);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const [multiplier, setMultiplier] = useState(1);

  const [playersLoaded, setPlayersLoaded] = useState(false);
  const [players, setPlayers] = useState([
    { id: 1, name: "", currentMoney: 0, rounds: [] },
  ]);
  useEffect(() => {
    try {
      const savedPlayers = localStorage.getItem("xi_dach_players");

      if (savedPlayers) {
        setPlayers(JSON.parse(savedPlayers));
      }

    } catch (e) {
      console.warn("Players storage corrupted");
    }

    setPlayersLoaded(true); // QUAN TRỌNG
  }, []);




  useEffect(() => {
    const saved = localStorage.getItem("xi_dach_history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveHistory = (data) => {
    setHistory(prev => {
      const newHistory = [data, ...prev];

      localStorage.setItem(
        "xi_dach_history",
        JSON.stringify(newHistory)
      );

      return newHistory;
    });
  };


  const clearHistory = () => {
    const ok = window.confirm("Xoá toàn bộ lịch sử?");
    if (!ok) return;

    localStorage.removeItem("xi_dach_history");
    setHistory([]);

    // reset tiền nhưng giữ players
    setPlayers(prev =>
      prev.map(p => ({
        ...p,
        currentMoney: 0,
        rounds: [],
      }))
    );
  };




  useEffect(() => {
    if (!playersLoaded) return;

    localStorage.setItem(
      "xi_dach_players",
      JSON.stringify(players)
    );
  }, [players, playersLoaded]);
  const addPlayer = () => {
    setPlayers([
      ...players,
      { id: Date.now(), name: "", currentMoney: 0, rounds: [] },
    ]);
  };

  const updatePlayer = (id, field, value) => {
    setPlayers(prev =>
      prev.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const removePlayer = (player) => {
    const ok = window.confirm(
      `Bạn có muốn xoá ${player.name || "người chơi này"} không?`
    );
    if (!ok) return;

    setPlayers(prev => prev.filter(p => p.id !== player.id));
  };


  const changeMoney = (id, amount) => {
    const realAmount = amount * multiplier;

    setPlayers(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, currentMoney: p.currentMoney + realAmount }
          : p
      )
    );
  };






  const commitAllRounds = () => {
    const ok = window.confirm("Chốt ván hiện tại?");
    if (!ok) return;

    const roundSnapshot = {
      time: new Date().toLocaleTimeString(),
      players: players.map(p => ({
        name: p.name || "Chưa đặt tên",
        money: p.currentMoney,
      })),
    };

    saveHistory(roundSnapshot);   // ✅ gọi OUTSIDE

    setPlayers(prev =>
      prev.map(p => ({
        ...p,
        currentMoney: 0,
        rounds: [...p.rounds, p.currentMoney],
      }))
    );
  };





  const resetBoard = () => {
    const ok = window.confirm("Reset toàn bộ?");
    if (!ok) return;

    localStorage.removeItem("xi_dach_history");
    localStorage.removeItem("xi_dach_players");

    setHistory([]);
    setPlayers([
      { id: 1, name: "", currentMoney: 0, rounds: [] },
    ]);
  };


  const handleSettlement = () => {
    const ok = window.confirm("Bạn có muốn tổng kết sòng không?");
    if (!ok) return;

    let total = 0;

    const resultPlayers = players.map(p => {
      const sumRounds = p.rounds.reduce((a, b) => a + b, 0);
      const finalMoney = sumRounds + p.currentMoney;

      total += finalMoney;

      return {
        name: p.name || "Chưa đặt tên",
        money: finalMoney,
      };
    });

    const dealerMoney = -total;

    const snapshot = {
      time: new Date().toLocaleString(),
      dealer: dealer || "Chủ sòng",
      dealerMoney,
      players: resultPlayers,
    };

    saveHistory(snapshot);        // ✅ QUAN TRỌNG NHẤT

    setResultPopup(snapshot);

    setPlayers(players.map(p => ({
      ...p,
      currentMoney: 0,
      rounds: [],
    })));
  };




  const renderMoney = (value) => {
    if (value === 0) return "Hoà";
    if (value > 0) return `Nhận ${value.toLocaleString()} đ`;
    return `Trả ${Math.abs(value).toLocaleString()} đ`;
  };



  return (
    <div className="container">
      <button className="back-btn" onClick={() => navigate("/")}>
        ⬅ Back
      </button>

      <h2>🃏 Xì Dách</h2>

      <div className="card">
        <label>Chủ sòng</label>
        <input
          value={dealer}
          onChange={(e) => setDealer(e.target.value)}
          placeholder="Nhập tên chủ sòng"
        />

      </div>
      <div className="card">
        <label>Hệ số cược</label>
        <input
          type="number"
          value={multiplier}
          onChange={(e) => setMultiplier(Number(e.target.value) || 1)}
          placeholder="Ví dụ 5"
        />
      </div>

      <button className="commit-all-btn" onClick={commitAllRounds}>
        ✔ CHỐT VÁN
      </button>

      <div className="players">
        {players.map(player => (
          <div key={player.id} className="player-block">

            <div className="player-row">
              <input
                className="player-name"
                value={player.name}
                onChange={(e) =>
                  updatePlayer(player.id, "name", e.target.value)
                }
                placeholder="Tên thành viên"
              />

              <span className="money">
                {player.currentMoney.toLocaleString()}
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

            {/* ✅ 5 ván gần nhất */}
            <div className="rounds">
              {player.rounds.slice(-5).map((r, i) => (
                <span key={i} className="round">
                  {r > 0 ? "+" : ""}{r.toLocaleString()}
                </span>
              ))}


              {player.rounds.length === 0 && (
                <span className="empty-round">Chưa có ván</span>
              )}
            </div>

          </div>
        ))}
      </div>

      <button className="add-btn" onClick={addPlayer}>
        + Thêm thành viên
      </button>

      <button className="settle-btn" onClick={handleSettlement}>
        ✅ TỔNG KẾT
      </button>
      <button className="reset-btn" onClick={resetBoard}>
        🔄 RESET
      </button>

      <details className="history">
        <summary>📜 XEM LỊCH SỬ</summary>

        {history.length === 0 && (
          <div className="empty">Chưa có lịch sử</div>
        )}

        {history.map((round, idx) => (
          <div key={idx} className="history-card">

            <div><b>🕒 {round.time}</b></div>

            {round.dealer && (
              <div>🎯 {round.dealer}: {renderMoney(round.dealerMoney)}</div>
            )}

            {round.players.map((p, i) => (
              <div key={i}>
                • {p.name}: {p.money.toLocaleString()}
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





      {resultPopup && (
        <div className="popup-overlay" onClick={() => setResultPopup(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>

            <h3>🏆 KẾT TOÁN</h3>

            <div className="popup-line">
              🎯 {resultPopup.dealer}: <b>{renderMoney(resultPopup.dealerMoney)}</b>
            </div>

            {resultPopup.players.map((p, i) => (
              <div key={i} className="popup-line">
                • {p.name}: {renderMoney(p.money)}
              </div>
            ))}

            <button onClick={() => setResultPopup(null)}>Đóng</button>
          </div>
        </div>
      )}

    </div>
  );
}
