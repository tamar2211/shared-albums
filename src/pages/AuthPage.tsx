import { Link } from "react-router";
import { useState } from "react";
import RegisterForm from "../components/Auth/RegisterForm";
import LoginForm from "../components/Auth/LoginForm";

function AuthPage() {
  const [mode, setMode] = useState<"register" | "login">("login");
  const isLogin = mode === "login";

  return (
    <>
      <p>דף התחברות והרשמה</p>
      <Link to="/">חזרה לדף הבית</Link>

      <div className="auth-toggle">
        <button
          type="button"
          className={isLogin ? "active" : ""}
          onClick={() => setMode("login")}
        >
          התחברות
        </button>
        <button
          type="button"
          className={!isLogin ? "active" : ""}
          onClick={() => setMode("register")}
        >
          הרשמה
        </button>
      </div>

      {isLogin ? <LoginForm /> : <RegisterForm />}

      <p>
        {isLogin ? "אין לך חשבון? " : "כבר יש לך חשבון? "}
        <button
          type="button"
          className="link-button"
          onClick={() => setMode(isLogin ? "register" : "login")}
        >
          {isLogin ? "להרשמה" : "להתחברות"}
        </button>
      </p>
    </>
  );
}

export default AuthPage;