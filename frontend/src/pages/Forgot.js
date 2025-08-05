import React, { useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import "./Forgot.css";

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

function Forgot() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/reset',
        handleCodeInApp: true
      });
      setSuccess("ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว! กรุณาตรวจสอบอีเมล (รวมถึง Spam/Junk folder) และคลิกลิงก์เพื่อรีเซ็ตรหัสผ่าน");
      console.log("Password reset email sent to:", email);
    } catch (err) {
      console.error("Password reset error:", err);
      if (err.code === 'auth/user-not-found') {
        setError("ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีเมลอีกครั้ง");
      } else if (err.code === 'auth/invalid-email') {
        setError("รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีเมลอีกครั้ง");
      } else if (err.code === 'auth/too-many-requests') {
        setError("มีการขอรีเซ็ตรหัสผ่านบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่");
      } else {
        setError("เกิดข้อผิดพลาด: " + err.message + " (Code: " + err.code + ")");
      }
    } finally {
      setLoading(false);
    }
  };

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
                <h1 className="fs-4 card-title fw-bold mb-4">ลืมรหัสผ่าน</h1>
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="alert alert-info">
                  <strong>หมายเหตุ:</strong> หากไม่ได้รับอีเมล กรุณาตรวจสอบ:
                  <ul className="mb-0 mt-2">
                    <li>Spam/Junk folder</li>
                    <li>อีเมลที่ใช้ต้องเป็นอีเมลที่ลงทะเบียนในระบบ</li>
                    <li>ตรวจสอบการตั้งค่า Firewall หรือ Antivirus</li>
                  </ul>
                </div>
                <form className="needs-validation" noValidate autoComplete="off" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="mb-2 text-muted" htmlFor="email">อีเมล</label>
                    <input id="email" type="email" className="form-control" name="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)} />
                    <div className="invalid-feedback">
                      กรุณากรอกอีเมลที่ถูกต้อง
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <button type="submit" className="btn btn-primary ms-auto" disabled={loading}>
                      {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
                    </button>
                  </div>
                </form>
              </div>
              <div className="card-footer py-3 border-0">
                <div className="text-center">
                  จำรหัสผ่านได้แล้ว? <a href="/" className="text-dark">เข้าสู่ระบบ</a>
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

export default Forgot; 