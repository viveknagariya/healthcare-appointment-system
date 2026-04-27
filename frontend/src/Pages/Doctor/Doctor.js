import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Doctor/Doctor.css";
import { Link } from "react-router-dom";
import { Search, Clock, GraduationCap, MapPin, SearchX } from "lucide-react";

import femaleDoctor from "../../images/femaledoctor.png";
import maleDoctor from "../../images/maledoctor.png";

const Doctor = () => {
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/doctors/all?summary=1",
      );

      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching doctors", err);
      setDoctors([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.fullName.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(search.toLowerCase());

    const matchesShift =
      filter === "all" || doc.shift.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesShift;
  });

  return (
    <div className="dr-v6-body-wrapper">
      <div className="dr-v6-main-container">
        <div className="dr-v6-header">
          <div className="dr-v6-header-left">
            <h1 className="dr-v6-page-title">Our Specialists</h1>
            <p className="dr-v6-page-subtitle">
              Find the best doctors for your healthcare needs.
            </p>
          </div>

          <div className="dr-v6-search-box-wrap">
            <div className="dr-v6-search-container">
              <Search className="dr-v6-search-icon-inside" size={20} />
              <input
                type="text"
                placeholder="Search by name or speciality..."
                className="dr-v6-search-input-oval"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="dr-v6-filter-bar">
          <button
            className={`dr-v6-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Doctors
          </button>

          <button
            className={`dr-v6-filter-btn ${filter === "day" ? "active" : ""}`}
            onClick={() => setFilter("day")}
          >
            Day Shift
          </button>

          <button
            className={`dr-v6-filter-btn ${filter === "night" ? "active" : ""}`}
            onClick={() => setFilter("night")}
          >
            Night Shift
          </button>
        </div>

        <div className="dr-v6-content-grid-area">
          {loading ? (
            <div className="dr-v6-loading-state">
              <div className="dr-v6-spinner"></div>
              <p>Fetching specialists...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="dr-v6-no-data">
              <div className="dr-v6-no-data-inner">
                <SearchX size={60} className="dr-v6-no-data-icon" />
                <h3>No doctors found</h3>
                <p>Try adjusting your search or filters.</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  className="dr-v6-clear-search-btn"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="dr-v6-doctors-grid">
              {filteredDoctors.map((doc) => (
                <div className="dr-v6-doctor-card" key={doc._id}>
                  <div className="dr-v6-doctor-image">
                    <img
                      src={
                        doc.image && doc.image !== ""
                          ? `http://localhost:5000/${doc.image.replace(/\\/g, "/")}`
                          : doc.gender === "Female"
                            ? femaleDoctor
                            : maleDoctor
                      }
                      alt={doc.fullName || "Doctor Image"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "top",
                        display: "block",
                      }}
                    />
                  </div>

                  <div className="dr-v6-doctor-details">
                    <h2 className="dr-v6-doc-name">{doc.fullName}</h2>
                    <p className="dr-v6-doc-specialization">
                      {doc.specialization}
                    </p>

                    <div className="dr-v6-meta-info-rows">
                      <div className="dr-v6-meta-row">
                        <Clock size={16} />{" "}
                        <span>
                          {doc.experienceYears || "0"} Years Experience
                        </span>
                      </div>
                      <div className="dr-v6-meta-row dr-v6-meta-bold">
                        <GraduationCap size={16} />
                        <span>{doc.degree || "MBBS"}</span>
                      </div>
                      <div className="dr-v6-meta-row">
                        <MapPin size={16} />
                        <span>{doc.state || "Gujarat"}</span>
                      </div>
                    </div>

                    <Link to="/login" className="dr-v6-appointment-btn">
                      Book My Appointment
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctor;
