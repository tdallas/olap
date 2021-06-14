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
      city_id: currentIndex,
      city_name: airport.city,
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
    const itinerary_id = x + 1;
    var stopsQuantity = 0;
    // omit for now
    if (Math.random() < stopsProbability) {
      // random number between 1 and 2
      stopsQuantity = Math.trunc(Math.random() * 3);
    }

    const { originAirport, destinationAirport } = getRandomAirports(airports);
    const itinerary = {
      domestic:
        countries.get(cities.get(originAirport.city_id)) ===
        countries.get(cities.get(destinationAirport.city_id)),
      flight_type: stopsQuantity == 0 ? "DIRECT" : "NON_DIRECT",
      is_cancelable: Math.random() < 0.35,
    };

    var fromDate = generateDate({ lowYear, maxYear });
    const originSegment = generateSegment(
      originAirport,
      destinationAirport,
      fromDate,
      stopsQuantity,
      airports,
      itinerary_id
    );

    const destinationSegment = generateSegment(
      destinationAirport,
      originAirport,
      originSegment.toDate,
      0,
      airports,
      itinerary_id
    );
    delete originSegment.toDate;
    delete destinationSegment.toDate;
    itineraries.push({
      ...itinerary,
      originSegment,
      destinationSegment,
      itinerary_id,
    });
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

  return {
    itinerary_date_id: randomDate.getTime(),
    timezone: "UTC",
    day,
    month,
    year,
    minute,
    hour,
  };
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

const getRandomAirportsFromStopsQty = (stopsQuantity, toAirport, airports) => {
  const stops_airports = [];
  for (const x of Array(stopsQuantity).keys()) {
    var index = Math.trunc(Math.random() * (airports.length - 1));
    var airport = airports[index];
    if (airport.airport_id == toAirport.airport_id) {
      index = Math.trunc(Math.random() * (airports.length - 1));
      airport = airports[index];
    }
    if (airports.includes(airport)) {
      index = Math.trunc(Math.random() * (airports.length - 1));
      airport = airports[index];
    }
    stops_airports.push(airport);
  }
  return stops_airports;
};

const generateSegment = (
  fromAirport,
  toAirport,
  fromDate,
  stopsQuantity,
  airports,
  itinerary_id
) => {
  const flight_duration = Math.trunc(Math.random() * 64);

  const legs = [];

  if (stopsQuantity > 0) {
    const stops_airports = getRandomAirportsFromStopsQty(
      stopsQuantity,
      toAirport,
      airports
    );

    var fromDateLeg = fromDate;
    var toDate;

    for (var i = 0; i < stops_airports.length + 1; i++) {
      toDate = addHoursToDate(
        fromDateLeg.itinerary_date_id,
        flight_duration / stops_airports.length
      );
      if (i == 0) {
        legs.push(
          generateLeg(fromAirport, stops_airports[0], {
            fromDate,
            toDate: generateDate({}, toDate),
          })
        );
      } else if (i == stops_airports.length - 1) {
        legs.push(
          generateLeg(stops_airports[i - 1], stops_airports[i], {
            fromDate,
            toDate: generateDate({}, toDate),
          })
        );
      } else if (i == stops_airports.length) {
        legs.push(
          generateLeg(stops_airports[i - 1], toAirport, {
            fromDate,
            toDate: generateDate({}, toDate),
          })
        );
      }
      fromDateLeg = generateDate({}, toDate);
    }
  } else {
    toDate = addHoursToDate(fromDate.itinerary_date_id, flight_duration);
    legs.push(
      generateLeg(fromAirport, toAirport, {
        fromDate,
        toDate: generateDate({}, toDate),
      })
    );
  }

  return {
    itinerary_id,
    legs,
    flight_duration,
    toDate: generateDate({}, toDate),
  };
};

const generateLeg = (fromAirport, toAirport, { fromDate, toDate }) => {
  return {
    arrival_airport_id: toAirport.airport_id,
    departure_airport_id: fromAirport.airport_id,
    fromDate,
    toDate,
    departure_itinerary_date_id: fromDate.itinerary_date_id,
    arrival_itinerary_date_id: toDate.itinerary_date_id,
  };
};
