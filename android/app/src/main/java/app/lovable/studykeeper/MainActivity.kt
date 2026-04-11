package app.lovable.studykeeper

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import com.google.firebase.auth.FirebaseAuth

class MainActivity : BridgeActivity() {
    private lateinit var auth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(StudyWidgetPlugin::class.java)
        registerPlugin(FirebaseAuthPlugin::class.java)
        registerPlugin(FirestoreSyncPlugin::class.java)
        super.onCreate(savedInstanceState)

        auth = FirebaseAuth.getInstance()
    }
}
