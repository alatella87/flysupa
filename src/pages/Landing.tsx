import React, { useState } from "react";

const CreateSupabaseProject: React.FC = () => {
  const [output, setOutput] = useState<string>(""); // State for output
  const [loading, setLoading] = useState<boolean>(false); // State for loading status

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
      const response = await fetch("http://localhost:3000/createProject", {
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
      });

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
    } finally {
      setLoading(false);
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
        return;
      }

      const result = await response.json();
      setOutput(
        (prevOutput) =>
          prevOutput +
          "SQL schema executed successfully: " +
          JSON.stringify(result)
      );
    } catch (error) {
      setOutput(
        (prevOutput) => prevOutput + "Error executing SQL schema: " + error
      );
    }
  };

  const handleCreateProjectClick = async () => {
    //
    const apiKey = "sbp_56ed72298488efd3471c5c27e3133539cd4e98e0";
    const projectName = "buz";
    const organization_id = "ajnfgbpatgqromqqitoz";
    const region = "eu-central-1";
    const db_pass = "test30sada090";

    try {
      // Step 1: Create the Supabase project
      const projectData = await createSupabaseProject(
        apiKey,
        projectName,
        organization_id,
        region,
        db_pass
      );

      if (projectData) {
        // Step 2: Execute the SQL schema on the new project
        // The project ID is in the response as "id"
        const projectId = projectData.id;
        console.log("✅ Project created successfully! Project ID:", projectId);
        // Execute the SQL schema via the backend
        await executeSchemaViaBackend(apiKey, projectId, db_pass);
      }
    } catch (error) {
      setOutput("Error: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Supabase Project</h1>
      <button
        id="createProjectBtn"
        onClick={handleCreateProjectClick}
        disabled={loading}>
        {loading ? "Creating..." : "Create Project"}
      </button>
      <pre id="output">{output}</pre>
    </div>
  );
};

export default CreateSupabaseProject;
