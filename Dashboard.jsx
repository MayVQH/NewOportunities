import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom"; 
import "../Styles/Dashboard.css"

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading,setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
        const userData = sessionStorage.getItem("user");
        if (!userData){
            navigate("/")
            return;
        }
        setUser(JSON.parse(userData));
        setLoading(false)

        const handleMessage = (event) => {
            if (event.origin === 'http://localhost:3000' && event.data.user){
                sessionStorage.setItem("user", JSON.stringify(event.data.user));
                setUser(event.data.user);
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message",handleMessage);
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem("user");
        navigate("/");
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      };

    const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    navigate("/preguntas-clave", { state: { selectedDate: newDate } });
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        
        const weeks = [];
        let days = [];
        
        // Previous month's days
        for (let i = firstDay - 1; i >= 0; i--) {
          days.push(
            <div key={`prev-${i}`} className="calendar-day inactive">
              {daysInPrevMonth - i}
            </div>
          );
        }

        // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate();
      const isSelected = selectedDate.getDate() === day && 
                         selectedDate.getMonth() === month && 
                         selectedDate.getFullYear() === year;
      
      days.push(
        <div 
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      );

      if (days.length === 7 || day === daysInMonth) {
        weeks.push(<div key={`week-${day}`} className="calendar-week">{days}</div>);
        days = [];
      }
    }
    
    // Next month's days
    if (days.length > 0) {
      const daysNeeded = 7 - days.length;
      for (let i = 1; i <= daysNeeded; i++) {
        days.push(
          <div key={`next-${i}`} className="calendar-day inactive">
            {i}
          </div>
        );
      }
      weeks.push(<div key={`week-end`} className="calendar-week">{days}</div>);
    }
    
    return weeks;
  };


    if (loading){
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

  return (
    <div className="dashboard-container">
        <nav className="dashboard-nav">
            <div className="nav-user-profile">
                <img src={user.photo} alt={user.displayName} className="user-avatar"
                     onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=0078d4&color=fff`;
                     }}
                />
                <span className="user-name">{user.displayName}</span>
            </div>
            <div className="nav-menu">
                <span className="preguntaClave" onClick={() => navigate("/preguntas-clave")}>Preguntas Clave</span>
                <span className="temas" onClick={() => navigate("/temas")}>Temas</span>
                <span className="enrolamiento" onClick={() => navigate("/enrolamiento")}>Enrolamiento</span>
                <span className="dashboard" onClick={() => navigate("/dashboard")}>Dashboard</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">Sign out</button>
        </nav>
        <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="calendar-container">
            <div className="calendar-header">
              <button onClick={handlePrevMonth} className="calendar-nav">&lt;</button>
              <h3>
                {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
              </h3>
              <button onClick={handleNextMonth} className="calendar-nav">&gt;</button>
            </div>
            <div className="calendar-weekdays">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>
            <div className="calendar-days">
              {renderCalendar()}
            </div>
          </div>
          <div className="main-content">
            <Outlet />
          </div>
        </div>
        </main>
    </div>
  );
};

export default Dashboard;