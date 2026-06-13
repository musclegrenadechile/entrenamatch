package com.entrenamatch.app

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import java.time.Duration
import java.time.Instant
import java.time.format.DateTimeParseException
import kotlinx.coroutines.CancellationException

/**
 * Fast Health Connect day snapshot — no per-workout calorie aggregation (Samsung HC stalls on that).
 */
object WearableDayProbe {

    suspend fun probe(client: HealthConnectClient, startDate: String, endDate: String): JSObject {
        val start = parseInstant(startDate)
        val end = parseInstant(endDate)
        val timeRange = TimeRangeFilter.between(start, end)

        var workoutCount = 0
        var exerciseMinutes = 0
        val sources = LinkedHashSet<String>()
        var exerciseError: String? = null

        try {
            val response = client.readRecords(
                ReadRecordsRequest(
                    recordType = ExerciseSessionRecord::class,
                    timeRangeFilter = timeRange,
                    pageSize = 25
                )
            )
            for (record in response.records) {
                val session = record as ExerciseSessionRecord
                workoutCount++
                val mins = Duration.between(session.startTime, session.endTime).toMinutes()
                if (mins > 0) exerciseMinutes += mins.toInt()
                val pkg = session.metadata.dataOrigin.packageName
                if (!pkg.isNullOrBlank()) sources.add(pkg)
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: SecurityException) {
            exerciseError = "exercise_permission_denied"
        } catch (e: Exception) {
            exerciseError = e.message ?: "exercise_read_failed"
        }

        var steps = 0L
        var stepsError: String? = null
        try {
            val agg = client.aggregate(
                AggregateRequest(
                    metrics = setOf(StepsRecord.COUNT_TOTAL),
                    timeRangeFilter = timeRange
                )
            )
            steps = agg[StepsRecord.COUNT_TOTAL] ?: 0L
        } catch (e: CancellationException) {
            throw e
        } catch (e: SecurityException) {
            stepsError = "steps_permission_denied"
        } catch (e: Exception) {
            stepsError = e.message ?: "steps_read_failed"
        }

        var activeCaloriesKcal = 0.0
        var caloriesError: String? = null
        try {
            val agg = client.aggregate(
                AggregateRequest(
                    metrics = setOf(ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL),
                    timeRangeFilter = timeRange
                )
            )
            activeCaloriesKcal =
                agg[ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL]?.inKilocalories ?: 0.0
        } catch (e: CancellationException) {
            throw e
        } catch (e: SecurityException) {
            caloriesError = "calories_permission_denied"
        } catch (e: Exception) {
            caloriesError = e.message ?: "calories_read_failed"
        }

        if (activeCaloriesKcal <= 0.0) {
            try {
                val agg = client.aggregate(
                    AggregateRequest(
                        metrics = setOf(TotalCaloriesBurnedRecord.ENERGY_TOTAL),
                        timeRangeFilter = timeRange
                    )
                )
                activeCaloriesKcal =
                    agg[TotalCaloriesBurnedRecord.ENERGY_TOTAL]?.inKilocalories ?: 0.0
            } catch (_: CancellationException) {
                throw CancellationException()
            } catch (_: Exception) {
                /* optional fallback */
            }
        }

        val sourcesArray = JSArray()
        sources.take(5).forEach { sourcesArray.put(it) }

        return JSObject().apply {
            put("steps", steps.toInt())
            put("activeCaloriesKcal", kotlin.math.round(activeCaloriesKcal).toInt())
            put("exerciseMinutes", exerciseMinutes)
            put("workoutCount", workoutCount)
            put("sources", sourcesArray)
            if (exerciseError != null) put("exerciseError", exerciseError)
            if (stepsError != null) put("stepsError", stepsError)
            if (caloriesError != null) put("caloriesError", caloriesError)
        }
    }

    private fun parseInstant(value: String): Instant {
        return try {
            Instant.parse(value)
        } catch (e: DateTimeParseException) {
            throw IllegalArgumentException("Invalid ISO instant: $value", e)
        }
    }
}
