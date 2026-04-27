import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, Landmark, Wallet, X } from "lucide-react";
import "../DoctorDashboard/Earning.css";
import { useAuthUser } from "../../Services/useAuthUser";


const Earning = () => {
  const { user } = useAuthUser();
  const [earningsData, setEarningsData] = useState({
    totalEarnings: "Rs. 0",
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const getNumericAmount = (value) => {
    const cleanedAmount = Number.parseFloat(
      String(value || "0").replace(/[^\d.]/g, ""),
    );
    return Number.isNaN(cleanedAmount) ? 0 : cleanedAmount;
  };

  const formatCurrency = (amount) => `Rs. ${amount.toLocaleString("en-IN")}`;

  const showToastMsg = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      5002,
    );
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    if (user != null) {
      const userId = user?.userId || null;
      if (userId) {
        if (userId) {
          axios
            .get(`http://localhost:5000/api/appointments/earnings/${userId}`)
            .then((res) => {
              console.log("Earnings Data Received:", res.data);
              setEarningsData({
                totalEarnings: res.data?.totalEarnings || "Rs. 0",
                transactions: res.data?.transactions || [],
              });
              setLoading(false);
            })
            .catch((err) => {
              console.error("API Fetch Error:", err);
              setLoading(false);
            });
        } else {
          console.error("Doctor ID not found in localStorage! Login again.");
          setLoading(false);
        }
      }
    }
  }, [user]);

  const totalRevenue = getNumericAmount(earningsData.totalEarnings);

  const handleWithdrawFunds = () => {
    if (isWithdrawing || totalRevenue <= 0) {
      return;
    }

    setIsWithdrawing(true);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    setTimeout(() => {
      const withdrawnAmount = totalRevenue;

      setEarningsData((previousData) => ({
        totalEarnings: formatCurrency(0),
        transactions: [
          {
            id: `WD-${Date.now().toString().slice(-6)}`,
            patient: "Bank Settlement",
            date: new Date().toLocaleDateString("en-IN"),
            method: "Bank Transfer",
            amount: `-${formatCurrency(withdrawnAmount)}`,
            status: "Withdrawn",
          },
          ...previousData.transactions,
        ],
      }));

      setIsWithdrawing(false);
      showToastMsg("Fund added on bank account successfully.");
    }, 1800);
  };

  if (loading)
    return <div className="earnings-loading">Loading Earnings...</div>;

  return (
    <div className="earnings-container">
      {toast.show && (
        <div className="earnings-toast earnings-toast-success">
          <CheckCircle size={20} />
          <div>
            <strong>Success:</strong> {toast.message}
          </div>
          <X
            size={16}
            onClick={() => setToast({ ...toast, show: false })}
            className="earnings-toast-close"
          />
          <div className="earnings-toast-timer earnings-run-5s"></div>
        </div>
      )}

      <div className="earnings-header">
        <div className="header-info">
          <h1>Financial Overview</h1>
          <p>Monitor your revenue and transactions from booked appointments.</p>
        </div>
        <button
          className={`payout-btn ${isWithdrawing ? "is-processing" : ""}`}
          onClick={handleWithdrawFunds}
          disabled={isWithdrawing || totalRevenue <= 0}
        >
          {isWithdrawing ? (
            <>
              <span className="payout-spinner"></span>
              Processing Withdrawal
            </>
          ) : (
            <>
              <Landmark size={18} />
              Withdraw Funds
            </>
          )}
        </button>
      </div>

      <div className="stats-grid">
        <div className={`stat-card ${isWithdrawing ? "card-processing" : ""}`}>
          <span>Total Revenue</span>
          <h2>{formatCurrency(totalRevenue)}</h2>
          <small className="trend-up">Live Updates</small>
        </div>
        <div className="stat-card">
          <span>Total Transactions</span>
          <h2>{earningsData.transactions.length}</h2>
          <small>Completed visits</small>
        </div>
        <div className="stat-card earnings-highlight-card">
          <span>Available To Withdraw</span>
          <h2>{formatCurrency(totalRevenue)}</h2>
          <small className={totalRevenue > 0 ? "trend-up" : "text-grey"}>
            {totalRevenue > 0 ? "Ready for transfer" : "No withdrawable funds"}
          </small>
        </div>
        <div className="stat-card">
          <span>Settlement Mode</span>
          <h2 className="earnings-icon-title">
            <Wallet size={20} /> Bank Account
          </h2>
          <small>Demo withdrawal preview</small>
        </div>
      </div>

      <div className="transactions-section">
        <h3>Recent Transactions</h3>
        <div className="table-wrapper">
          <table className="earnings-table">
            <thead>
              <tr>
                <th>INVOICE ID</th>
                <th>PATIENT NAME</th>
                <th>DATE</th>
                <th>METHOD</th>
                <th>FEE AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {earningsData.transactions.length > 0 ? (
                earningsData.transactions.map((t, index) => (
                  <tr key={index}>
                    <td>#{t.id}</td>
                    <td>
                      <strong>{t.patient}</strong>
                    </td>
                    <td>{t.date}</td>
                    <td>{t.method}</td>
                    <td className="earnings-amount-cell">{t.amount}</td>
                    <td>
                      <span
                        className={`pay-status ${t.status === "Withdrawn" ? "withdrawn" : "paid"
                          }`}
                      >
                        {t.status || "Paid"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="earnings-empty-cell">
                    No transactions found for this doctor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Earning;
