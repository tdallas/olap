-- DOMESTIC ALTA
-- @block
WITH timeit AS (
    SELECT itinerary_id, 
    MIN(TO_TIMESTAMP(CONCAT(
        CAST(rt.year AS TEXT),'/',
        RIGHT('00' || CAST(rt.month AS TEXT),2),'/',
        RIGHT('00' || CAST(rt.day AS TEXT),2),' ',
        RIGHT('00' || CAST(rt.hour AS TEXT),2),':',
        RIGHT('00' || CAST(rt.minute AS TEXT),2)
    ),'YYYY/MM/DD HH24:MI:SS')) AS deptime
    FROM (itinerary NATURAL JOIN segment NATURAL JOIN leg
        JOIN itinerarydate AS it ON leg.departure_itinerary_date_id = it.itinerary_date_id) AS rt
    GROUP BY itinerary_id
    WHERE domestic = true
), 
season AS(
    SELECT itinerary_id,
    CASE
        WHEN EXTRACT( MONTH from deptime) IN (1,2,3,12) THEN 'ALTA'
        WHEN EXTRACT( MONTH from deptime) IN (4,5,6,7) THEN 'MEDIA'
        WHEN EXTRACT( MONTH from deptime) IN (8,9,10,11) THEN 'BAJA'
    END AS temporada
    FROM timeit
),
t AS (
    SELECT itinerary_id,hits,
    SUM(hits) OVER ( ORDER BY hits DESC ROWS UNBOUNDED PRECEDING) AS cumulative,
    SUM(hits) OVER () AS total,
    AVG(price / conversion_rate) OVER() AS avgprice,
    FROM searchfact NATURAL JOIN season
    WHERE temporada = 'ALTA'
)
SELECT itinerary_id,hits FROM t
WHERE ( total - cumulative ) > 0.5 * total 
ORDER BY normalizedPrice ASC, hits DESC
GROUP BY itinerary_id
LIMIT 10;

-- DOMESTIC MEDIA
-- @block
WITH timeit AS (
    SELECT itinerary_id, 
    MIN(TO_TIMESTAMP(CONCAT(
        CAST(rt.year AS TEXT),'/',
        RIGHT('00' || CAST(rt.month AS TEXT),2),'/',
        RIGHT('00' || CAST(rt.day AS TEXT),2),' ',
        RIGHT('00' || CAST(rt.hour AS TEXT),2),':',
        RIGHT('00' || CAST(rt.minute AS TEXT),2)
    ),'YYYY/MM/DD HH24:MI:SS')) AS deptime
    FROM (itinerary NATURAL JOIN segment NATURAL JOIN leg
        JOIN itinerarydate AS it ON leg.departure_itinerary_date_id = it.itinerary_date_id) AS rt
    GROUP BY itinerary_id
    WHERE domestic = true
), 
season AS(
    SELECT itinerary_id,
    CASE
        WHEN EXTRACT( MONTH from deptime) IN (1,2,3,12) THEN 'ALTA'
        WHEN EXTRACT( MONTH from deptime) IN (4,5,6,7) THEN 'MEDIA'
        WHEN EXTRACT( MONTH from deptime) IN (8,9,10,11) THEN 'BAJA'
    END AS temporada
    FROM timeit
),
t AS (
    SELECT itinerary_id,hits,
    SUM(hits) OVER ( ORDER BY hits DESC ROWS UNBOUNDED PRECEDING) AS cumulative,
    SUM(hits) OVER () AS total,
    AVG(price / conversion_rate) OVER() AS avgprice,
    FROM searchfact NATURAL JOIN season
    WHERE temporada = 'MEDIA'
)
SELECT itinerary_id,hits FROM t
WHERE ( total - cumulative ) > 0.5 * total 
ORDER BY normalizedPrice ASC, hits DESC
GROUP BY itinerary_id
LIMIT 10;

-- DOMESTIC BAJA
-- @block
WITH timeit AS (
    SELECT itinerary_id, 
    MIN(TO_TIMESTAMP(CONCAT(
        CAST(rt.year AS TEXT),'/',
        RIGHT('00' || CAST(rt.month AS TEXT),2),'/',
        RIGHT('00' || CAST(rt.day AS TEXT),2),' ',
        RIGHT('00' || CAST(rt.hour AS TEXT),2),':',
        RIGHT('00' || CAST(rt.minute AS TEXT),2)
    ),'YYYY/MM/DD HH24:MI:SS')) AS deptime
    FROM (itinerary NATURAL JOIN segment NATURAL JOIN leg
        JOIN itinerarydate AS it ON leg.departure_itinerary_date_id = it.itinerary_date_id) AS rt
    GROUP BY itinerary_id
    WHERE domestic = true
), 
season AS(
    SELECT itinerary_id,
    CASE
        WHEN EXTRACT( MONTH from deptime) IN (1,2,3,12) THEN 'ALTA'
        WHEN EXTRACT( MONTH from deptime) IN (4,5,6,7) THEN 'MEDIA'
        WHEN EXTRACT( MONTH from deptime) IN (8,9,10,11) THEN 'BAJA'
    END AS temporada
    FROM timeit
),
t AS (
    SELECT itinerary_id,hits,
    SUM(hits) OVER ( ORDER BY hits DESC ROWS UNBOUNDED PRECEDING) AS cumulative,
    SUM(hits) OVER () AS total,
    AVG(price / conversion_rate) OVER() AS avgprice,
    FROM searchfact NATURAL JOIN season
    WHERE temporada = 'BAJA'
)
SELECT itinerary_id,hits FROM t
WHERE ( total - cumulative ) > 0.5 * total 
ORDER BY normalizedPrice ASC, hits DESC
GROUP BY itinerary_id
LIMIT 10;

-- INTERNATIONAL ALTA
-- @block
WITH timeit AS (
    SELECT itinerary_id, 
    MIN(TO_TIMESTAMP(CONCAT(
        CAST(rt.year AS TEXT),'/',
        RIGHT('00' || CAST(rt.month AS TEXT),2),'/',
        RIGHT('00' || CAST(rt.day AS TEXT),2),' ',
        RIGHT('00' || CAST(rt.hour AS TEXT),2),':',
        RIGHT('00' || CAST(rt.minute AS TEXT),2)
    ),'YYYY/MM/DD HH24:MI:SS')) AS deptime
    FROM (itinerary NATURAL JOIN segment NATURAL JOIN leg
        JOIN itinerarydate AS it ON leg.departure_itinerary_date_id = it.itinerary_date_id) AS rt
    GROUP BY itinerary_id
    WHERE domestic = false
), 
season AS(
    SELECT itinerary_id,
    CASE
        WHEN EXTRACT( MONTH from deptime) IN (1,2,3,12) THEN 'ALTA'
        WHEN EXTRACT( MONTH from deptime) IN (4,5,6,7) THEN 'MEDIA'
        WHEN EXTRACT( MONTH from deptime) IN (8,9,10,11) THEN 'BAJA'
    END AS temporada
    FROM timeit
),
t AS (
    SELECT itinerary_id,hits,
    SUM(hits) OVER ( ORDER BY hits DESC ROWS UNBOUNDED PRECEDING) AS cumulative,
    SUM(hits) OVER () AS total,
    AVG(price / conversion_rate) OVER() AS avgprice,
    FROM searchfact NATURAL JOIN season
    WHERE temporada = 'ALTA'
)
SELECT itinerary_id,hits FROM t
WHERE ( total - cumulative ) > 0.5 * total 
ORDER BY normalizedPrice ASC, hits DESC
GROUP BY itinerary_id
LIMIT 10;

-- INTERNATIONAL MEDIA
-- @block
WITH timeit AS (
    SELECT itinerary_id, 
    MIN(TO_TIMESTAMP(CONCAT(
        CAST(rt.year AS TEXT),'/',
        RIGHT('00' || CAST(rt.month AS TEXT),2),'/',
        RIGHT('00' || CAST(rt.day AS TEXT),2),' ',
        RIGHT('00' || CAST(rt.hour AS TEXT),2),':',
        RIGHT('00' || CAST(rt.minute AS TEXT),2)
    ),'YYYY/MM/DD HH24:MI:SS')) AS deptime
    FROM (itinerary NATURAL JOIN segment NATURAL JOIN leg
        JOIN itinerarydate AS it ON leg.departure_itinerary_date_id = it.itinerary_date_id) AS rt
    GROUP BY itinerary_id
    WHERE domestic = false
), 
season AS(
    SELECT itinerary_id,
    CASE
        WHEN EXTRACT( MONTH from deptime) IN (1,2,3,12) THEN 'ALTA'
        WHEN EXTRACT( MONTH from deptime) IN (4,5,6,7) THEN 'MEDIA'
        WHEN EXTRACT( MONTH from deptime) IN (8,9,10,11) THEN 'BAJA'
    END AS temporada
    FROM timeit
),
t AS (
    SELECT itinerary_id,hits,
    SUM(hits) OVER ( ORDER BY hits DESC ROWS UNBOUNDED PRECEDING) AS cumulative,
    SUM(hits) OVER () AS total,
    AVG(price / conversion_rate) OVER() AS avgprice,
    FROM searchfact NATURAL JOIN season
    WHERE temporada = 'MEDIA'
)
SELECT itinerary_id,hits FROM t
WHERE ( total - cumulative ) > 0.5 * total 
ORDER BY normalizedPrice ASC, hits DESC
GROUP BY itinerary_id
LIMIT 10;

-- INTERNATIONAL BAJA
-- @block
WITH timeit AS (
    SELECT itinerary_id, 
    MIN(TO_TIMESTAMP(CONCAT(
        CAST(rt.year AS TEXT),'/',
        RIGHT('00' || CAST(rt.month AS TEXT),2),'/',
        RIGHT('00' || CAST(rt.day AS TEXT),2),' ',
        RIGHT('00' || CAST(rt.hour AS TEXT),2),':',
        RIGHT('00' || CAST(rt.minute AS TEXT),2)
    ),'YYYY/MM/DD HH24:MI:SS')) AS deptime
    FROM (itinerary NATURAL JOIN segment NATURAL JOIN leg
        JOIN itinerarydate AS it ON leg.departure_itinerary_date_id = it.itinerary_date_id) AS rt
    GROUP BY itinerary_id
    WHERE domestic = false
), 
season AS(
    SELECT itinerary_id,
    CASE
        WHEN EXTRACT( MONTH from deptime) IN (1,2,3,12) THEN 'ALTA'
        WHEN EXTRACT( MONTH from deptime) IN (4,5,6,7) THEN 'MEDIA'
        WHEN EXTRACT( MONTH from deptime) IN (8,9,10,11) THEN 'BAJA'
    END AS temporada
    FROM timeit
),
t AS (
    SELECT itinerary_id,hits,
    SUM(hits) OVER ( ORDER BY hits DESC ROWS UNBOUNDED PRECEDING) AS cumulative,
    SUM(hits) OVER () AS total,
    AVG(price / conversion_rate) OVER() AS avgprice,
    FROM searchfact NATURAL JOIN season
    WHERE temporada = 'BAJA'
)
SELECT itinerary_id,hits FROM t
WHERE ( total - cumulative ) > 0.5 * total 
ORDER BY normalizedPrice ASC, hits DESC
GROUP BY itinerary_id
LIMIT 10;
