
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
  segmentsSql.push({
    itinerary_id: itineraries[i].itinerary_id,
    segment_id: segmentsId++,
    flight_duration: itineraries[i].originSegment.flight_duration,
    baggage_id,
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
        arrival_airport_id,
        departure_airport_id,
        departure_itinerary_date_id,
        arrival_itinerary_date_id,
        leg_id: legsId++,
        segment_id: segmentsId - 1,
        technical_stop_id: stopsId - 1,
      });
      dates[fromDate.date_id] = fromDate;
      dates[toDate.date_id] = toDate;
    }
  );

  segmentsSql.push({
    itinerary_id: itineraries[i].itinerary_id,
    segment_id: segmentsId++,
    flight_duration: itineraries[i].destinationSegment.flight_duration,
    baggage_id,
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
        arrival_airport_id,
        departure_airport_id,
        departure_itinerary_date_id,
        arrival_itinerary_date_id,
        leg_id: legsId++,
        segment_id: segmentsId - 1,
      });
      dates[fromDate.date_id] = fromDate;
      dates[toDate.date_id] = toDate;
    }
  );
}

console.log("itinerariesSql", itinerariesSql.length);
console.log("segmentsSql", segmentsSql.length);
console.log("legsSql", legsSql.length);
console.log("dates", Object.values(dates).length);
console.log("stops", stops.length);

// const { Client } = require('pg')
// const client = new Client()
// await client.connect()

// const text = 'INSERT INTO users(name, email) VALUES($1, $2) RETURNING *'
// const values = ['brianc', 'brian.m.carlson@gmail.com']

// // promise
// client
//   .query(text, values)
//   .then(res => {
//     console.log(res.rows[0])
//     // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
//   })
//   .catch(e => console.error(e.stack))