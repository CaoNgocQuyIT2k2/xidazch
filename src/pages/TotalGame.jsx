import { useEffect, useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

export default function TotalGame() {
    const [dealer, setDealer] = useState("");
    const [players, setPlayers] = useState([
        { id: 1, name: "", money: 0 },
    ]);
    const navigate = useNavigate();

    const [history, setHistory] = useState([]);
    const [resultPopup, setResultPopup] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem("xi_dach_total_history");

        if (saved) {
            setHistory(JSON.parse(saved));
        }
    }, []);


    const saveHistory = (data) => {
        const newHistory = [data, ...history];

        setHistory(newHistory);

        localStorage.setItem(
            "xi_dach_total_history",
            JSON.stringify(newHistory)
        );
    };


    const clearHistory = () => {
        const ok = window.confirm("Xoá lịch sử chế độ TÍNH TỔNG?");
        if (!ok) return;

        localStorage.removeItem("xi_dach_total_history");
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

        setResultPopup(snapshot);   // ✅ HIỆN POPUP

        saveHistory(snapshot);      // ✅ LƯU LỊCH SỬ

        setPlayers(players.map(p => ({ ...p, money: 0 }))); // reset tiền
    };


    const renderMoney = (value) => {
        if (value === 0) return "Hoà";
        if (value > 0) return `Nhận ${value.toLocaleString()} đ`;
        return `Trả ${Math.abs(value).toLocaleString()} đ`;
    };
    const groupedHistory = {};

    history.forEach(round => {
        round.players.forEach(p => {
            if (!groupedHistory[p.name]) {
                groupedHistory[p.name] = [];
            }
            groupedHistory[p.name].push(p.money);
        });
    });

    return (
        <div className="container">
            <button className="back-btn" onClick={() => navigate("/")}>
                ⬅ Back
            </button>

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

                {Object.entries(groupedHistory).map(([name, rounds]) => {
                    const total = rounds.reduce((sum, r) => sum + r, 0);

                    return (
                        <div key={name} className="history-card">

                            <div className="history-line">
                                <b>✔ {name}:</b>

                                <span className="round-array">
                                    {rounds.map((r, i) => (
                                        <span key={i}>
                                            {i !== 0 && ", "}
                                            {r.toLocaleString()}
                                        </span>
                                    ))}
                                </span>
                            </div>

                            <div className="round-total">
                                ✔ Tổng: <b>{total.toLocaleString()}</b>
                            </div>

                        </div>
                    );
                })}


                {history.length > 0 && (
                    <button className="clear-btn" onClick={clearHistory}>
                        🗑 Xoá lịch sử
                    </button>
                )}
            </details>{resultPopup && (
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