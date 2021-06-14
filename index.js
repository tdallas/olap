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
const quantity = 5;

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

console.log(JSON.stringify(itineraries));
