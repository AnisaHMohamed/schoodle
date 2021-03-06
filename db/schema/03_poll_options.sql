DROP TABLE IF EXISTS poll_options CASCADE;

CREATE TABLE poll_options  (
  id SERIAL PRIMARY KEY NOT NULL,
  poll_id VARCHAR(255) NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  date_option DATE,
  time_option TIME
);
