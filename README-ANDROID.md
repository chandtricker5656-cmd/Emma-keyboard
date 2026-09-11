# 𝐄𝐌𝐌𝐀 𝐊𝐄𝐘𝐁𝐎𝐀𝐑𝐃 — Real Android System Keyboard

This is an Android IME project that wraps the Emma Keyboard HTML UI in a native `InputMethodService`.

## What it does
- Appears in Android keyboard settings as **𝐄𝐌𝐌𝐀 𝐊𝐄𝐘𝐁𝐎𝐀𝐑𝐃**
- Can be selected as the active keyboard.
- Sends typed characters to the focused app through Android `InputConnection`.
- Works system-wide in normal text fields, including WhatsApp, Messenger, Facebook, TikTok, Chrome, etc., subject to each app's text-field behavior.
- Provides native haptic bridge support.
- Keeps the web UI local; no keystroke telemetry is added.

## Build without Termux
1. Upload this project to GitHub.
2. Open **Actions**.
3. Run **Build Emma Keyboard APK**.
4. Download the generated `Emma-Keyboard-debug` artifact.
5. Install the APK on Android.
6. Android Settings → System/Keyboard → On-screen keyboard → enable **𝐄𝐌𝐌𝐀 𝐊𝐄𝐘𝐁𝐎𝐀𝐑𝐃**.
7. Select Emma Keyboard as the active keyboard.

## Important
HTML alone cannot become a system keyboard. This project includes the native Android `InputMethodService` required for system-wide typing.

Voice input, full Android clipboard access, advanced translation APIs, and some hardware-specific haptics require native Android implementations/permissions or a backend. The browser version's limitations do not magically disappear inside a WebView.
