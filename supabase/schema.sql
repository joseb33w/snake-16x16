CREATE TABLE IF NOT EXISTS public."usr_nmexs7bytxq2_snake_runs" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  score int NOT NULL CHECK (score >= 0),
  length int NOT NULL CHECK (length >= 1),
  played_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public."usr_nmexs7bytxq2_snake_runs" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_user_access" ON public."usr_nmexs7bytxq2_snake_runs";
CREATE POLICY "auth_user_access"
ON public."usr_nmexs7bytxq2_snake_runs"
FOR ALL
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public."usr_nmexs7bytxq2_snake_runs" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."usr_nmexs7bytxq2_snake_runs" TO service_role;

CREATE INDEX IF NOT EXISTS "usr_nmexs7bytxq2_snake_runs_user_score_idx"
ON public."usr_nmexs7bytxq2_snake_runs" (user_id, score DESC, length DESC, played_at DESC);
