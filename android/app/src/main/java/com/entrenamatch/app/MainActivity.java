package com.entrenamatch.app;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;
import com.google.firebase.crashlytics.FirebaseCrashlytics;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "EntrenaMatch";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(EntrenamatchHealthPlugin.class);
        registerPlugin(EntrenamatchMicrophonePlugin.class);
        super.onCreate(savedInstanceState);
        // Crashlytics requires Firebase native init (google-services.json at build time).
        // Never crash cold start if Firebase is missing (e.g. CI build without the json secret).
        try {
            if (FirebaseApp.getApps(this).isEmpty()) {
                FirebaseApp.initializeApp(this);
            }
            FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(true);
        } catch (Exception e) {
            Log.w(TAG, "Crashlytics skipped — Firebase not configured in this build", e);
        }
    }
}
