-- Initial relational schema for Stravo
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  distance_meters DOUBLE PRECISION NOT NULL,
  duration_seconds INTEGER NOT NULL,
  elevation_gain_meters DOUBLE PRECISION,
  start_location geography(POINT, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE activity_points (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER NOT NULL REFERENCES activities(id),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  elevation DOUBLE PRECISION
);

CREATE TABLE segments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_location geography(POINT, 4326) NOT NULL,
  end_location geography(POINT, 4326) NOT NULL,
  distance_meters DOUBLE PRECISION NOT NULL,
  difficulty VARCHAR(32),
  scenic_score DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE activity_segments (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER NOT NULL REFERENCES activities(id),
  segment_id INTEGER NOT NULL REFERENCES segments(id),
  start_index INTEGER NOT NULL,
  end_index INTEGER NOT NULL
);

CREATE TABLE segment_feedbacks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  segment_id INTEGER NOT NULL REFERENCES segments(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  difficulty VARCHAR(32),
  scenic_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
