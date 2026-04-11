package app.lovable.studykeeper

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import com.google.firebase.auth.FirebaseAuth
import com.capacitorjs.plugins.filesystem.FilesystemPlugin
import com.capacitorjs.plugins.share.SharePlugin

class MainActivity : BridgeActivity() {
    private lateinit var auth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(StudyWidgetPlugin::class.java)
        registerPlugin(FirebaseAuthPlugin::class.java)
        registerPlugin(FirestoreSyncPlugin::class.java)
        registerPlugin(FilesystemPlugin::class.java)
        registerPlugin(SharePlugin::class.java)
        super.onCreate(savedInstanceState)

        auth = FirebaseAuth.getInstance()
    }
}
