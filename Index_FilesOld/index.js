// import React, { useEffect, useRef, useState } from 'react';
// import { BackHandler, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
// import { WebView } from 'react-native-webview';

// export default function App() {
//   const isDarkMode = useColorScheme() === 'dark';
//   const webViewRef = useRef(null);
//   const [canGoBack, setCanGoBack] = useState(false);

//   useEffect(() => {
//     const onBackPress = () => {
//       if (canGoBack && webViewRef.current) {
//         webViewRef.current.goBack();
//         return true; // prevent closing the app
//       }
//       return false; // allow closing the app
//     };

//     const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
//     return () => backHandler.remove();
//   }, [canGoBack]);

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <WebView
//         ref={webViewRef}
//         source={{ uri: 'https://customer.air2o.net/' }}
//         style={{ flex: 1 }}
//         onNavigationStateChange={(navState) => {
//           setCanGoBack(navState.canGoBack);
//         }}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });



import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Platform, StatusBar, View } from "react-native";
import { WebView } from "react-native-webview";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [fcmToken, setFcmToken] = useState(null); // Store Firebase FCM token
  const webViewRef = useRef(null);

  const notificationListener = useRef();
  const responseListener = useRef();

  // ✅ Calculate safe top padding for Android StatusBar
  const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0;
  const reducedPadding = statusBarHeight > 30 ? statusBarHeight - 30 : 0;

  // ✅ Derived user ID for injection (delegate_id or customer_id)
  const userId = user?.data?.delegate_id || user?.data?.customer_id || "";

  // ✅ Check stored user when app starts
  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error retrieving user data:", error);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  // ✅ Handle Android hardware back button
  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [canGoBack]);

  // ✅ Handle WebView message for login
  const handleMessage = async (event) => {
    const userData = event.nativeEvent.data;
    try {
      // Debugging to see what is being received
      console.log("Received message from WebView:", userData);

      if (userData && userData !== "null") {
        const parsedUserData = JSON.parse(userData);
        // Only proceed if login successful
        if (parsedUserData.status === "success") {
          // Save entire response to AsyncStorage
          await AsyncStorage.setItem("user", userData);
          setUser(parsedUserData);

          // Navigate WebView based on user type (delegate or customer) + permissions
          if (parsedUserData.data.delegate_id) {
            // User is a delegate
            const targetPath = parsedUserData.data.hasMonitorPermission
              ? "/delegate-machinescreen1"
              : "/delegate-home";
            webViewRef.current?.injectJavaScript(`
              if (window.location.pathname !== "${targetPath}") {
                window.location.href = "${targetPath}";
              }
              true;
            `);
          } else if (parsedUserData.data.customer_id) {
            // User is a customer, navigate to customer machines screen
            webViewRef.current?.injectJavaScript(`
              if (window.location.pathname !== "/machinescreen1") {
                window.location.href = "/machinescreen1";
              }
              true;
            `);
          }
        }
      } else {
        // If no user data, clear the user and redirect to login
        await AsyncStorage.removeItem("user");
        setUser(null);
        webViewRef.current?.injectJavaScript(`
          if (window.location.pathname !== "/") {
            window.location.href = "/";
          }
          true;
        `);
      }
    } catch (error) {
      console.error("Error handling WebView message:", error);
    }
  };

  // ✅ FCM token fetching and notification handling
  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('new_emails', {
        name: 'New Emails',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'my_sound_file.wav', // must match file name in /assets/sounds
      });
    }
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setFcmToken(token);
        console.log("Firebase FCM Token:", token);

        // Inject the token into WebView for later use
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            window.fcmToken = "${token}";
            true;
          `);
        }
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log("Notification response:", data);
      if (data.destinationPath && webViewRef.current) {
        // ✅ Set a persistent flag in localStorage before navigating to prevent auto-redirect on loadEnd
        webViewRef.current.injectJavaScript(`
          localStorage.setItem('fromNotification', 'true');
          window.location.href = "${data.destinationPath}";
          true;
        `);
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []); // Removed invalid dependency; re-run if needed on user change

  // Request permission and get the FCM token
  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
      alert("Must use physical device for push notifications");
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token!");
      return null;
    }

    // Get the Firebase FCM token
    try {
      const token = await messaging().getToken(); // Get Firebase FCM token
      return token;
    } catch (error) {
      console.error("Error getting Firebase FCM token:", error);
      return null;
    }
  }

  // Inject initial JavaScript into WebView (re-injects on user/fcmToken change via useEffect if needed)
  useEffect(() => {
    if (webViewRef.current && (fcmToken || userId)) {
      webViewRef.current.injectJavaScript(`
        window.fcmToken = "${fcmToken || ""}";
        window.userId = "${userId}";
        true;
      `);
    }
  }, [fcmToken, userId]);

  // ✅ Show loader while checking AsyncStorage
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // ✅ Set initial URL based on login state (direct to appropriate page if user exists, including permissions)
  let initialUrl = "/";
  if (user && user.status === "success") {
    if (user.data.delegate_id) {
      initialUrl = user.data.hasMonitorPermission ? "/delegate-machinescreen1" : "/delegate-home";
    } else if (user.data.customer_id) {
      initialUrl = "/machinescreen1";
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <WebView
        ref={webViewRef}
        source={{ uri: `https://customer.air2o.net${initialUrl}` }}
        style={{ flex: 1 }}
        injectedJavaScript={`
          window.fcmToken = "${fcmToken || ""}";
          window.userId = "${userId}";
          true;
        `}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}  // Unified message handler
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("WebView error:", nativeEvent);
        }}
        onLoadEnd={() => {
          webViewRef.current?.injectJavaScript(`
            (function() {
              const meta = document.createElement('meta');
              meta.setAttribute('name', 'viewport');
              meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
              document.head.appendChild(meta);
              
              // ✅ Skip postMessage if navigated from notification to avoid auto-redirect
              if (localStorage.getItem('fromNotification') !== 'true') {
                const user = localStorage.getItem("user");
                window.ReactNativeWebView.postMessage(user);
              } else {
                // Reset the flag after checking
                localStorage.removeItem('fromNotification');
              }
            })();
            true;
          `);
        }}
      />
    </View>
  );
}