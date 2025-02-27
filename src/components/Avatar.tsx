"use client";
import { useState } from "react";
import { useUser } from "../hooks/useUser";

export default function Avatar({
  size,
  editMode,
  navbar,
  sourceUrl
}: {
  size: number;
  editMode?: boolean;
  navbar?: boolean;
  sourceUrl?: string;
}) {
  const { avatarUrl, uploadImage } = useUser();
  const [uploading, setUploading] = useState(false);

  // Render logic remains the same
  if (navbar && !avatarUrl) {
    return (
      <div className="avatar placeholder">
        <div className="bg-neutral text-neutral-content w-28 rounded-full mb-4">
          <span className="icon-[tabler--user] size-6"></span>
        </div>
      </div>
    );
  }

  if (sourceUrl) {
    return (
      <div className="card sm:max-w-sm">
        <div className="card-body flex justify-start">
          <h5 className="card-title mb-4">Immagine profilo</h5>
          <div className="h-[150px]">
            {sourceUrl ? (
              <img
                src={sourceUrl}
                alt="Avatar"
                className="w-28 rounded-full mb-4 mt-2"
              />
            ) : (
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content w-16 rounded-full mb-4">
                  <span className="icon-[tabler--user] size-6"></span>
                </div>
              </div>
            )}
          </div>
          {editMode && (
            <div className="card-actions mt-2">
              <label className="btn btn-primary" htmlFor="single">
                {uploading ? "Uploading ..." : "Carica foto"}
              </label>
              <input
                style={{
                  visibility: "hidden",
                  position: "absolute",
                }}
                type="file"
                id="single"
                accept="image/*"
                onChange={uploadImage}
                disabled={uploading}
              />
            </div>
          )}
        </div>
      </div>
    );
  }


  if (navbar && avatarUrl) {
    return (
      <img
        width={size}
        height={size}
        src={avatarUrl}
        alt="Avatar"
        className="w-28 rounded-full mb-4"
      />
    );
  }

  return (
    <div className="card sm:max-w-sm">
      <div className="card-body flex justify-start min-w-[376px]">
        <h5 className="card-title mb-4">Immagine profilo</h5>
        <div className="h-[150px]">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-28 rounded-full mb-4 mt-2"
            />
          ) : (
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content w-16 rounded-full mb-4">
                <span className="icon-[tabler--user] size-6"></span>
              </div>
            </div>
          )}
        </div>
        {editMode && (
          <div className="card-actions mt-2">
            <label className="btn btn-primary" htmlFor="single">
              {uploading ? "Uploading ..." : "Carica foto"}
            </label>
            <input
              style={{
                visibility: "hidden",
                position: "absolute",
              }}
              type="file"
              id="single"
              accept="image/*"
              onChange={uploadImage}
              disabled={uploading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
