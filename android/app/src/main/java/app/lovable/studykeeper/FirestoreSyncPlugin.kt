package app.lovable.studykeeper

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.JSObject
import com.getcapacitor.JSArray
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import org.json.JSONObject

@CapacitorPlugin(name = "FirestoreSync")
class FirestoreSyncPlugin : Plugin() {
    private lateinit var db: FirebaseFirestore

    override fun load() {
        db = FirebaseFirestore.getInstance()
    }

    private fun getUserId(): String? {
        return FirebaseAuth.getInstance().currentUser?.uid
    }

    @PluginMethod
    fun uploadSessions(call: PluginCall) {
        val uid = getUserId() ?: run {
            call.reject("Not authenticated")
            return
        }
        val sessionsArray = call.getArray("sessions") ?: run {
            call.reject("Sessions data is required")
            return
        }

        val batch = db.batch()
        val collectionRef = db.collection("users").document(uid).collection("sessions")

        for (i in 0 until sessionsArray.length()) {
            val sessionJson = sessionsArray.getJSONObject(i)
            val sessionId = sessionJson.getString("id")
            val docRef = collectionRef.document(sessionId)
            val data = hashMapOf<String, Any>()
            val keys = sessionJson.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                data[key] = sessionJson.get(key)
            }
            batch.set(docRef, data)
        }

        batch.commit()
            .addOnSuccessListener {
                val result = JSObject()
                result.put("success", true)
                call.resolve(result)
            }
            .addOnFailureListener { e ->
                call.reject(e.message ?: "Upload failed")
            }
    }

    @PluginMethod
    fun downloadSessions(call: PluginCall) {
        val uid = getUserId() ?: run {
            call.reject("Not authenticated")
            return
        }

        db.collection("users").document(uid).collection("sessions")
            .get()
            .addOnSuccessListener { querySnapshot ->
                val sessions = JSArray()
                for (doc in querySnapshot.documents) {
                    val data = doc.data ?: continue
                    val sessionObj = JSObject()
                    for ((key, value) in data) {
                        sessionObj.put(key, value)
                    }
                    sessions.put(sessionObj)
                }
                val result = JSObject()
                result.put("sessions", sessions)
                call.resolve(result)
            }
            .addOnFailureListener { e ->
                call.reject(e.message ?: "Download failed")
            }
    }

    @PluginMethod
    fun deleteSession(call: PluginCall) {
        val uid = getUserId() ?: run {
            call.reject("Not authenticated")
            return
        }
        val sessionId = call.getString("sessionId") ?: run {
            call.reject("Session ID is required")
            return
        }

        db.collection("users").document(uid).collection("sessions")
            .document(sessionId)
            .delete()
            .addOnSuccessListener {
                val result = JSObject()
                result.put("success", true)
                call.resolve(result)
            }
            .addOnFailureListener { e ->
                call.reject(e.message ?: "Delete failed")
            }
    }

    @PluginMethod
    fun deleteAllSessions(call: PluginCall) {
        val uid = getUserId() ?: run {
            call.reject("Not authenticated")
            return
        }

        val collectionRef = db.collection("users").document(uid).collection("sessions")
        collectionRef.get()
            .addOnSuccessListener { querySnapshot ->
                val batch = db.batch()
                for (doc in querySnapshot.documents) {
                    batch.delete(doc.reference)
                }
                batch.commit()
                    .addOnSuccessListener {
                        val result = JSObject()
                        result.put("success", true)
                        call.resolve(result)
                    }
                    .addOnFailureListener { e ->
                        call.reject(e.message ?: "Delete all failed")
                    }
            }
            .addOnFailureListener { e ->
                call.reject(e.message ?: "Failed to fetch sessions for deletion")
            }
    }
}
