-- Schema Table Creation
CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS baggage(
    baggage_id SERIAL PRIMARY KEY,
    quantity INTEGER,
    weight INTEGER,
    weight_unit VARCHAR(10),
    included BOOLEAN
);

CREATE TABLE IF NOT EXISTS itinerary(
    itinerary_id SERIAL PRIMARY KEY,
    domestic BOOLEAN,
    flight_type VARCHAR(50),
    is_cancelable BOOLEAN
);

CREATE TABLE IF NOT EXISTS country(
    country_id SERIAL PRIMARY KEY,
    country_name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS city(
    city_id SERIAL PRIMARY KEY,
    city_name VARCHAR(100),
    country_id INTEGER REFERENCES country(country_id)
);

CREATE TABLE IF NOT EXISTS airport(
    airport_id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES city(city_id),
    airport_code VARCHAR(10),
    airport_name VARCHAR(70)
);

CREATE TABLE IF NOT EXISTS technicalstop(
    technical_stop_id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES city(city_id),
    duration INTEGER -- duration in minutes
);

CREATE TABLE IF NOT EXISTS itinerarydate(
    itinerary_date_id BIGSERIAL PRIMARY KEY,
    timezone VARCHAR(100),
    day INTEGER,
    month INTEGER,
    year INTEGER,
    minute INTEGER,
    hour INTEGER
);

CREATE TABLE IF NOT EXISTS segment (
    segment_id SERIAL PRIMARY KEY,
    flight_duration INTEGER, -- in hours
    baggage_id INTEGER REFERENCES baggage(baggage_id),
    itinerary_id INTEGER REFERENCES itinerary(itinerary_id)
);

CREATE TABLE IF NOT EXISTS leg(
    leg_id SERIAL PRIMARY KEY,
    segment_id INTEGER REFERENCES segment(segment_id),
    arrival_airport_id INTEGER REFERENCES airport(airport_id),
    departure_airport_id INTEGER REFERENCES airport(airport_id),
    technical_stop_id INTEGER REFERENCES technicalstop(technical_stop_id),
    departure_itinerary_date_id BIGSERIAL REFERENCES itinerarydate(itinerary_date_id),
    arrival_itinerary_date_id BIGSERIAL REFERENCES itinerarydate(itinerary_date_id)
);

CREATE TABLE IF NOT EXISTS searchfact(
    id SERIAL PRIMARY KEY,
    flexibility INTEGER,
    hits INTEGER,
    price DOUBLE PRECISION,
    currency VARCHAR(10),
    conversion_rate INTEGER,
    itinerary_id INTEGER REFERENCES itinerary(itinerary_id)
);
