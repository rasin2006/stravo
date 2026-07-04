-- Reference schema aligned with Sequelize models (backend/src/models/)
-- Use `npm start` in backend/ for dev sync, or apply manually on Postgres.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    distance_meters NUMERIC(10, 2),
    duration_seconds INTEGER,
    elevation_gain_meters NUMERIC(10, 2),
    start_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_points (
    id BIGSERIAL PRIMARY KEY,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    elevation NUMERIC(7, 2),
    accuracy NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    start_point_id BIGINT NOT NULL,
    end_point_id BIGINT NOT NULL,
    segment_path TEXT,
    length_meters NUMERIC(10, 2),
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE segment_feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_segment_id UUID NOT NULL REFERENCES activity_segments(id) ON DELETE CASCADE,
    is_interesting BOOLEAN NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (activity_segment_id, user_id)
);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activity_points_activity_id ON activity_points(activity_id);
CREATE INDEX idx_activity_segments_activity_id ON activity_segments(activity_id);
CREATE INDEX idx_segment_feedbacks_segment_id ON segment_feedbacks(activity_segment_id);
