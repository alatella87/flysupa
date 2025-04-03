import React, { useState } from "react";

const CreateSupabaseProject: React.FC = () => {
  const [output, setOutput] = useState<string>(""); // State for output
  const [loading, setLoading] = useState<boolean>(false); // State for loading status
  const [formData, setFormData] = useState({
    email: "",
    schoolName: "",
    fullName: "",
  });

  const createSupabaseProject = async (
    apiKey: string,
    projectName: string,
    organization_id: string,
    region: string,
    db_pass: string
  ) => {
    setLoading(true);
    try {
      // Make the request to your own backend
      const response = await fetch(
        "http://localhost:3000/create-supabase-project",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apiKey,
            projectName,
            organization_id,
            region,
            db_pass,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        setOutput("Error creating project: " + JSON.stringify(error));
        return null;
      }

      const projectData = await response.json();
      setOutput("Project created: " + JSON.stringify(projectData));
      return projectData;
    } catch (error) {
      setOutput("Error: " + error);
      return null;
    }
  };

  const executeSchemaViaBackend = async (
    apiKey: string,
    projectId: string,
    db_pass: string
  ) => {
    try {
      const response = await fetch("http://localhost:3000/executeSql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          projectId,
          db_pass,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setOutput(
          (prevOutput) =>
            prevOutput + "Error executing SQL schema: " + JSON.stringify(error)
        );
        return false;
      }

      const result = await response.json();
      setOutput(
        (prevOutput) =>
          prevOutput +
          "SQL schema executed successfully: " +
          JSON.stringify(result)
      );
      return true;
    } catch (error) {
      setOutput(
        (prevOutput) => prevOutput + "Error executing SQL schema: " + error
      );
      return false;
    }
  };

  const createVercelProject = async (schoolName: string) => {
    try {
      const response = await fetch(
        "http://localhost:3000/create-vercel-project",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            schoolName,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        setOutput(
          (prevOutput) =>
            prevOutput +
            "Error creating Vercel project: " +
            JSON.stringify(error)
        );
        return null;
      }

      const result = await response.json();
      setOutput(
        (prevOutput) =>
          prevOutput +
          "Vercel project created successfully: " +
          JSON.stringify(result)
      );
      return result;
    } catch (error) {
      setOutput(
        (prevOutput) => prevOutput + "Error creating Vercel project: " + error
      );
      return null;
    }
  };

  const deployVercelProject = async (projectId: string, schoolName: string) => {
    try {
      const response = await fetch("http://localhost:3000/deploy-vercel-repo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          schoolName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setOutput(
          (prevOutput) =>
            prevOutput +
            "Error deploying Vercel project: " +
            JSON.stringify(error)
        );
        return false;
      }

      const result = await response.json();
      setOutput(
        (prevOutput) =>
          prevOutput +
          "Vercel deployment initiated successfully: " +
          JSON.stringify(result)
      );
      return true;
    } catch (error) {
      setOutput(
        (prevOutput) => prevOutput + "Error deploying Vercel project: " + error
      );
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCreateProjectClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const apiKey = "sbp_56ed72298488efd3471c5c27e3133539cd4e98e0";
    const schoolName = formData.schoolName;
    const organization_id = "ajnfgbpatgqromqqitoz";
    const region = "eu-central-1";
    const db_pass = "test30sada090";

    try {
      // Step 1: Create the Supabase project
      const projectData = await createSupabaseProject(
        apiKey,
        schoolName,
        organization_id,
        region,
        db_pass
      );

      if (projectData) {
        // Step 2: Execute the SQL schema on the new project
        console.log(
          "✅ Project created successfully! Project ID:",
          projectData.id
        );
        const supabaseProjectId = projectData.id;

        // Execute the SQL schema via the backend
        const schemaResult = await executeSchemaViaBackend(
          apiKey,
          supabaseProjectId,
          db_pass
        );

        // Step 3: Create Vercel project after schema execution
        if (schemaResult) {
          console.log("✅ SQL Schema execution result:", schemaResult);
          const vercelProjectData = await createVercelProject(
            formData.schoolName
          );

          // Step 4: Deploy Vercel project if it was created successfully
          if (vercelProjectData && vercelProjectData.id) {
            console.log(
              "✅ Vercel project created successfully! Project ID:",
              vercelProjectData.id
            );
            await deployVercelProject(vercelProjectData.id, schoolName);
          }
        }
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Create School Project</h1>

      <form onSubmit={handleCreateProjectClick}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">School Name</label>
          <input
            type="text"
            name="schoolName"
            value={formData.schoolName}
            onChange={handleInputChange}
            className="w-full p-2 dark:text-black border rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          disabled={loading}>
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>

      {output && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Output:</h2>
          <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-60 text-sm">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CreateSupabaseProject;
