import React, { useState, useContext, useEffect } from "react";
import UserList from "../component/UserList";
import UserProfileModal from "../component/UserProfileModal";
import SettingModal from "../component/SettingModal";
import iconUser from "../../img/icons/icon-user.png";
import iconComments from "../../img/icons/icon-comments.png";
import iconConnect from "../../img/icons/icon-connect.png";
import iconFavorites from "../../img/icons/icon-favorites.png";
import iconBriefcase from "../../img/icons/icon-briefcase.png";
import "../../styles/admindashboard.css";
import { Context } from "../store/appContext";

const AdminDashboard = () => {
  const { store, actions } = useContext(Context);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [maxAppointmentsPerHour, setMaxAppointmentsPerHour] = useState(null);
  const [clientCount, setClientCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);
  const [carsCount, setCarsCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const apiUrl = process.env.BACKEND_URL + "/api";
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [profile, setProfile] = useState({
    email: "",
    password: "********",
  });

  const handleSettingModalOpen = () => {
    setIsSettingModalOpen(true);
  };

  const handleSettingModalClose = (updatedValue) => {
    if (updatedValue && updatedValue > 0) {
      setMaxAppointmentsPerHour(updatedValue);
      setStatusMessage("Settings updated successfully");
      handleSaveSchedule(); // Llamar a la función de guardado aquí
    }
    setIsSettingModalOpen(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const roleId = localStorage.getItem("role_id");
    const userId = localStorage.getItem("user_id");

    setHasAccess(!!token && roleId === "1");

    if (token && roleId === "1" && userId) {
      const loadProfile = async () => {
        try {
          const response = await fetch(`${apiUrl}/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              ...store.corsEnabled // Deshabilitar una vez en producción
            },
          });

          if (!response.ok) {
            console.error("Failed to fetch profile");
          } else {
            const data = await response.json();
            setProfile({
              name: data.result.name,
              email: data.result.email,
              password: "********",
            });
          }
        } catch (error) {
          console.error("Error loading profile:", error);
        }
      };
      loadProfile();

      const totalCount = async () => {
        try {
          const response = await fetch(`${apiUrl}/totalcount`, {
            headers: {
              Authorization: `Bearer ${token}`,
              ...store.corsEnabled // Deshabilitar una vez en producción
            },
          });
          if (!response.ok) {
            return false;
          } else {
            const data = await response.json();
            const clientCount = data.total_clients;
            const appointmentsCount = data.total_appointments;
            const servicesCount = data.total_services;
            const carsCount = data.total_cars;
            return { clientCount, appointmentsCount, servicesCount, carsCount };
          }
        } catch (error) {
          console.error("Error loading counters:", error);
        }
      };
      totalCount();

      const totalCounters = async () => {
        const counts = await totalCount();
        if (counts) {
          setClientCount(counts.clientCount);
          setAppointmentsCount(counts.appointmentsCount);
          setServicesCount(counts.servicesCount);
          setCarsCount(counts.carsCount);
        } else {
          return false
        }
      };
      totalCounters();

      const loadSetting = async () => {
        try {
          const response = await fetch(`${apiUrl}/settings`, {
            headers: {
              Authorization: `Bearer ${token}`,
              ...store.corsEnabled // Deshabilitar una vez en producción
            },
          });
          if (!response.ok) {
            return false;
          } else {
            const data = await response.json();
            setMaxAppointmentsPerHour(data.max_appointments_per_hour);
            setOpeningTime(data.opening_time || "");  // Cargar horario de apertura
            setClosingTime(data.closing_time || "");  // Cargar horario de cierre
          }
        } catch (error) {
          console.error("Error loading setting:", error);
        }
      };
      loadSetting();
    }
  }, [store.token, store.setting]);

  const handleProfileModalOpen = () => {
    setIsProfileModalOpen(true);
  };

  const handleProfileModalClose = (updatedProfile) => {
    if (updatedProfile) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        email: updatedProfile.email,
        // name: updatedProfile.name,
      }));
      setStatusMessage("Profile updated successfully");
    }
    setIsProfileModalOpen(false);
  };

  // Función para guardar los horarios de apertura y cierre
  const handleSaveSchedule = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          opening_time: openingTime,
          closing_time: closingTime,
          max_appointments_per_hour: maxAppointmentsPerHour, // Si es necesario enviar también otros ajustes
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update schedule");
      }

      const data = await response.json();
      setStatusMessage("Schedule updated successfully");
    } catch (error) {
      console.error("Error updating schedule:", error);
      setStatusMessage("Failed to update schedule");
    }
  };

  const saveProfile = async (updatedProfile) => {
    try {
      const result = await actions.saveProfile(updatedProfile);
      if (result.success) {
        setProfile((prevProfile) => ({
          ...prevProfile,
          email: updatedProfile.email,
          // name: updatedProfile.name,
        }));
        setStatusMessage("Profile updated successfully");
        setIsProfileModalOpen(false);
      } else {
        alert("Error updating profile: " + result.error.message);
      }
    } catch (error) {
      alert("An error occurred: " + error.message);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column dashboard">
        <h1>Admin Dashboard</h1>
        {!hasAccess ? (
          <div className="card p-5">
            <div className="card-body mx-auto">
              <h2 className="card-title">
                You do not have access to this section
              </h2>
              <p className="card-text mt-3">
                You must log in as a registered Admin to view the content of
                this page.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="stats row">
              <div className="stat1 col mx-2">
                <img src={iconUser} alt="Total Clients" />
                <h3>Total Clients</h3>
                <p>{clientCount}</p>
              </div>
              <div className="stat2 col mx-2">
                <img src={iconComments} alt="Total Appointments" />
                <h3>Total Appointments</h3>
                <p>{appointmentsCount}</p>
              </div>
              <div className="stat3 col mx-2">
                <img src={iconBriefcase} alt="Total Services" />
                <h3>Total Services</h3>
                <p>{servicesCount}</p>
              </div>
              <div className="stat4 col mx-2">
                <img src={iconFavorites} alt="Total Cars" />
                <h3>Total Cars</h3>
                <p>{carsCount}</p>
              </div>
              <div className="stat5 col mx-2">
                <img src={iconConnect} alt="Settings" />
                <h3>Settings</h3>
                <p>Max Appointments per Hour: {maxAppointmentsPerHour}</p>
                <button
                  className="btn btn-secondary btnSetting"
                  onClick={handleSettingModalOpen}
                >
                  Edit
                </button>
              </div>
              <div className="stat5 col mx-2">
                <img src={iconConnect} alt="Profile" />
                <h3>Profile</h3>
                <div>
                  <p>Email: {profile.email}</p>
                </div>
                <button
                  className="btn btn-secondary btnSetting"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Nueva sección para los horarios */}
            <div className="schedule-section mt-4">
              <h3>Opening and Closing Time</h3>
              <div className="row">
                <div className="col">
                  <label>Opening Time:</label>
                  <input
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                  />
                </div>
                <div className="col">
                  <label>Closing Time:</label>
                  <input
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                  />
                </div>
              </div>
              <button
                className="btn btn-primary mt-3"
                onClick={handleSaveSchedule}
              >
                Save Schedule
              </button>
            </div>

            <UserList />

            {statusMessage && (
              <div className="alert alert-success mt-3">{statusMessage}</div>
            )}
          </>
        )}
        {isSettingModalOpen && (
          <SettingModal
            onClose={handleSettingModalClose}
            onSave={(value) => {
              setMaxAppointmentsPerHour(value);
              setStatusMessage("Settings updated successfully");
              handleSaveSchedule(); // Asegúrate de guardar cuando se cierre el modal
            }}
            currentValue={maxAppointmentsPerHour}
          />
        )}
        {isProfileModalOpen && (
          <UserProfileModal
            user={profile}
            onSave={saveProfile}
            onClose={() => setIsProfileModalOpen(false)}
            error={statusMessage}
            isAdmin={true}
          />
        )}
        {statusMessage && (
          <div className="alert alert-success mt-3">{statusMessage}</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
