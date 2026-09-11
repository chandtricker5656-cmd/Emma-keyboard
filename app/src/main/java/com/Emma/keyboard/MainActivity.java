package com.emma.keyboard;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.view.inputmethod.InputMethodManager;
import android.content.Context;

public class MainActivity extends Activity {
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        setContentView(new android.webkit.WebView(this));
        android.webkit.WebView w = (android.webkit.WebView)findViewById(android.R.id.content);
        // Keep launcher minimal; users enable/select Emma Keyboard in Android Settings.
    }
}
