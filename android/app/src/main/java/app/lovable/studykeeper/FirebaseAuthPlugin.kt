package app.lovable.studykeeper

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.JSObject
import com.google.firebase.auth.FirebaseAuth

@CapacitorPlugin(name = "FirebaseAuth")
class FirebaseAuthPlugin : Plugin() {
    private lateinit var auth: FirebaseAuth

    override fun load() {
        auth = FirebaseAuth.getInstance()
    }

    @PluginMethod
    fun getCurrentUser(call: PluginCall) {
        val user = auth.currentUser
        val result = JSObject()
        if (user != null) {
            result.put("uid", user.uid)
            result.put("email", user.email ?: "")
            result.put("isLoggedIn", true)
        } else {
            result.put("isLoggedIn", false)
        }
        call.resolve(result)
    }

    @PluginMethod
    fun signUp(call: PluginCall) {
        val email = call.getString("email") ?: run {
            call.reject("Email is required")
            return
        }
        val password = call.getString("password") ?: run {
            call.reject("Password is required")
            return
        }

        activity.runOnUiThread {
            auth.createUserWithEmailAndPassword(email, password)
                .addOnCompleteListener(activity) { task ->
                    if (task.isSuccessful) {
                        val user = auth.currentUser
                        val result = JSObject()
                        result.put("uid", user?.uid ?: "")
                        result.put("email", user?.email ?: "")
                        result.put("isLoggedIn", true)
                        call.resolve(result)
                    } else {
                        call.reject(task.exception?.message ?: "Sign up failed")
                    }
                }
        }
    }

    @PluginMethod
    fun signIn(call: PluginCall) {
        val email = call.getString("email") ?: run {
            call.reject("Email is required")
            return
        }
        val password = call.getString("password") ?: run {
            call.reject("Password is required")
            return
        }

        activity.runOnUiThread {
            auth.signInWithEmailAndPassword(email, password)
                .addOnCompleteListener(activity) { task ->
                    if (task.isSuccessful) {
                        val user = auth.currentUser
                        val result = JSObject()
                        result.put("uid", user?.uid ?: "")
                        result.put("email", user?.email ?: "")
                        result.put("isLoggedIn", true)
                        call.resolve(result)
                    } else {
                        call.reject(task.exception?.message ?: "Sign in failed")
                    }
                }
        }
    }

    @PluginMethod
    fun signOut(call: PluginCall) {
        auth.signOut()
        val result = JSObject()
        result.put("success", true)
        call.resolve(result)
    }
}
