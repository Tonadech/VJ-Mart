import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const firebaseConfig = {
  apiKey: "AIzaSyBcL-j2Em-8q0Wvg-flOTssxQT4XlWqXzE",
  authDomain: "bill-for--vj-mart.firebaseapp.com",
  projectId: "bill-for--vj-mart",
  storageBucket: "bill-for--vj-mart.firebasestorage.app",
  messagingSenderId: "700824685931",
  appId: "1:700824685931:web:856b3880c0496b5fd1902e"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [entryTypeFilter, setEntryTypeFilter] = useState("expense");

  // Status list by role
  const fullStatusList = [
    { label: "⏳ รอทำเบิก", value: "รอทำเบิก", color: "#757575" },
    { label: "✅ หัวหน้าอนุมัติ", value: "หัวหน้าอนุมัติ", color: "#2979ff" },
    { label: "🔍 ตรวจสอบแล้ว", value: "ตรวจสอบแล้ว", color: "#43a047" },
    { label: "❌ ไม่เรียบร้อย", value: "ไม่เรียบร้อย", color: "#29b6f6" },
    { label: "✅ ส่งให้ลูกค้าแล้ว", value: "ส่งให้ลูกค้าแล้ว", color: "#43a047" },
    { label: "❌ ยกเลิก", value: "ยกเลิก", color: "#e53935" },
    { label: "💸 โอนชำระโดยพนักงาน", value: "โอนชำระโดยพนักงาน", color: "#8d6e63" }
  ];
  const adminLeaderStatusList = [
    { label: "⏳ รอทำเบิก", value: "รอทำเบิก", color: "#757575" },
    { label: "💸 โอนชำระโดยพนักงาน", value: "โอนชำระโดยพนักงาน", color: "#8d6e63" },
    { label: "✅ หัวหน้าอนุมัติ", value: "หัวหน้าอนุมัติ", color: "#2979ff" },
    { label: "🔍 ตรวจสอบแล้ว", value: "ตรวจสอบแล้ว", color: "#43a047" },
    { label: "❌ ไม่เรียบร้อย", value: "ไม่เรียบร้อย", color: "#29b6f6" },
    { label: "✅ ส่งให้ลูกค้าแล้ว", value: "ส่งให้ลูกค้าแล้ว", color: "#43a047" },
    { label: "❌ ยกเลิก", value: "ยกเลิก", color: "#e53935" }
  ];
  const statusList = user && user.role === "adminleader" ? adminLeaderStatusList : fullStatusList;
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        window.location.href = "/";
        return;
      }
      try {
        const userSnap = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = userSnap.data();
        setUser(userData);
        let q;
        if (userData.role === "admin") {
          // admin เห็นแต่ของตัวเอง
          q = query(collection(db, "expenses"), where("uid", "==", firebaseUser.uid));
        } else if (userData.role === "adminleader") {
          // adminleader เห็นของตัวเองและ admin ที่ adminleader เป็นหัวหน้า
          q = query(
            collection(db, "expenses"),
            where("adminleader", "==", userData.name),
            where("company", "==", userData.company)
          );
        } else if (userData.role === "accountor") {
          // accountor เห็นทั้ง company
          q = query(
            collection(db, "expenses"),
            where("company", "==", userData.company)
          );
        } else {
          setError("บทบาทไม่ถูกต้อง");
          setLoading(false);
          return;
        }
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExpenses(items);
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล: " + err.message);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      alert("Logout failed");
    }
  };

  const handleItemClick = (expense) => {
    setSelectedExpense(expense);
  };

  const handleLightboxOpen = (imgUrl) => {
    setLightboxImg(imgUrl);
  };

  const handleLightboxClose = () => {
    setLightboxImg(null);
  };

  // Count for each status
  const statusCount = statusList.reduce((acc, s) => {
    acc[s.value] = expenses.filter(e => e.status === s.value).length;
    return acc;
  }, {});

  // Filter expenses by entryType and selectedStatus
  const filteredExpenses = expenses.filter(e => e.entryType === entryTypeFilter && (!selectedStatus || e.status === selectedStatus));

  return (
    <div>
      {/* Top Navigation Bar */}
      <header className="main-header">
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Beautiful VJ MART logo text */}
          <span style={{
            fontWeight: 900,
            fontSize: 40,
            color: '#1565c0',
            letterSpacing: 5,
            fontFamily: 'Segoe UI, Arial, sans-serif',
            textShadow: '1px 2px 8px rgba(21,101,192,0.10)',
            padding: '8px 24px 8px 0',
            borderRadius: 12,
            background: 'linear-gradient(90deg,rgb(218, 228, 235) 60%, #fff 100%)'
          }}>VJ MART</span>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 10, color: '#222', letterSpacing: 3 }}>ระบบจัดการรายจ่าย</h1>
        </div>
        <div className="header-right">
          <div className="welcome-text" id="welcomeText">
            {user ? `สวัสดี, ${user.name}` : "กำลังโหลด..."}
          </div>
          <button id="logoutBtn" className="btn delete" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Status Summary Panel */}
      <section className="status-container">
        <div id="status-summary" className="status-summary" style={{ display: "flex", gap: 16 }}>
          {statusList.map(status => (
            <div
              key={status.value}
              style={{
                background: status.color,
                color: "#fff",
                borderRadius: 16,
                padding: 20,
                minWidth: 150,
                textAlign: "center",
                cursor: "pointer",
                border: selectedStatus === status.value ? "4px solid #222" : "none",
                boxShadow: selectedStatus === status.value ? "0 0 10px #222" : "none"
              }}
              onClick={() => setSelectedStatus(selectedStatus === status.value ? null : status.value)}
            >
              <div style={{ fontSize: 22, fontWeight: 700 }}>{status.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{statusCount[status.value] || 0}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Left Side: List Panel */}
        <aside id="left-panel">
          <div className="mb-2">
            <label htmlFor="entryTypeFilter"><strong>🔍 ประเภท:</strong></label>
            <select
              id="entryTypeFilter"
              className="form-select"
              value={entryTypeFilter}
              onChange={e => setEntryTypeFilter(e.target.value)}
            >
              <option value="expense">📌 รายการปกติ</option>
              <option value="recurring">🔁 Recurring</option>
            </select>
          </div>
          <h3>📋 รายการของคุณ</h3>
          {/* Expense Items */}
          <div id="item-list">
            {loading ? (
              <p>กำลังโหลดข้อมูล...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : filteredExpenses.length === 0 ? (
              <p>ไม่มีข้อมูล</p>
            ) : (
              filteredExpenses.map(item => (
                <div key={item.id} className="item" onClick={() => handleItemClick(item)}>
                  {item.item} - {item.amount} บาท
                </div>
              ))
            )}
          </div>
          <button className="btn add" onClick={() => navigate('/form')}>➕ เพิ่มรายการใหม่</button>
        </aside>

        {/* Right Side: Detail Panel */}
        <section id="right-panel">
          <h3>📄 รายละเอียด</h3>
          <div id="item-detail">
            {selectedExpense ? (
              <div>
                <p><b>รายการ:</b> {selectedExpense.item}</p>
                <p><b>วันที่:</b> {selectedExpense.date && selectedExpense.date.toDate ? selectedExpense.date.toDate().toLocaleString() : (selectedExpense.date || "")}</p>
                {/* If you have a createdAt field, render it safely too: */}
                {selectedExpense.createdAt && (
                  <p><b>เพิ่มเมื่อ:</b> {selectedExpense.createdAt.toDate ? selectedExpense.createdAt.toDate().toLocaleString() : selectedExpense.createdAt.toString()}</p>
                )}
                <p><b>ยอดชำระ:</b> {selectedExpense.amount} บาท</p>
                <p><b>ธนาคาร:</b> {selectedExpense.bank}</p>
                <p><b>บัญชี:</b> {selectedExpense.accountName} ({selectedExpense.accountNumber})</p>
                <p><b>พนักงาน:</b> {selectedExpense.employee} ({selectedExpense.role})</p>
                <p><b>สถานะ:</b> {selectedExpense.status}</p>
                {selectedExpense.invImgUrl && (
                  <div>
                    <b>รูปภาพใบแจ้งหนี้:</b><br />
                    <img
                      src={selectedExpense.invImgUrl}
                      alt="Invoice"
                      style={{ maxWidth: "100%", maxHeight: 300, border: "1px solid #ccc", marginTop: 10, cursor: "pointer" }}
                      onClick={() => handleLightboxOpen(selectedExpense.invImgUrl)}
                    />
                  </div>
                )}
                {selectedExpense.invPdfUrl && (
                  <div style={{ marginTop: 10 }}>
                    <b>ไฟล์ใบแจ้งหนี้ (PDF):</b><br />
                    <a href={selectedExpense.invPdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary">📄 เปิดไฟล์ PDF</a>
                  </div>
                )}
                {selectedExpense.invImgEmployeeUrl && (
                  <div>
                    <b>รูปภาพใบโอนชำระโดยพนักงาน:</b><br />
                    <img
                      src={selectedExpense.invImgEmployeeUrl}
                      alt="Invoice Employee"
                      style={{ maxWidth: "100%", maxHeight: 300, border: "1px solid #ccc", marginTop: 10, cursor: "pointer" }}
                      onClick={() => handleLightboxOpen(selectedExpense.invImgEmployeeUrl)}
                    />
                  </div>
                )}
                {selectedExpense.invPdfEmployeeUrl && (
                  <div style={{ marginTop: 10 }}>
                    <b>ไฟล์ใบโอนชำระโดยพนักงาน (PDF):</b><br />
                    <a href={selectedExpense.invPdfEmployeeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary">📄 เปิดไฟล์ PDF</a>
                  </div>
                )}
                {/* Approve/Cancel Buttons */}
                {["adminleader", "accountor", "hr", "vj"].includes(user?.role) && selectedExpense.status !== "อนุมัติ" && selectedExpense.status !== "ยกเลิก" && (
                  <div style={{ marginTop: 20 }}>
                    <button className="btn btn-success me-2" onClick={async () => {
                      if (
                        user?.role === "adminleader" &&
                        ["รอทำเบิก", "โอนชำระโดยพนักงาน"].includes(selectedExpense.status)
                      ) {
                        navigate(`/form?id=${selectedExpense.id}`);
                        return;
                      }
                      try {
                        // เตรียม payload เผื่ออนาคตมี field อื่น
                        const updatePayload = { status: "อนุมัติ" };
                        Object.keys(updatePayload).forEach(key => {
                          if (updatePayload[key] === undefined) delete updatePayload[key];
                        });
                        await updateDoc(doc(db, "expenses", selectedExpense.id), updatePayload);
                        setSelectedExpense({ ...selectedExpense, status: "อนุมัติ" });
                        setExpenses(expenses.map(e => e.id === selectedExpense.id ? { ...e, status: "อนุมัติ" } : e));
                      } catch (err) {
                        alert("เกิดข้อผิดพลาดในการอนุมัติ: " + err.message);
                      }
                    }}>อนุมัติ</button>
                    <button className="btn btn-danger" onClick={async () => {
                      if (!window.confirm("ยืนยันการยกเลิกรายการนี้?")) return;
                      try {
                        const updatePayload = { status: "ยกเลิก" };
                        Object.keys(updatePayload).forEach(key => {
                          if (updatePayload[key] === undefined) delete updatePayload[key];
                        });
                        await updateDoc(doc(db, "expenses", selectedExpense.id), updatePayload);
                        setSelectedExpense({ ...selectedExpense, status: "ยกเลิก" });
                        setExpenses(expenses.map(e => e.id === selectedExpense.id ? { ...e, status: "ยกเลิก" } : e));
                      } catch (err) {
                        alert("เกิดข้อผิดพลาดในการยกเลิก: " + err.message);
                      }
                    }}>ยกเลิก</button>
                  </div>
                )}
              </div>
            ) : (
              <div>กรุณาเลือกรายการด้านซ้าย</div>
            )}
          </div>

          {/* Lightbox */}
          {lightboxImg && (
            <div className="lightbox" onClick={handleLightboxClose}>
              <img src={lightboxImg} alt="Full" />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard; 