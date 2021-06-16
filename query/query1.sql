-- ¿Cuáles son las rutas que representan el top 50% de las búsquedas realizadas a nivel nacional e internacional?
WITH DomesticFlights AS (
	SELECT
		I.itinerary_id AS Itinerary,
		SF.hits AS Hits,
		SUM(SF.hits) OVER(
			ORDER BY SF.hits DESC
			ROWS UNBOUNDED PRECEDING
		)::decimal AS AccumulatedHits,
		SUM(SF.hits) OVER() AS TotalHits
	FROM SearchFact AS SF INNER JOIN Itinerary AS I
		ON SF.itinerary_id = I.itinerary_id
	WHERE I.domestic = true
),
SummaryOfSearchs AS (
	SELECT
		DF.Itinerary AS Itinerary,
		DF.Hits AS Hits,
		DF.AccumulatedHits AS AccumulatedHits,
		(100 * DF.AccumulatedHits / DF.TotalHits) AS Percentage
	FROM DomesticFlights AS DF
)
SELECT SOS.Itinerary, SOS.Hits, SOS.Percentage
FROM SummaryOfSearchs AS SOS
WHERE SOS.Percentage <= (
	SELECT MIN(innerSOS.Percentage) AS Percentage
	FROM SummaryOfSearchs AS innerSOS
	WHERE 50 <= innerSOS.Percentage);
