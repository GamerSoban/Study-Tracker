package app.lovable.studykeeper

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "StudyWidget")
class StudyWidgetPlugin : Plugin() {

    @PluginMethod
    fun updateWidget(call: PluginCall) {
        val studied = call.getInt("totalStudied", 0) ?: 0
        val wasted = call.getInt("totalWasted", 0) ?: 0
        val breaks = call.getInt("totalBreaks", 0) ?: 0
        val sessions = call.getInt("totalSessions", 0) ?: 0

        val context = activity.applicationContext
        StudyWidgetProvider.updateData(context, studied, wasted, breaks, sessions)

        call.resolve()
    }
}
