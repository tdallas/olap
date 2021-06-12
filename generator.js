exports.generatePlaces = (airportsJson) => {
  const countries = filterDuplicates(
    "country_name",
    generateCountries(airportsJson)
  );
  const cities = filterDuplicates(
    "city_name",
    generateCities(airportsJson, arrayToMap("country_name", countries))
  );
  const airports = filterDuplicates(
    "airport_code",
    generateAirports(airportsJson, arrayToMap("city_name", cities))
  );

  return {
    countries,
    cities,
    airports,
  };
};

const filterDuplicates = (field, array) => {
  const uniqueValues = [];
  const uniqueArray = [];
  for (var i = 0; i < array.length; i++) {
    if (!uniqueValues.includes(array[i][field])) {
      uniqueValues.push(array[i][field]);
      uniqueArray.push(array[i]);
    }
  }
  return uniqueArray;
};

const arrayToMap = (key, array) =>
  new Map(array.map((object) => [object[key], object]));

const generateAirports = (airports, citiesMap) =>
  airports.map((airport, currentIndex) => ({
    airport_id: currentIndex,
    city_id: citiesMap.get(airport.city).city_id,
    airport_code: airport.code,
    airport_name: airport.name,
  }));

const generateCities = (airports, countriesMap) =>
  airports.map((airport, currentIndex) => {
    return {
      city_name: airport.city,
      city_id: currentIndex,
      country_id: countriesMap.get(airport.country).country_id,
    };
  });

const generateCountries = (airports) =>
  airports.map((airport, currentIndex) => ({
    country_id: currentIndex,
    country_name: airport.country,
  }));
