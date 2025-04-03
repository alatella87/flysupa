import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import pg from "pg";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const { Pool } = pg;
const app = express();
const port = 3000;
const createProjectUrl = "https://api.supabase.com/v1/projects";

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Test Endpoint
app.get("/v1/projects", (req, res) => {
  res.json({ message: "Projects endpoint is working" });
});

// Create Supabase Project
app.post("/createProject", async (req, res) => {
  try {
    const { apiKey, projectName, organization_id, region, db_pass } = req.body;
    const response = await fetch(createProjectUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        db_pass,
        organization_id,
        region,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res
        .status(500)
        .json({ error: "Error creating project", details: error });
    }

    res.json(await response.json());
  } catch (error) {
    res.status(500).json({
      error: "Error making request to Supabase",
      details: error.message,
    });
  }
});

// Execute SQL on Database
app.post("/executeSql", async (req, res) => {
  console.log("Received request to execute SQL", req.body);
  try {
    const { projectId, apiKey, db_pass } = req.body;
    if (!projectId) throw new Error("Project ID is missing from request body");

    // const projectUrl = `https://${projectId}.supabase.co`;

    // Fetch anon key
    // const response = await fetch(
    //   `https://api.supabase.com/v1/projects/${projectId}/api-keys`,
    //   {
    //     method: "GET",
    //     headers: {
    //       Authorization: `Bearer ${apiKey}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );

    // if (!response.ok)
    //   throw new Error(`Failed to fetch anon key: ${response.statusText}`);

    // const keys = await response.json();
    // const anonKey = keys.find((item) => item.name === "service_role")?.api_key;
    // if (!anonKey) throw new Error("Anon key not found");

    // // Initialize Supabase Client
    // const supabaseClient = createClient(projectUrl, anonKey);
    // if (!supabaseClient)
    //   throw new Error("Failed to initialize Supabase client");

    // Execute SQL
    const pool = new Pool({
      connectionString: `postgresql://postgres:${db_pass}@db.${projectId}.supabase.co:5432/postgres`,
      ssl: { rejectUnauthorized: false },
    });

    const sql = fs.readFileSync("./dry_schema.sql", "utf8");
    await pool.query(sql);
    await pool.end();

    res.json({ message: "Schema applied successfully" });
  } catch (error) {
    console.error("Error in executeSql endpoint:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
