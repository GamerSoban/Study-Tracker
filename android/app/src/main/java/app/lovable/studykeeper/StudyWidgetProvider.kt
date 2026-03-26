package app.lovable.studykeeper

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class StudyWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        if (intent.action == ACTION_REFRESH) {
            updateAllWidgets(context)
        }
    }

    companion object {
        private const val PREFS_NAME = "study_widget_prefs"
        private const val KEY_STUDIED = "total_studied"
        private const val KEY_WASTED = "total_wasted"
        private const val KEY_BREAKS = "total_breaks"
        private const val KEY_SESSIONS = "total_sessions"
        private const val ACTION_REFRESH = "app.lovable.studykeeper.action.REFRESH_WIDGET"

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val totalStudied = prefs.getInt(KEY_STUDIED, 0)
            val totalWasted = prefs.getInt(KEY_WASTED, 0)
            val totalBreaks = prefs.getInt(KEY_BREAKS, 0)
            val totalSessions = prefs.getInt(KEY_SESSIONS, 0)

            val views = RemoteViews(context.packageName, R.layout.widget_study_tracker)
            views.setTextViewText(R.id.widget_studied_value, formatMinutes(totalStudied))
            views.setTextViewText(R.id.widget_wasted_value, formatMinutes(totalWasted))
            views.setTextViewText(R.id.widget_breaks_value, formatMinutes(totalBreaks))
            views.setTextViewText(R.id.widget_sessions_value, totalSessions.toString())

            val refreshIntent = Intent(context, StudyWidgetProvider::class.java).apply {
                action = ACTION_REFRESH
            }
            val refreshPendingIntent = PendingIntent.getBroadcast(
                context,
                appWidgetId + 10_000,
                refreshIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_refresh_button, refreshPendingIntent)

            // Add click intent to open the app
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                appWidgetId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        fun updateData(context: Context, studied: Int, wasted: Int, breaks: Int, sessions: Int) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit()
                .putInt(KEY_STUDIED, studied)
                .putInt(KEY_WASTED, wasted)
                .putInt(KEY_BREAKS, breaks)
                .putInt(KEY_SESSIONS, sessions)
                .apply()

            updateAllWidgets(context)
        }

        private fun updateAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val widgetComponent = ComponentName(context, StudyWidgetProvider::class.java)
            val widgetIds = appWidgetManager.getAppWidgetIds(widgetComponent)
            for (id in widgetIds) {
                updateAppWidget(context, appWidgetManager, id)
            }
        }

        private fun formatMinutes(mins: Int): String {
            val h = mins / 60
            val m = mins % 60
            return if (h == 0) "${m}m" else "${h}h ${m}m"
        }
    }
}
