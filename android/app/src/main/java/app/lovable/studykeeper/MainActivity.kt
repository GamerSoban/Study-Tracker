package app.lovable.studykeeper

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase

class MainActivity : BridgeActivity() {
    private lateinit var auth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(StudyWidgetPlugin::class.java)
        super.onCreate(savedInstanceState)

        // Initialize Firebase Auth
        auth = Firebase.auth

        // Check if user is already signed in
        val currentUser = auth.currentUser
        if (currentUser != null) {
            // User is signed in
        }
    }
}
