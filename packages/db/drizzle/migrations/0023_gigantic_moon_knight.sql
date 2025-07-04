-- Safe migration: Drop workspace-related schema elements
-- Check if constraint exists before dropping it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'Form_workspaceId_Workspace_id_fk' 
               AND table_name = 'Form') THEN
        ALTER TABLE "Form" DROP CONSTRAINT "Form_workspaceId_Workspace_id_fk";
    END IF;
END $$;
--> statement-breakpoint

-- Check if workspaceId column exists before dropping it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'Form' AND column_name = 'workspaceId') THEN
        ALTER TABLE "Form" DROP COLUMN "workspaceId";
    END IF;
END $$;
--> statement-breakpoint

-- Check if Workspace table exists before dropping it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'Workspace') THEN
        ALTER TABLE "Workspace" DISABLE ROW LEVEL SECURITY;
        DROP TABLE "Workspace" CASCADE;
    END IF;
END $$;