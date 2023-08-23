package com.natably.android;

import android.content.Intent;

import com.reactnativenavigation.NavigationActivity;

public class MainActivity extends NavigationActivity {

    protected String getMainComponentName() {
        return "Natably";
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }
  
}
