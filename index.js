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
  generateFacts
} = require("./generator");

const { airports, cities, countries } = generatePlaces(filteredAirports);
const priceLimit = { lowPrice: 10000, maxPrice: 150000 };
const dateLimit = {
  lowYear: new Date(2020, 0, 1),
  maxYear: new Date(2022, 0, 1),
};

const stopsProbability = 0.3;

// 10 million itineraries
const quantity = 7000;

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
  const baggage_id =
    Math.random() < 0.5 ? baggages[0].baggage_id : baggages[1].baggage_id;
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
          technical_stop_id: stopsId,
          city_id: airports[arrival_airport_id].city_id,
          duration:
            itineraries[i].originSegment.flight_duration /
            itineraries[i].originSegment.stopsQuantity,
        });
        legsSql.push({
          leg_id: legsId++,
          segment_id: currentSegmentId,
          arrival_airport_id,
          departure_airport_id,
          technical_stop_id: stopsId,
          departure_itinerary_date_id,
          arrival_itinerary_date_id,
        });
        stopsId++;
      } else {
        legsSql.push({
          leg_id: legsId++,
          segment_id: currentSegmentId,
          arrival_airport_id,
          departure_airport_id,
          technical_stop_id: null,
          departure_itinerary_date_id,
          arrival_itinerary_date_id,
        });
      }
      dates[fromDate.itinerary_date_id] = fromDate;
      dates[toDate.itinerary_date_id] = toDate;
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
      dates[fromDate.itinerary_date_id] = fromDate;
      dates[toDate.itinerary_date_id] = toDate;
    }
  );
  currentSegmentId++;
  segmentsId = currentSegmentId;
}

const factsSQL = generateFacts(itineraries.map(v=>v.itinerary_id));

const generateQueries = () => {
  // const executeQuery = (query, values, client) => client.query(query, values);

  var bigString = "";

  const fs = require("fs");
  var logger = fs.createWriteStream("query.sql");

  baggages.forEach(
    ({ baggage_id, quantity, weight, weight_unit, included }) => {
      logger.write(
        `INSERT INTO baggage VALUES(${baggage_id}, ${quantity}, ${weight}, '${weight_unit}', ${included});\n`
      );
    }
  );
  console.log("itineraries");
  itinerariesSql.forEach((it) => {
    logger.write(
      `INSERT INTO itinerary VALUES(${it.itinerary_id}, ${it.domestic}, '${it.flight_type}', ${it.is_cancelable});\n`
    );
  });

  console.log("countries");
  countries.forEach(({ country_id, country_name }) => {
    logger.write(
      `INSERT INTO country VALUES(${country_id}, '${country_name.replace(
        "'",
        ""
      )}');\n`
    );
  });

  console.log("cities");
  cities.forEach(({ city_id, city_name, country_id }) => {
    logger.write(
      `INSERT INTO city VALUES(${city_id}, '${city_name.replace(
        "'",
        ""
      )}', ${country_id});\n`
    );
  });
  console.log("airports");
  airports.forEach(({ airport_id, city_id, airport_code, airport_name }) => {
    logger.write(
      `INSERT INTO airport VALUES(${airport_id}, ${city_id}, '${airport_code}', '${airport_name.replace(
        "'",
        ""
      )}');\n`
    );
  });

  console.log("stops");
  stops.forEach((stop) => {
    logger.write(
      `INSERT INTO technicalstop VALUES(${stop.technical_stop_id}, ${stop.city_id}, ${stop.duration});\n`
    );
  });

  Object.values(dates).forEach(
    ({ itinerary_date_id, timezone, day, month, year, minute, hour }) => {
      const string = "".concat(
        `INSERT INTO itinerarydate VALUES(${itinerary_date_id}, '${timezone}', ${day}, ${month}, ${year}, ${minute}, ${hour});\n`
      );
      logger.write(string);
    }
  );

  segmentsSql.forEach(
    ({ segment_id, flight_duration, baggage_id, itinerary_id }) => {
      // newString = newString.concat(
      //   `INSERT INTO segment VALUES(${segment_id}, ${flight_duration}, ${baggage_id}, ${itinerary_id});\n`
      // );
      logger.write(
        `INSERT INTO segment VALUES(${segment_id}, ${flight_duration}, ${baggage_id}, ${itinerary_id});\n`
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
      // newString = newString.concat(
      //   `INSERT INTO leg VALUES(${leg_id}, ${segment_id}, ${arrival_airport_id}, ${departure_airport_id}, ${technical_stop_id}, ${departure_itinerary_date_id}, ${arrival_itinerary_date_id});\n`
      // );
      logger.write(
        `INSERT INTO leg VALUES(${leg_id}, ${segment_id}, ${arrival_airport_id}, ${departure_airport_id}, ${technical_stop_id}, ${departure_itinerary_date_id}, ${arrival_itinerary_date_id});\n`
      );
    }
  );
  factsSQL.forEach(
    ({
      id,
      flexibility,
      hits,
      price,
      currency,
      conversion_rate,
      itinerary_id,
    }) => {
      logger.write(
        `INSERT INTO searchfact VALUES (${id},${flexibility},${hits},${price},'${currency}',${conversion_rate},${itinerary_id});\n`
      );
    }
  );
  logger.write(
`UPDATE searchfact
SET flexibility = flexibility + 1
WHERE EXISTS(
    SELECT is_cancelable,itinerary_id FROM itinerary
    WHERE is_cancelable = true AND  itinerary.itinerary_id = searchfact.itinerary_id
);
`)
  logger.write(
`UPDATE searchfact
SET flexibility = flexibility + 1
WHERE searchfact.itinerary_id IN (
    WITH t AS (
        SELECT itinerary_id, quantity * weight AS total, 
        AVG(quantity * weight) OVER () AS average
        FROM itinerary NATURAL JOIN segment NATURAL JOIN baggage
    )
    SELECT itinerary_id AS bgaverage
    FROM t
    WHERE t.total > t.average
);
`)

logger.write(
`UPDATE searchfact
SET flexibility = flexibility + 1
WHERE searchfact.itinerary_id IN (
    SELECT itinerary_id
    FROM (itinerary NATURAL JOIN segment NATURAL JOIN baggage) AS t
    WHERE t.included = true
);
`)
  // logger.write("UPDATE searchfact SET flexibility=1 WHERE ;")
  logger.end();
  return;
};

const query = generateQueries();
