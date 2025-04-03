# Flysupa

### Dump

`pg_dump --schema-only --no-owner --no-privileges --no-comments --file=dry_schema.sql postgresql://postgres.lctywkbjskclilxtfiux@aws-0-eu-central-2.pooler.supabase.com:6543/postgres --exclude-schema=auth --exclude-schema=storage --exclude-schema=extensions --exclude-schema=graphql --exclude-schema=realtime --exclude-schema=vault`

Make sure to remove some existing supbabase schema/functions/tables that might
create issues.

### Migrations

Find a way..

const createProject = async (schoolName: string) => { try { const response =
await fetch("https://api.vercel.com/v9/projects", { method: "POST", headers: {
Authorization: `Bearer mvIj6EnxXpfiVUQ89oMmZ2lr`, "Content-Type":
"application/json", }, body: JSON.stringify({ name: schoolName, framework:
"vite", gitRepository: { type: "github", repo: `alatella87/flysupa`, ref:
"master", }, }), }); return await response.json(); } catch (error) {
console.error("Error creating project:", error); } };
