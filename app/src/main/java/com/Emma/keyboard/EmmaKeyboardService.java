package com.emma.keyboard;

import android.inputmethodservice.InputMethodService;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.content.Context;

public class EmmaKeyboardService extends InputMethodService {
    private WebView webView;

    @Override
    public View onCreateInputView() {
        webView = new WebView(this);
        webView.setBackgroundColor(0x00000000);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setBuiltInZoomControls(false);
        webView.addJavascriptInterface(new Bridge(), "AndroidBridge");
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("file:///android_asset/index.html");
        return webView;
    }

    private class Bridge {
        @JavascriptInterface public boolean isNativeKeyboard() { return true; }

        @JavascriptInterface public void commitText(String text) {
            if (text == null) return;
            getCurrentInputConnection().commitText(text, 1);
        }

        @JavascriptInterface public void deleteBackward() {
            if (getCurrentInputConnection() != null) {
                getCurrentInputConnection().deleteSurroundingText(1, 0);
            }
        }

        @JavascriptInterface public void performEnter() {
            if (getCurrentInputConnection() != null) {
                getCurrentInputConnection().sendKeyEvent(
                    new android.view.KeyEvent(android.view.KeyEvent.ACTION_DOWN, android.view.KeyEvent.KEYCODE_ENTER));
                getCurrentInputConnection().sendKeyEvent(
                    new android.view.KeyEvent(android.view.KeyEvent.ACTION_UP, android.view.KeyEvent.KEYCODE_ENTER));
            }
        }

        @JavascriptInterface public void haptic() {
            Vibrator v = (Vibrator)getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null && v.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(12, 45));
                else v.vibrate(12);
            }
        }
    }

    @Override public void onDestroy() {
        if (webView != null) webView.destroy();
        webView = null;
        super.onDestroy();
    }
}
