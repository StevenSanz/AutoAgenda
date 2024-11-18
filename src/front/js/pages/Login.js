import React, { useContext, useState } from "react";
import "../../styles/login.css";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import ForgotPasswordModal from "../component/ForgotPasswordModal";

const Login = () => {
  const { store, actions } = useContext(Context);
  const darkMode = store.darkMode;
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

  const handleForgotPasswordModalOpen = () => {
    setIsForgotPasswordModalOpen(false);
    setTimeout(() => {
      setIsForgotPasswordModalOpen(true);
    }, 0);
  };

  const handleForgotPasswordModalClose = () => {
    setIsForgotPasswordModalOpen(false);
  };

  async function submitForm(event) {
    event.preventDefault();
    let formData = new FormData(event.target);
    let email = formData.get("inputEmail");
    let password = formData.get("inputPassword");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    setError(null);

    try {
      let response = await actions.login(email, password);
      
      if (response.success) {
        const roleId = localStorage.getItem("role_id");
        if (roleId == 1) {
          navigate("/admindashboard");
        } else if (roleId == 2) {
          navigate("/mechanicdashboard");
        } else if (roleId == 3) {
          navigate("/userdashboard");
        }
      } else {
        setError(response.message || "Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Error al hacer login:", error);
      setError("An error occurred while trying to log in. Please try again later.");
    }
  }

  return (
    <div
      id="content"
      className={`d-flex justify-content-center align-items-center min-vh-100 ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}
    >
      <div className="col-md-5">
        <div className={`card ${darkMode ? "bg-secondary text-light" : ""}`}>
          <div className="card-header">
            <strong>Login to your account</strong>
          </div>
          <div className="card-body">
            <form onSubmit={submitForm}>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="form-group">
                <label
                className={`form-label ${darkMode ? "text-light" : "text-muted"}`}
                htmlFor="inputEmail"
                >
                  Email address
                </label>
                <input
                  name="inputEmail"
                  type="email"
                  className={`form-control ${darkMode ? "bg-dark text-light border-light" : ""}`}
                  id="InputEmail1"
                  aria-describedby="emailHelp"
                  placeholder="Enter email"
                />
                <small id="passwordHelp" className={`form-text ${darkMode ? "text-light" : "text-muted"}`}>
                  We don't share email with anyone
                </small>
              </div>
              <div className="form-group">
                <label
                className={`form-label ${darkMode ? "text-light" : "text-muted"}`}
                htmlFor="inputPassword"
                >
                  Password
                </label>
                <input
                  name="inputPassword"
                  type="password"
                  className={`form-control ${darkMode ? "bg-dark text-light border-light" : ""}`}
                  id="inputPassword"
                  placeholder="Password"
                />
                <small id="emailHelp" className={`form-text ${darkMode ? "text-light" : "text-muted"}`}>
                  Your password is saved in encrypted form
                </small>
              </div>
              <div className="form-group mt-2">
                <span
                  className="text-primary"
                  role="button"
                  onClick={handleForgotPasswordModalOpen}
                >
                  Forgot your password?
                </span>
              </div>
              <button
                type="submit"
                className={`btn btn-${darkMode ? "light" : "primary"} mt-3`}
                style={{
                  border: darkMode ? "1px solid #fff" : "none",
                  boxShadow: darkMode ? "0px 0px 10px 2px #fff" : "none",
                  color: "#fff", 
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={handleForgotPasswordModalClose}
      />
    </div>
  );
};

export default Login;
