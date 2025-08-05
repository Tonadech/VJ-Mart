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
  const [recurrings, setRecurrings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedRecurring, setSelectedRecurring] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [entryTypeFilter, setEntryTypeFilter] = useState("expense");

  // Status list by role
  const fullStatusList = [
    { label: "⏳ รอทำเบิก", value: "รอทำเบิก", color: "#757575" },
    { label: "💸 โอนชำระโดยพนักงาน", value: "โอนชำระโดยพนักงาน", color: "#8d6e63" },
    { label: "✅ หัวหน้าอนุมัติ", value: "หัวหน้าอนุมัติ", color: "#2979ff" },
    { label: "🔍 ตรวจสอบแล้ว", value: "ตรวจสอบแล้ว", color: "#43a047" },
    { label: "❌ ไม่เรียบร้อย", value: "ไม่เรียบร้อย", color: "#29b6f6" },
    { label: "✅ ส่งให้คู่ค้าแล้ว", value: "ส่งให้คู่ค้าแล้ว", color: "#43a047" },
    { label: "❌ ยกเลิก", value: "ยกเลิก", color: "#e53935" }
  ];
  const adminLeaderStatusList = [
    { label: "⏳ รอทำเบิก", value: "รอทำเบิก", color: "#757575" },
    { label: "💸 โอนชำระโดยพนักงาน", value: "โอนชำระโดยพนักงาน", color: "#8d6e63" },
    { label: "✅ หัวหน้าอนุมัติ", value: "หัวหน้าอนุมัติ", color: "#2979ff" },
    { label: "🔍 ตรวจสอบแล้ว", value: "ตรวจสอบแล้ว", color: "#43a047" },
    { label: "❌ ไม่เรียบร้อย", value: "ไม่เรียบร้อย", color: "#29b6f6" },
    { label: "✅ ส่งให้คู่ค้าแล้ว", value: "ส่งให้คู่ค้าแล้ว", color: "#43a047" },
    { label: "❌ ยกเลิก", value: "ยกเลิก", color: "#e53935" }
  ];
  const statusList = user && user.role === "adminleader" ? adminLeaderStatusList : fullStatusList;
  const [selectedStatus, setSelectedStatus] = useState('รอทำเบิก');

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
        // โหลด recurring
        const recurringSnap = await getDocs(collection(db, "recurring"));
        setRecurrings(recurringSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

  // const handleItemClick = (expense) => {
  //   setSelectedExpense(expense);
  // };

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
  const filteredExpenses = selectedRecurring
    ? recurrings.filter(r => r.status === 'Recurring')
    : expenses.filter(e => e.entryType === entryTypeFilter && selectedStatus && e.status === selectedStatus);

  // Count filtered recurring items
  const filteredRecurringCount = recurrings.filter(r => r.status === 'Recurring').length;

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafd' }}>
      {/* Top Navigation Bar */}
      <header className="main-header" style={{ 
        padding: '10px 20px',
        background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div className="header-left" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Beautiful VJ MART logo text */}
          <span style={{
            fontWeight: 900,
            fontSize: window.innerWidth <= 768 ? '24px' : '40px',
            color: '#1565c0',
            letterSpacing: 5,
            fontFamily: 'Segoe UI, Arial, sans-serif',
            textShadow: '1px 2px 8px rgba(21,101,192,0.10)',
            padding: '8px 12px 8px 0',
            borderRadius: 12,
            background: 'linear-gradient(90deg,rgb(218, 228, 235) 60%, #fff 100%)'
          }}>{user?.company || "VJ MART"}</span>
          <h1 style={{ 
            fontSize: window.innerWidth <= 768 ? '18px' : '28px', 
            fontWeight: 700, 
            margin: '5px 0', 
            color: '#222', 
            letterSpacing: 3 
          }}>ระบบจัดการรายจ่าย</h1>
        </div>
        <div className="header-right" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <div className="welcome-text" id="welcomeText" style={{
            fontSize: window.innerWidth <= 768 ? '14px' : '16px'
          }}>
            {user ? `สวัสดี, ${user.name}` : "กำลังโหลด..."}
          </div>
          <button id="logoutBtn" className="btn delete" onClick={handleLogout} style={{
            fontSize: window.innerWidth <= 768 ? '12px' : '14px',
            padding: window.innerWidth <= 768 ? '6px 12px' : '8px 16px'
          }}>Logout</button>
        </div>
      </header>

      {/* Status Summary Panel */}
      <section className="status-container" style={{ 
        padding: '10px 15px',
        background: '#fff',
        marginBottom: '5px'
      }}>
        <div id="status-summary" className="status-summary" style={{ 
          display: "flex", 
          gap: window.innerWidth <= 768 ? 6 : 12, 
          flexWrap: "wrap", 
          overflowX: "auto",
          justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-start'
        }}>
          {statusList.map(status => (
            <div
              key={status.value}
              style={{
                background: status.color,
                color: "#fff",
                borderRadius: 12,
                padding: window.innerWidth <= 768 ? 6 : 12,
                minWidth: window.innerWidth <= 768 ? 80 : 110,
                textAlign: "center",
                cursor: "pointer",
                border: selectedStatus === status.value ? "3px solid #222" : "none",
                boxShadow: selectedStatus === status.value ? "0 0 6px #222" : "none",
                flex: window.innerWidth <= 768 ? '1 1 auto' : 'none'
              }}
              onClick={() => {
                setSelectedStatus(status.value);
                setSelectedRecurring(null);
              }}
            >
              <div style={{ 
                fontSize: window.innerWidth <= 768 ? 10 : 16, 
                fontWeight: 700 
              }}>{status.label}</div>
              <div style={{ 
                fontSize: window.innerWidth <= 768 ? 14 : 20, 
                fontWeight: 700 
              }}>{statusCount[status.value] || 0}</div>
            </div>
          ))}
          {/* กล่อง Recurring ต่อจากยกเลิก */}
          <div
            style={{
              background: '#ffb300',
              color: '#fff',
              borderRadius: 12,
              padding: window.innerWidth <= 768 ? 6 : 12,
              minWidth: window.innerWidth <= 768 ? 80 : 110,
              textAlign: 'center',
              cursor: 'pointer',
              border: selectedRecurring ? '3px solid #222' : 'none',
              boxShadow: selectedRecurring ? '0 0 6px #222' : 'none',
              marginLeft: window.innerWidth <= 768 ? 0 : 8,
              flex: window.innerWidth <= 768 ? '1 1 auto' : 'none'
            }}
            onClick={() => {
              setSelectedRecurring(true);
              setSelectedStatus(null);
            }}
          >
            <div style={{ 
              fontSize: window.innerWidth <= 768 ? 10 : 16, 
              fontWeight: 700 
            }}>🔁 Recurring</div>
            <div style={{ 
              fontSize: window.innerWidth <= 768 ? 14 : 20, 
              fontWeight: 700 
            }}>{filteredRecurringCount}</div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="dashboard-main" style={{ 
        display: window.innerWidth <= 768 ? 'block' : 'flex', 
        height: window.innerWidth <= 768 ? 'auto' : 'calc(100vh - 120px)',
        minHeight: window.innerWidth <= 768 ? 'calc(100vh - 250px)' : 'auto',
        overflow: 'hidden'
      }}>
        {/* Left Side: List Panel */}
        <aside id="left-panel" style={{ 
          width: window.innerWidth <= 768 ? '100%' : 320, 
          minWidth: window.innerWidth <= 768 ? 'auto' : 220, 
          background: '#fff', 
          borderRight: window.innerWidth <= 768 ? 'none' : '1px solid #e3e3e3',
          borderBottom: window.innerWidth <= 768 ? '1px solid #e3e3e3' : 'none',
          display: 'flex', 
          flexDirection: 'column', 
          height: window.innerWidth <= 768 ? 'auto' : '100%',
          padding: window.innerWidth <= 768 ? '15px' : '15px',
          overflow: 'hidden'
        }}>
          <div className="mb-2">
            <label htmlFor="entryTypeFilter"><strong>🔍 ประเภท:</strong></label>
            <select
              id="entryTypeFilter"
              className="form-select"
              value={entryTypeFilter}
              onChange={e => setEntryTypeFilter(e.target.value)}
              disabled={selectedRecurring}
            >
              <option value="expense">📌 รายการปกติ</option>
              <option value="recurring">🔁 Recurring</option>
            </select>
          </div>
          <div style={{ marginBottom: 15 }}>
            <button className="btn add" style={{ width: '100%' }} onClick={() => navigate('/form')}>➕ เพิ่มรายการใหม่</button>
          </div>
          <h3>📋 รายการของคุณ</h3>
          {/* Expense Items */}
          <div id="item-list" style={{ 
            flex: 1, 
            overflowY: 'auto', 
            marginBottom: 12,
            maxHeight: window.innerWidth <= 768 ? '300px' : 'calc(100vh - 350px)'
          }}>
            {loading ? (
              <p>กำลังโหลดข้อมูล...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : filteredExpenses.length === 0 ? (
              <p>ไม่มีข้อมูล</p>
            ) : (
              filteredExpenses.map(item => (
                <div key={item.id} className="item" onClick={() => {
                  if (selectedRecurring) {
                    setSelectedRecurring(item);
                    setSelectedExpense(null);
                  } else {
                    setSelectedExpense(item);
                    setSelectedRecurring(null);
                  }
                }}>
                  {item.item} - {item.amount} บาท
                </div>
              ))
            )}
          </div>
        </aside>
        {/* Right Side: Detail Panel */}
        <section id="right-panel" style={{ 
          flex: window.innerWidth <= 768 ? 'none' : 1, 
          padding: window.innerWidth <= 768 ? '15px' : 20, 
          overflowY: 'auto', 
          height: window.innerWidth <= 768 ? 'auto' : '100%',
          background: window.innerWidth <= 768 ? '#f9f9f9' : 'transparent',
          maxHeight: window.innerWidth <= 768 ? '400px' : 'calc(100vh - 200px)'
        }}>
          <h3>📄 รายละเอียด</h3>
          <div id="item-detail">
            {selectedRecurring && typeof selectedRecurring === 'object' && selectedRecurring.id ? (
              <div style={{ marginTop: 16, background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #eee' }}>
                <h5>รายละเอียด Recurring</h5>
                {selectedRecurring.item && <p><b>รายการ:</b> {selectedRecurring.item}</p>}
                {selectedRecurring.amount && <p><b>ยอดชำระ:</b> {selectedRecurring.amount} บาท</p>}
                {selectedRecurring.nextDate && <p><b>วันที่ถัดไป:</b> {selectedRecurring.nextDate.toDate ? selectedRecurring.nextDate.toDate().toISOString().slice(0,10) : (typeof selectedRecurring.nextDate === 'string' ? selectedRecurring.nextDate : '')}</p>}
                {selectedRecurring.frequency && <p><b>ความถี่:</b> {selectedRecurring.frequency} {selectedRecurring.frequencyUnit}</p>}
                {selectedRecurring.bank && <p><b>ธนาคาร:</b> {selectedRecurring.bank}</p>}
                {selectedRecurring.accountName && <p><b>บัญชี:</b> {selectedRecurring.accountName} {selectedRecurring.accountNumber && `(${selectedRecurring.accountNumber})`}</p>}
                {selectedRecurring.employee && <p><b>พนักงาน:</b> {selectedRecurring.employee} {selectedRecurring.role && `(${selectedRecurring.role})`}</p>}
                {selectedRecurring.status && <p><b>สถานะ:</b> {selectedRecurring.status}</p>}
              </div>
            ) : selectedExpense ? (
              <div>
                {selectedExpense.item && <p><b>รายการ:</b> {selectedExpense.item}</p>}
                {selectedExpense.date && <p><b>วันที่:</b> {selectedExpense.date && selectedExpense.date.toDate ? selectedExpense.date.toDate().toLocaleString() : selectedExpense.date}</p>}
                {selectedExpense.nextDate && <p><b>วันที่ถัดไป:</b> {selectedExpense.nextDate.toDate ? selectedExpense.nextDate.toDate().toISOString().slice(0,10) : (typeof selectedExpense.nextDate === 'string' ? selectedExpense.nextDate : '')}</p>}
                {selectedExpense.createdAt && <p><b>เพิ่มเมื่อ:</b> {selectedExpense.createdAt.toDate ? selectedExpense.createdAt.toDate().toLocaleString() : selectedExpense.createdAt.toString()}</p>}
                {selectedExpense.amount && <p><b>ยอดชำระ:</b> {selectedExpense.amount} บาท</p>}
                {selectedExpense.bank && <p><b>ธนาคาร:</b> {selectedExpense.bank}</p>}
                {selectedExpense.accountName && <p><b>บัญชี:</b> {selectedExpense.accountName} {selectedExpense.accountNumber && `(${selectedExpense.accountNumber})`}</p>}
                {selectedExpense.employee && <p><b>พนักงาน:</b> {selectedExpense.employee} {selectedExpense.role && `(${selectedExpense.role})`}</p>}
                {selectedExpense.status && <p><b>สถานะ:</b> {selectedExpense.status}</p>}
                {selectedExpense.completeness && <p><b>ความเรียบร้อย:</b> {selectedExpense.completeness}</p>}
                {selectedExpense.note && <p><b>หมายเหตุ:</b> {selectedExpense.note}</p>}
                {selectedExpense.checkimgUrl && (
                  <div>
                    <b>รูปภาพ(หลักฐานการชำระจากทางบริษัท):</b><br />
                    <img
                      src={selectedExpense.checkimgUrl}
                      alt="Check Img"
                      style={{ maxWidth: "100%", maxHeight: 300, border: "1px solid #ccc", marginTop: 10, cursor: "pointer" }}
                      onClick={() => handleLightboxOpen(selectedExpense.checkimgUrl)}
                    />
                  </div>
                )} 
                {selectedExpense.checkpdfUrl && (
                  <div style={{ marginTop: 10 }}>
                    <b>ไฟล์(หลักฐานการชำระจากทางบริษัท (PDF)):</b><br />
                    <a href={selectedExpense.checkpdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary">📄 เปิดไฟล์ PDF</a>
                  </div>
                )}
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
                {/* Approve Button for adminleader only when status is 'รอทำเบิก' or 'โอนชำระโดยพนักงาน' */}
                {user?.role === "adminleader" && ["รอทำเบิก", "โอนชำระโดยพนักงาน"].includes(selectedExpense.status) && (
                  <div style={{ marginTop: 20 }}>
                    <button className="btn btn-success me-2" onClick={() => {
                      navigate(`/form?id=${selectedExpense.id}`);
                    }}>อนุมัติ</button>
                  </div>
                )}
                
                {/* Edit Button for admin only when status is 'รอทำเบิก' or 'โอนชำระโดยพนักงาน' */}
                {user?.role === "admin" && ["รอทำเบิก", "โอนชำระโดยพนักงาน"].includes(selectedExpense.status) && (
                  <div style={{ marginTop: 20 }}>
                    <button className="btn btn-warning me-2" onClick={() => {
                      navigate(`/form?id=${selectedExpense.id}&edit=true`);
                    }}>✏️ แก้ไขรายการ</button>
                  </div>
                )}
                {/* Cancel Button for adminleader, accountor, hr, vj (ยกเลิก) */}
                {["adminleader", "accountor", "hr", "vj"].includes(user?.role) && selectedExpense.status !== "อนุมัติ" && selectedExpense.status !== "ยกเลิก" && (
                  <div style={{ marginTop: 20 }}>
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
                
                {/* Send to Customer Button for Accountor */}
                {user?.role === "accountor" && selectedExpense.status === "ตรวจสอบแล้ว" && (
                  <div style={{ marginTop: 20 }}>
                    <button className="btn btn-primary" onClick={async () => {
                      if (!window.confirm("ยืนยันการส่งให้คู่ค้า?")) return;
                      try {
                        const updatePayload = { status: "ส่งให้คู่ค้าแล้ว" };
                        Object.keys(updatePayload).forEach(key => {
                          if (updatePayload[key] === undefined) delete updatePayload[key];
                        });
                        await updateDoc(doc(db, "expenses", selectedExpense.id), updatePayload);
                        setSelectedExpense({ ...selectedExpense, status: "ส่งให้คู่ค้าแล้ว" });
                        setExpenses(expenses.map(e => e.id === selectedExpense.id ? { ...e, status: "ส่งให้คู่ค้าแล้ว" } : e));
                      } catch (err) {
                        alert("เกิดข้อผิดพลาดในการส่งให้คู่ค้า: " + err.message);
                      }
                    }}>📤 ส่งให้คู่ค้า</button>
                  </div>
                )}
                {/* ตรวจสอบ Button for accountor only when status is 'หัวหน้าอนุมัติ' */}
                {user?.role === "accountor" && selectedExpense.status === "หัวหน้าอนุมัติ" && (
                  <div style={{ marginTop: 20 }}>
                    <button className="btn btn-warning" onClick={() => {
                      navigate(`/checkform?id=${selectedExpense.id}`);
                    }}>ตรวจสอบ</button>
                  </div>
                )}
              </div>
            ) : (
              <div>กรุณาเลือกรายการด้านซ้าย</div>
            )}
          </div>

          {/* Lightbox */}
          {lightboxImg && (
            <div className="lightbox" onClick={handleLightboxClose} style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.9)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              padding: window.innerWidth <= 768 ? '10px' : '20px'
            }}>
              <img 
                src={lightboxImg} 
                alt="Full" 
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard; 