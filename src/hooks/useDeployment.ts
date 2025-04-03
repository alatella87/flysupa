// hooks/useDeployment.ts
import { useState } from "react";
import { fullDeploymentFlow } from "../services/supabase/deploy";

export function useDeployment() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const deployInstance = async (schoolName: string) => {
        setLoading(true);
        try {
            const result = await fullDeploymentFlow(schoolName);
            if (!result.success) throw new Error("Migration failed");
            return result;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { deployInstance, loading, error };
}
