const airportsJson = require("./airports.json");
const countries_to_consider = [
  "Argentina",
  "Brazil",
  "United States",
  "England",
  "Spain",
  "Italy",
  "China",
  "Japan",
  "Bolivia",
  "Switzerland",
];

const filteredAirports = airportsJson
  .filter((airport) => airport.type == "Airports")
  .filter(
    (airport) =>
      !!countries_to_consider.find((country) => airport.country == country)
  );

const {
  generatePlaces,
  arrayToMap,
  generateItineraries,
} = require("./generator");

const { airports, cities, countries } = generatePlaces(filteredAirports);
const priceLimit = { lowPrice: 10000, maxPrice: 150000 };
const dateLimit = {
  lowYear: new Date(2020, 0, 1),
  maxYear: new Date(2022, 0, 1),
};

const stopsProbability = 0.3;

// 10 million itineraries
const quantity = 10;

const itineraries = generateItineraries(
  {
    airports,
    cities: arrayToMap("city_id", cities),
    countries: arrayToMap("country_id", countries),
  },
  priceLimit,
  stopsProbability,
  dateLimit,
  quantity
);

const airportsMap = arrayToMap("airport_id", airports);

const baggages = [
  { baggage_id: 1, quantity: 1, weight: 23, weight_unit: "KG", included: true },
  {
    baggage_id: 2,
    quantity: 1,
    weight: 23,
    weight_unit: "KG",
    included: false,
  },
];

const itinerariesSql = itineraries.map(
  ({ itinerary_id, domestic, flight_type, is_cancelable }) => ({
    itinerary_id,
    domestic,
    flight_type,
    is_cancelable,
  })
);

const segmentsSql = [];
const legsSql = [];
const dates = {};
const stops = [];

var segmentsId = 1;
var legsId = 1;
var stopsId = 1;
for (var i = 0; i < itineraries.length; i++) {
  const baggage_id = Math.random() < 0.5 ? baggages[0] : baggages[1];
  var currentSegmentId = segmentsId;
  segmentsSql.push({
    segment_id: currentSegmentId,
    flight_duration: itineraries[i].originSegment.flight_duration,
    baggage_id,
    itinerary_id: itineraries[i].itinerary_id,
  });
  itineraries[i].originSegment.legs.forEach(
    ({
      arrival_airport_id,
      departure_airport_id,
      departure_itinerary_date_id,
      arrival_itinerary_date_id,
      fromDate,
      toDate,
    }) => {
      if (itineraries[i].originSegment.legs.length > 1) {
        stops.push({
          technical_stop_id: stopsId++,
          city_id: airportsMap[arrival_airport_id],
          duration:
            itineraries[i].originSegment.flight_duration /
            itineraries[i].originSegment.stopsQuantity,
        });
      }
      legsSql.push({
        leg_id: legsId++,
        segment_id: currentSegmentId,
        arrival_airport_id,
        departure_airport_id,
        technical_stop_id: stopsId - 1,
        departure_itinerary_date_id,
        arrival_itinerary_date_id,
      });
      dates[fromDate.date_id] = fromDate;
      dates[toDate.date_id] = toDate;
    }
  );

  currentSegmentId++;

  segmentsSql.push({
    segment_id: currentSegmentId,
    flight_duration: itineraries[i].destinationSegment.flight_duration,
    baggage_id,
    itinerary_id: itineraries[i].itinerary_id,
  });
  itineraries[i].destinationSegment.legs.forEach(
    ({
      arrival_airport_id,
      departure_airport_id,
      departure_itinerary_date_id,
      arrival_itinerary_date_id,
      fromDate,
      toDate,
    }) => {
      legsSql.push({
        leg_id: legsId++,
        segment_id: currentSegmentId,
        arrival_airport_id,
        departure_airport_id,
        technical_stop_id: null,
        departure_itinerary_date_id,
        arrival_itinerary_date_id,
      });
      dates[fromDate.date_id] = fromDate;
      dates[toDate.date_id] = toDate;
    }
  );
  currentSegmentId++;
}

var client;

const generateQueries = () => {
  // const executeQuery = (query, values, client) => client.query(query, values);

  var bigString = "";

  // console.log("itineraries");
  itinerariesSql.forEach((it) => {
    bigString = bigString.concat(
      `INSERT INTO itinerary (${it.itinerary_id}, ${it.domestic}, ${it.flight_type}, ${it.is_cancelable});`
    );
  });

  // console.log("countries");
  countries.forEach(({ country_id, country_name }) => {
    bigString = bigString.concat(
      `INSERT INTO country (${country_id}, ${country_name});`
    );
  });

  // console.log("cities");
  cities.forEach(({ city_id, city_name, country_id }) => {
    bigString = bigString.concat(
      `INSERT INTO cities (${city_id}, ${city_name}, ${country_id});`
    );
  });

  airports.forEach(({ airport_id, city_id, airport_code, airport_name }) => {
    bigString = bigString.concat(
      `INSERT INTO airport VALUES(${airport_id}, ${city_id}, ${airport_code}, ${airport_name});`
    );
  });

  stops.forEach((stop) => {
    bigString = bigString.concat(
      `INSERT INTO technicalstop VALUES(${stop.technical_stop_id}, ${stop.city_id}, ${stop.duration});`
    );
  });

  Object.values(dates).forEach(
    ({ itinerary_date_id, timezone, day, month, year, minute, hour }) => {
      bigString = bigString.concat(
        `INSERT INTO itinerarydate VALUES(${itinerary_date_id}, ${timezone}, ${day}, ${month}, ${year}, ${minute}, ${hour});`
      );
    }
  );

  segmentsSql.forEach(
    ({ segment_id, flight_duration, baggage_id, itinerary_id }) => {
      bigString = bigString.concat(
        `INSERT INTO segment VALUES(${segment_id}, ${flight_duration}, ${baggage_id}, ${itinerary_id});`
      );
    }
  );

  legsSql.forEach(
    ({
      leg_id,
      segment_id,
      arrival_airport_id,
      departure_airport_id,
      technical_stop_id,
      departure_itinerary_date_id,
      arrival_itinerary_date_id,
    }) => {
      bigString = bigString.concat(
        `INSERT INTO leg VALUES(${leg_id}, ${segment_id}, ${arrival_airport_id}, ${departure_airport_id}, ${technical_stop_id}, ${departure_itinerary_date_id}, ${arrival_itinerary_date_id});`
      );
    }
  );

  console.log(bigString);
};

generateQueries();
