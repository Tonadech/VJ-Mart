import React, { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Reset.css";

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

function Reset() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');
    if (!oobCode) {
      setError("ลิงก์ไม่ถูกต้อง กรุณาขอลิงก์ใหม่");
      setVerifying(false);
      return;
    }

    // ตรวจสอบ action code
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setEmail(email);
        setVerifying(false);
      })
      .catch((err) => {
        setError("ลิงก์หมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่");
        setVerifying(false);
      });
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    
    if (password !== confirm) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      const oobCode = searchParams.get('oobCode');
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess("รีเซ็ตรหัสผ่านสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...");
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      if (err.code === 'auth/weak-password') {
        setError("รหัสผ่านอ่อนเกินไป กรุณาใช้รหัสผ่านที่แข็งแกร่งกว่า");
      } else if (err.code === 'auth/invalid-action-code') {
        setError("ลิงก์หมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่");
      } else {
        setError("เกิดข้อผิดพลาด: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <section className="h-100">
        <div className="container h-100">
          <div className="row justify-content-sm-center h-100">
            <div className="col-xxl-4 col-xl-5 col-lg-5 col-md-7 col-sm-9">
              <div className="text-center my-5">
                <img src="/logo192.png" alt="VJ Mart Logo" width="100" />
              </div>
              <div className="card shadow-lg">
                <div className="card-body p-5 text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">กำลังโหลด...</span>
                  </div>
                  <p className="mt-3">กำลังตรวจสอบลิงก์...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="h-100">
      <div className="container h-100">
        <div className="row justify-content-sm-center h-100">
          <div className="col-xxl-4 col-xl-5 col-lg-5 col-md-7 col-sm-9">
            <div className="text-center my-5">
              <img src="/logo192.png" alt="VJ Mart Logo" width="100" />
            </div>
            <div className="card shadow-lg">
              <div className="card-body p-5">
                <h1 className="fs-4 card-title fw-bold mb-4">รีเซ็ตรหัสผ่าน</h1>
                {email && (
                  <div className="alert alert-info">
                    <strong>อีเมล:</strong> {email}
                  </div>
                )}
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                <form className="needs-validation" noValidate autoComplete="off" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="mb-2 text-muted" htmlFor="password">รหัสผ่านใหม่</label>
                    <input 
                      id="password" 
                      type="password" 
                      className="form-control" 
                      name="password" 
                      required 
                      autoFocus 
                      value={password} 
                      onChange={e => setPassword(e.target.value)}
                      minLength="6"
                    />
                    <div className="form-text">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</div>
                  </div>
                  <div className="mb-3">
                    <label className="mb-2 text-muted" htmlFor="password-confirm">ยืนยันรหัสผ่านใหม่</label>
                    <input 
                      id="password-confirm" 
                      type="password" 
                      className="form-control" 
                      name="password_confirm" 
                      required 
                      value={confirm} 
                      onChange={e => setConfirm(e.target.value)}
                    />
                  </div>
                  <div className="d-flex align-items-center">
                    <button type="submit" className="btn btn-primary ms-auto" disabled={loading}>
                      {loading ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
                    </button>
                  </div>
                </form>
              </div>
              <div className="card-footer py-3 border-0">
                <div className="text-center">
                  <a href="/forgot" className="text-dark">ขอลิงก์ใหม่</a> | <a href="/" className="text-dark">กลับไปหน้าเข้าสู่ระบบ</a>
                </div>
              </div>
            </div>
            <div className="text-center mt-5 text-muted">
              Copyright &copy; 2024 &mdash; VJ Mart
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Reset; 