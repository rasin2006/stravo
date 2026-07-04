-- Aggregated metrics for segment scoring
ALTER TABLE segments
  ADD COLUMN average_rating DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN feedback_count INTEGER DEFAULT 0,
  ADD COLUMN interest_score DOUBLE PRECISION DEFAULT 0;
