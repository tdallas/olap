CREATE TABLE baggage(
    baggage_id SERIAL PRIMARY KEY,
    quantity INTEGER,
    weight INTEGER,
    weight_unit VARCHAR(10)
);

CREATE TABLE itinerary(
    itinerary_id SERIAL PRIMARY KEY,
    domestic BOOLEAN,
    flight_type VARCHAR(50),
    is_cancelable BOOLEAN
);

CREATE TABLE segment (
    segment_id SERIAL PRIMARY KEY,
    flight_duration INTEGER, -- in minutes
    baggage_id INTEGER REFERENCES(baggage),
    itinerary_id INTEGER REFERENCES(itinerary)
);

CREATE TABLE leg(
    leg_id SERIAL PRIMARY KEY,
    segment_id INTEGER REFERENCES(segment),
    arrival_airport_id INTEGER REFERENCES(airport),
    departure_airport_id INTEGER REFERENCES(airport),
    technical_stop_id INTEGER REFERENCES(technicalstop),
    departure_itinerary_date_id INTEGER REFERENCES(itinerarydate),
    arrival_itinerary_date_id INTEGER REFERENCES(itinerarydate)
);

CREATE TABLE searchfact(
    id SERIAL PRIMARY KEY,
    flexibility BOOLEAN,
    hits INTEGER,
    price DOUBLE PRECISION,
    currency VARCHAR(10),
    conversion_rate INTEGER,
    itinerary_id INTEGER REFERENCES(itinerary)
);


CREATE TABLE airport(
    airport_id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES(city),
    airport_code VARCHAR(10),
    airport_name VARCHAR(70)
);

CREATE TABLE technicalstop(
    technical_stop_id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES(city),
    duration INTEGER -- duration in minutes
);

CREATE TABLE itinerarydate(
    timestamp_id SERIAL PRIMARY KEY,
    timezone VARCHAR(100),
    day INTEGER,
    month INTEGER,
    year INTEGER,
    trimester INTEGER,
    minute INTEGER,
    hour INTEGER
);

CREATE TABLE city(
    city_id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES(country)
);

CREATE TABLE country(
    country_id SERIAL PRIMARY KEY,
    country_name VARCHAR(100)
);