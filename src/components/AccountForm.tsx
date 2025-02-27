"use client";
import { useState } from "react";
import { useUser } from "../hooks/useUser";
import Avatar from "./Avatar";

export default function AccountForm() {
  const {
    user,
    fullName,
    setFullName,
    amountHours,
    updateProfile,
    showConfirmAlert,
    setShowConfirmAlert,
  } = useUser();

  const [isEditMode, setIsEditMode] = useState(false);

  const [loading, setLoading] = useState(false);

  return (
    <>
      { /* Edit toggle */ }
      <div className="container mx-auto flex-col h-full">
        <div className="flex flex-row items-center justify-between my-4">
          <h5 className="card-title items-center">Benvenuto</h5>
          <div className="flex items-center gap-2">
            <label
              className="label label-text text-base mt-1"
              htmlFor="switchType2">
              Modifica profilo
            </label>
            <input
              type="checkbox"
              className="switch switch-primary mt-1"
              id="switchType2"
              checked={isEditMode}
              onChange={(e) => setIsEditMode(e.target.checked)}
            />
          </div>
        </div>

        {/* Confirmation alert */}
        {showConfirmAlert ? (
          
          <div className="card removing:opacity-0 bg-primary/20 text-primary transition duration-300 ease-in-out my-4">
            <div
              style={{
                padding: "0.2rem 1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
              <p>
                <span
                  style={{
                    lineHeight: "38px",
                    color: "white",
                  }}>
                  Profilo aggiornato!{" "}
                </span>
              </p>
              <button
                style={{ marginTop: "0rem", marginLeft: "1rem" }}
                aria-label="Close Button"
                className={"btn btn-sm btn-primary"}
                onClick={() => setShowConfirmAlert(false)}>
                <span className="color: primary">Chiudi</span>
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 justify-between">
          {/* Card 1 */}
          <Avatar size={75} editMode={isEditMode} />
          {/* Card 2 */}
          <div className="card md:max-w-md">
            <div className="card-body flex justify-start">
              <h5 className="card-title mb-4 flex flex-row items-center justify-between">
                Dati utente
                <span className="badge badge-secondary size-8 p-0 mr-2">
                  <span className="icon-[tabler--user-circle] size-5" />
                </span>
              </h5>
              <div className="h-[150px] mbnpm run -auto">
                <label className="mt-1" htmlFor="fullName">
                  Email
                </label>
                <input
                  className="input"
                  id="email"
                  type="text"
                  value={user?.email}
                  disabled
                />
                <div className="mt-4">
                  <label className="mt-1" htmlFor="fullName">
                    Nome Completo
                  </label>
                  <input
                    className="input mb-4"
                    id="fullName"
                    type="text"
                    value={fullName || ""}
                    disabled={!isEditMode}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
              {isEditMode ? (
                <div className="mt-auto">
                  <button
                    className="btn btn-primary"
                    onClick={() => updateProfile({ fullname: fullName })}
                    disabled={loading}>
                    {loading ? "Salva Profilo" : "Salva Profilo"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          {/* Card 3 */}
          <div className="card md:max-w-md">
            <div className="card-body">
              <h5 className="card-title mb-4 flex flex-row items-center justify-between">
                Totale Ore
                <span className="badge badge-accent size-8 p-0 mr-2">
                  <span className="icon-[tabler--clock] size-5" />
                </span>
              </h5>
              <h5 className="card-title text-4xl mb-2.5">{amountHours} ore</h5>
              <p className="mb-4">
                Descrive il numero totale di ore fatte/fatturate
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="container w-[100%] flex flex-row">
        <iframe
          id="edoobox_sgl"
          style={{ width: "40%", border: "none", height: "643px" }}
          src="https://app1.edoobox.com/sgl/Beispiel%20Kategorie%20A?edref=sgl"
          name="edooboxFrame_sgl"
          frameBorder="0"
          data-scrolltop=""></iframe>
        <iframe
          id="edoobox_sgl"
          src="https://iframe.vku-pgs.asa.ch/it/public/coursegroup/all/VktVXzQxMzQ=/1/vku/"
          style={{ width: "60%", border: "none", height: "643px" }}>
          Übersicht anzeigen
        </iframe>
        <iframe
          id="teal-job-tracker-iframe-stable"
          style={{
            background: "rgb(255, 255, 255) !important",
            width: "40px !important, height: 100vh !important",
            inset: "0px auto auto !important",
            zIndex: "2147483647 !important",
            border: "0px !important",
            boxShadow: "rgba(0, 0, 0, 0.25) 0px 0px 16px -3px !important",
            transition: "right 0.25s",
          }}></iframe>
      </div> */}
    </>
  );
}
