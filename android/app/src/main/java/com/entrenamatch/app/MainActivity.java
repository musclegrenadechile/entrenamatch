package com.entrenamatch.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.crashlytics.FirebaseCrashlytics;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Initialize / enable Firebase Crashlytics for native + uncaught errors.
        // Collection is on by default in release, but explicit here for control.
        // For production, you may want to gate it behind a setting or build type.
        FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(true);
    }
}
