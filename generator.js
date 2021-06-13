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
exports.arrayToMap = (key, array) =>
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

// only generates roundtrips, not multidestination
exports.generateItineraries = (
  { airports, cities, countries },
  { lowPrice, maxPrice },
  stopsProbability,
  { lowYear, maxYear },
  quantity
) => {
  const itineraries = [];
  for (const x of Array(quantity).keys()) {
    var stopsQuantity = 0;
    // omit for now
    // if (Math.random() < stopsProbability) {
    //   // random number between 1 and 2
    //   stopsQuantity = Math.random() * 2 + 1;
    // }

    const { originAirport, destinationAirport } = getRandomAirports(airports);
    const itinerary = {
      domestic:
        countries.get(cities.get(originAirport.city_id)) ===
        countries.get(cities.get(destinationAirport.city_id)),
      flight_type: "DIRECT",
      is_cancelable: Math.random() < 0.35,
    };

    var fromDate = generateDate({ lowYear, maxYear });
    const originSegment = generateSegment(
      originAirport,
      destinationAirport,
      fromDate
    );

    const destinationSegment = generateSegment(
      destinationAirport,
      originAirport,
      originSegment.toDate
    );
    itineraries.push({ ...itinerary, originSegment, destinationSegment });
  }
  return itineraries;
};

const generateDate = ({ lowYear, maxYear }, date) => {
  const randomDate =
    date ||
    new Date(
      lowYear.getTime() +
        Math.random() * (maxYear.getTime() - lowYear.getTime())
    );

  const year = randomDate.getFullYear();
  const month = randomDate.getMonth() + 1;
  const day = randomDate.getDay();
  const minute = randomDate.getMinutes();
  const hour = randomDate.getHours();

  return { year, month, day, minute, hour, date_id: randomDate.getTime() };
};

const addHoursToDate = (fromDate, hours) =>
  new Date(fromDate + hours * 60 * 60 * 1000);

const getRandomAirports = (airports) => {
  // pick 2 random airports
  const originIndex = Math.trunc(Math.random() * (airports.length - 1));
  var destinationIndex = Math.trunc(Math.random() * (airports.length - 1));
  const originAirport = airports[originIndex];
  if (destinationIndex == originIndex) {
    destinationIndex = Math.trunc(Math.random() * (airports.length - 1));
  }
  const destinationAirport = airports[destinationIndex];

  return { originAirport, destinationAirport };
};

const generateSegment = (fromAirport, toAirport, fromDate) => {
  const flight_duration = Math.trunc(Math.random() * 64);
  const toDate = addHoursToDate(fromDate.date_id, flight_duration);

  const firstLeg = generateLeg(fromAirport, toAirport, {
    fromDate,
    toDate: generateDate({}, toDate),
  });
  const baggage = generateBaggage(true);

  return {
    legs: [firstLeg],
    baggage,
    flight_duration,
    toDate: generateDate({}, toDate),
  };
};

const generateBaggage = (included) => {
  return { weight: 23, weight_unit: "KG", included };
};

const generateLeg = (fromAirport, toAirport, { fromDate, toDate }) => {
  return {
    arrival_airport_id: fromAirport.airport_id,
    departure_airport_id: toAirport.airport_id,
    fromDate,
    toDate,
    // departure_itinerary_date_id: fromDate.date_id,
    // arrival_itinerary_date_id: toDate.date_id,
  };
};
