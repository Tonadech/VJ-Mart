import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

// Firebase config (move to a separate file in a real app)
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

function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential || !userCredential.user) {
        throw new Error("ไม่สามารถเข้าสู่ระบบได้: userCredential ว่างเปล่า");
      }
      const uid = userCredential.user.uid;
      const userDocRef = doc(db, "users", uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const { role, name, adminleader, division, company } = data;
        localStorage.setItem("user", JSON.stringify({ uid, name, role, adminleader, division, company }));
        // Redirect based on role
        if (role === "vj" || role === "hr") {
          window.location.href = "/test";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setError("ไม่พบข้อมูลผู้ใช้ในระบบ");
      }
    } catch (err) {
      setError("เข้าสู่ระบบล้มเหลว: " + err.message);
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
              <img src="https://getbootstrap.com/docs/5.0/assets/brand/bootstrap-logo.svg" alt="logo" width="100" />
            </div>
            <div className="card shadow-lg">
              <div className="card-body p-5">
                <h1 className="fs-4 card-title fw-bold mb-4">Login</h1>
                {error && <div className="alert alert-danger">{error}</div>}
                <form className="needs-validation" noValidate autoComplete="off" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="mb-2 text-muted" htmlFor="email">E-Mail Address</label>
                    <input id="email" type="email" className="form-control" name="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)} />
                    <div className="invalid-feedback">
                      Email is invalid
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="mb-2 w-100">
                      <label className="text-muted" htmlFor="password">Password</label>
                      <a href="/forgot" className="float-end">
                        Forgot Password?
                      </a>
                    </div>
                    <input id="password" type="password" className="form-control" name="password" required value={password} onChange={e => setPassword(e.target.value)} />
                    <div className="invalid-feedback">
                      Password is required
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="form-check">
                      <input type="checkbox" name="remember" id="remember" className="form-check-input" />
                      <label htmlFor="remember" className="form-check-label">Remember Me</label>
                    </div>
                    <button type="submit" className="btn btn-primary ms-auto" disabled={loading}>
                      {loading ? "Logging in..." : "Login"}
                    </button>
                  </div>
                </form>
              </div>
              <div className="card-footer py-3 border-0">
                <div className="text-center">
                  Don't have an account? <a href="/register" className="text-dark">Create One</a>
                </div>
              </div>
            </div>
            <div className="text-center mt-5 text-muted">
              Copyright &copy; 2017-2021 &mdash; Your Company
              {/* <button onClick={createTestUser}>สร้างผู้ใช้ตัวอย่าง</button> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home; 