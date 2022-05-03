package com.fitevo;

import android.os.Bundle;
import com.facebook.react.ReactActivity;
import android.content.Intent;
import android.content.res.Configuration;

// react-native-splash-screen >= 0.3.1
// import org.devio.rn.splashscreen.SplashScreen; // here

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "DragonDappRN";
  }

  // for react-native-screens
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // SplashScreen.show(this);  // here
    super.onCreate(null);
  }

  // for react-native-appearance
  @Override
    public void onConfigurationChanged(Configuration newConfig) {
      super.onConfigurationChanged(newConfig);
      Intent intent = new Intent("onConfigurationChanged");
      intent.putExtra("newConfig", newConfig);
      sendBroadcast(intent);
    }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
  }
}
