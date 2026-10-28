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



// import AsyncStorage from "@react-native-async-storage/async-storage";
// import messaging from '@react-native-firebase/messaging';
// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
// import { useEffect, useRef, useState } from "react";
// import { ActivityIndicator, BackHandler, Platform, StatusBar, View } from "react-native";
// import { WebView } from "react-native-webview";
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export default function App() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [canGoBack, setCanGoBack] = useState(false);
//   const [fcmToken, setFcmToken] = useState(null); // Store Firebase FCM token
//   const webViewRef = useRef(null);

//   const notificationListener = useRef();
//   const responseListener = useRef();

//   // ✅ Calculate safe top padding for Android StatusBar
//   const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0;
//   const reducedPadding = statusBarHeight > 30 ? statusBarHeight - 30 : 0;

//   // ✅ Derived user ID for injection (delegate_id or customer_id)
//   const userId = user?.data?.delegate_id || user?.data?.customer_id || "";

//   // ✅ Check stored user when app starts
//   useEffect(() => {
//     const checkUser = async () => {
//       try {
//         const storedUser = await AsyncStorage.getItem("user");
//         if (storedUser) {
//           const parsedUser = JSON.parse(storedUser);
//           setUser(parsedUser);
//         }
//       } catch (error) {
//         console.error("Error retrieving user data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     checkUser();
//   }, []);

//   // ✅ Handle Android hardware back button
//   useEffect(() => {
//     const backAction = () => {
//       if (canGoBack && webViewRef.current) {
//         webViewRef.current.goBack();
//         return true;
//       }
//       return false;
//     };
//     const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
//     return () => backHandler.remove();
//   }, [canGoBack]);

//   // ✅ Handle WebView message for login
//   // const handleMessage = async (event) => {
//   //   const userData = event.nativeEvent.data;
//   //   try {
//   //     // Debugging to see what is being received
//   //     console.log("Received message from WebView:", userData);

//   //     if (userData && userData !== "null") {
//   //       const parsedUserData = JSON.parse(userData);
//   //       // Only proceed if login successful
//   //       if (parsedUserData.status === "success") {
//   //         // Save entire response to AsyncStorage
//   //         await AsyncStorage.setItem("user", userData);
//   //         setUser(parsedUserData);

//   //         // Navigate WebView based on user type (delegate or customer) + permissions
//   //         if (parsedUserData.data.delegate_id) {
//   //           // User is a delegate
//   //           const targetPath = parsedUserData.data.hasMonitorPermission
//   //             ? "/delegate-machinescreen1"
//   //             : "/delegate-home";
//   //           webViewRef.current?.injectJavaScript(`
//   //             if (window.location.pathname !== "${targetPath}") {
//   //               window.location.href = "${targetPath}";
//   //             }
//   //             true;
//   //           `);
//   //         } else if (parsedUserData.data.customer_id) {
//   //           // User is a customer, navigate to customer machines screen
//   //           webViewRef.current?.injectJavaScript(`
//   //             if (window.location.pathname !== "/machinescreen1") {
//   //               window.location.href = "/machinescreen1";
//   //             }
//   //             true;
//   //           `);
//   //         }
//   //       }
//   //     } else {
//   //       // If no user data, clear the user and redirect to login
//   //       await AsyncStorage.removeItem("user");
//   //       setUser(null);
//   //       webViewRef.current?.injectJavaScript(`
//   //         if (window.location.pathname !== "/") {
//   //           window.location.href = "/";
//   //         }
//   //         true;
//   //       `);
//   //     }
//   //   } catch (error) {
//   //     console.error("Error handling WebView message:", error);
//   //   }
//   // };

//   const handleMessage = async (event) => {
//   const userData = event.nativeEvent.data;

//   try {
//     console.log("Received message from WebView:", userData);

//     if (userData && userData !== "null") {
//       const parsedUserData = JSON.parse(userData);

//       if (parsedUserData.status === "success") {
//         // ✅ Store logged in user
//         await AsyncStorage.setItem("user", userData);
//         setUser(parsedUserData);

//         // ❌ DO NOT navigate from React Native.
//         // Let the React application control navigation.
//       }
//     } else {
//       await AsyncStorage.removeItem("user");
//       setUser(null);

//       webViewRef.current?.injectJavaScript(`
//         if (window.location.pathname !== "/") {
//           window.location.href = "/";
//         }
//         true;
//       `);
//     }
//   } catch (error) {
//     console.error("Error handling WebView message:", error);
//   }
// };
//   // ✅ FCM token fetching and notification handling
//   useEffect(() => {
//     if (Platform.OS === 'android') {
//       Notifications.setNotificationChannelAsync('new_emails', {
//         name: 'New Emails',
//         importance: Notifications.AndroidImportance.HIGH,
//         sound: 'my_sound_file.wav', // must match file name in /assets/sounds
//       });
//     }
//     registerForPushNotificationsAsync().then((token) => {
//       if (token) {
//         setFcmToken(token);
//         console.log("Firebase FCM Token:", token);

//         // Inject the token into WebView for later use
//         if (webViewRef.current) {
//           webViewRef.current.injectJavaScript(`
//             window.fcmToken = "${token}";
//             true;
//           `);
//         }
//       }
//     });

//     notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
//       console.log("Notification received:", notification);
//     });

//     responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
//       const data = response.notification.request.content.data;
//       console.log("Notification response:", data);
//       if (data.destinationPath && webViewRef.current) {
//         // ✅ Set a persistent flag in localStorage before navigating to prevent auto-redirect on loadEnd
//         webViewRef.current.injectJavaScript(`
//           localStorage.setItem('fromNotification', 'true');
//           window.location.href = "${data.destinationPath}";
//           true;
//         `);
//       }
//     });

//     return () => {
//       if (notificationListener.current) {
//         Notifications.removeNotificationSubscription(notificationListener.current);
//       }
//       if (responseListener.current) {
//         Notifications.removeNotificationSubscription(responseListener.current);
//       }
//     };
//   }, []); // Removed invalid dependency; re-run if needed on user change

//   // Request permission and get the FCM token
//   async function registerForPushNotificationsAsync() {
//     if (!Device.isDevice) {
//       alert("Must use physical device for push notifications");
//       return null;
//     }

//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") {
//       alert("Failed to get push token!");
//       return null;
//     }

//     // Get the Firebase FCM token
//     try {
//       const token = await messaging().getToken(); // Get Firebase FCM token
//       return token;
//     } catch (error) {
//       console.error("Error getting Firebase FCM token:", error);
//       return null;
//     }
//   }

//   // Inject initial JavaScript into WebView (re-injects on user/fcmToken change via useEffect if needed)
//   useEffect(() => {
//     if (webViewRef.current && (fcmToken || userId)) {
//       webViewRef.current.injectJavaScript(`
//         window.fcmToken = "${fcmToken || ""}";
//         window.userId = "${userId}";
//         true;
//       `);
//     }
//   }, [fcmToken, userId]);

//   // ✅ Show loader while checking AsyncStorage
//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   // ✅ Set initial URL based on login state (direct to appropriate page if user exists, including permissions)
//   let initialUrl = "/";
//   if (user && user.status === "success") {
//     if (user.data.delegate_id) {
//       initialUrl = user.data.hasMonitorPermission ? "/delegate-machinescreen1" : "/delegate-home";
//     } else if (user.data.customer_id) {
//       initialUrl = "/machinescreen1";
//     }
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
//       <WebView
//         ref={webViewRef}
//         source={{ uri: `https://customer.air2o.net${initialUrl}` }}
//         style={{ flex: 1 }}
//         injectedJavaScript={`
//           window.fcmToken = "${fcmToken || ""}";
//           window.userId = "${userId}";
//           true;
//         `}
//         javaScriptEnabled={true}
//         domStorageEnabled={true}
//         onMessage={handleMessage}  // Unified message handler
//         onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
//         onError={(syntheticEvent) => {
//           const { nativeEvent } = syntheticEvent;
//           console.error("WebView error:", nativeEvent);
//         }}
//         onLoadEnd={() => {
//           webViewRef.current?.injectJavaScript(`
//             (function() {
//               const meta = document.createElement('meta');
//               meta.setAttribute('name', 'viewport');
//               meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
//               document.head.appendChild(meta);

//               // ✅ Skip postMessage if navigated from notification to avoid auto-redirect
//               if (localStorage.getItem('fromNotification') !== 'true') {
//                 const user = localStorage.getItem("user");
//                 window.ReactNativeWebView.postMessage(user);
//               } else {
//                 // Reset the flag after checking
//                 localStorage.removeItem('fromNotification');
//               }
//             })();
//             true;
//           `);
//         }}
//       />
//     </View>
//   );
// }

//=======================================================
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import messaging from '@react-native-firebase/messaging';
// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
// import { useEffect, useRef, useState } from "react";

// import {
//   ActivityIndicator,
//   Alert,
//   BackHandler,
//   Platform,
//   StatusBar,
//   View
// } from "react-native";
// import { WebView } from "react-native-webview";
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export default function App() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [canGoBack, setCanGoBack] = useState(false);
//   const [fcmToken, setFcmToken] = useState(null);
//   const webViewRef = useRef(null);
//   const [backPressCount, setBackPressCount] = useState(0);

//   const notificationListener = useRef();
//   const responseListener = useRef();

//   // ✅ Calculate safe top padding for Android StatusBar
//   const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0;
//   const reducedPadding = statusBarHeight > 30 ? statusBarHeight - 30 : 0;

//   // ✅ Derived user ID for injection (delegate_id or customer_id)
//   const userId = user?.data?.delegate_id || user?.data?.customer_id || "";

//   // ✅ Check stored user when app starts
//   useEffect(() => {
//     const checkUser = async () => {
//       try {
//         const storedUser = await AsyncStorage.getItem("user");
//         if (storedUser) {
//           const parsedUser = JSON.parse(storedUser);
//           setUser(parsedUser);
//         }
//       } catch (error) {
//         console.error("Error retrieving user data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     checkUser();
//   }, []);

//   // ✅ Handle Android hardware back button with exit confirmation
//   useEffect(() => {
//     const backAction = () => {
//       if (canGoBack && webViewRef.current) {
//         // If WebView can go back, navigate back in WebView
//         webViewRef.current.goBack();
//         return true;
//       }

//       // If WebView cannot go back, show exit confirmation
//       Alert.alert(
//         "Exit App",
//         "Are you sure you want to close the app?",
//         [
//           {
//             text: "Cancel",
//             onPress: () => setBackPressCount(0),
//             style: "cancel"
//           },
//           {
//             text: "Exit",
//             onPress: () => {
//               setBackPressCount(0);
//               // For Android, exit the app
//               BackHandler.exitApp();
//             },
//             style: "destructive"
//           }
//         ],
//         { cancelable: false }
//       );
//       return true;
//     };

//     const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
//     return () => backHandler.remove();
//   }, [canGoBack]);

//   // ✅ Handle WebView message for login
//   const handleMessage = async (event) => {
//     const userData = event.nativeEvent.data;

//     try {
//       console.log("Received message from WebView:", userData);

//       if (userData && userData !== "null") {
//         const parsedUserData = JSON.parse(userData);

//         if (parsedUserData.status === "success") {
//           // ✅ Store logged in user
//           await AsyncStorage.setItem("user", userData);
//           setUser(parsedUserData);

//           // ❌ DO NOT navigate from React Native.
//           // Let the React application control navigation.
//         }
//       } else {
//         await AsyncStorage.removeItem("user");
//         setUser(null);

//         webViewRef.current?.injectJavaScript(`
//           if (window.location.pathname !== "/") {
//             window.location.href = "/";
//           }
//           true;
//         `);
//       }
//     } catch (error) {
//       console.error("Error handling WebView message:", error);
//     }
//   };

//   // ✅ FCM token fetching and notification handling
//   useEffect(() => {
//     if (Platform.OS === 'android') {
//       Notifications.setNotificationChannelAsync('new_emails', {
//         name: 'New Emails',
//         importance: Notifications.AndroidImportance.HIGH,
//         sound: 'my_sound_file.wav',
//       });
//     }
//     registerForPushNotificationsAsync().then((token) => {
//       if (token) {
//         setFcmToken(token);
//         console.log("Firebase FCM Token:", token);

//         // Inject the token into WebView for later use
//         if (webViewRef.current) {
//           webViewRef.current.injectJavaScript(`
//             window.fcmToken = "${token}";
//             true;
//           `);
//         }
//       }
//     });

//     notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
//       console.log("Notification received:", notification);
//     });

//     responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
//       const data = response.notification.request.content.data;
//       console.log("Notification response:", data);
//       if (data.destinationPath && webViewRef.current) {
//         // ✅ Set a persistent flag in localStorage before navigating to prevent auto-redirect on loadEnd
//         webViewRef.current.injectJavaScript(`
//           localStorage.setItem('fromNotification', 'true');
//           window.location.href = "${data.destinationPath}";
//           true;
//         `);
//       }
//     });

//     return () => {
//       if (notificationListener.current) {
//         Notifications.removeNotificationSubscription(notificationListener.current);
//       }
//       if (responseListener.current) {
//         Notifications.removeNotificationSubscription(responseListener.current);
//       }
//     };
//   }, []);

//   // Request permission and get the FCM token
//   async function registerForPushNotificationsAsync() {
//     if (!Device.isDevice) {
//       alert("Must use physical device for push notifications");
//       return null;
//     }

//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") {
//       alert("Failed to get push token!");
//       return null;
//     }

//     // Get the Firebase FCM token
//     try {
//       const token = await messaging().getToken();
//       return token;
//     } catch (error) {
//       console.error("Error getting Firebase FCM token:", error);
//       return null;
//     }
//   }

//   // Inject initial JavaScript into WebView
//   useEffect(() => {
//     if (webViewRef.current && (fcmToken || userId)) {
//       webViewRef.current.injectJavaScript(`
//         window.fcmToken = "${fcmToken || ""}";
//         window.userId = "${userId}";
//         true;
//       `);
//     }
//   }, [fcmToken, userId]);

//   // ✅ Show loader while checking AsyncStorage
//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   // ✅ Set initial URL based on login state
//   let initialUrl = "/";
//   if (user && user.status === "success") {
//     if (user.data.delegate_id) {
//       initialUrl = user.data.hasMonitorPermission ? "/delegate-machinescreen1" : "/delegate-home";
//     } else if (user.data.customer_id) {
//       initialUrl = "/machinescreen1";
//     }
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
//       <WebView
//         ref={webViewRef}
//         source={{ uri: `https://customer.air2o.net${initialUrl}` }}
//         source={{ uri: `https://testcustomer.air2o.net${initialUrl}` }}
//         style={{ flex: 1 }}
//         injectedJavaScript={`
//           window.fcmToken = "${fcmToken || ""}";
//           window.userId = "${userId}";
//           true;
//         `}
//         javaScriptEnabled={true}
//         domStorageEnabled={true}
//         onMessage={handleMessage}
//         onNavigationStateChange={(navState) => {
//           setCanGoBack(navState.canGoBack);
//           // Reset back press count when navigation changes
//           setBackPressCount(0);
//         }}
//         onError={(syntheticEvent) => {
//           const { nativeEvent } = syntheticEvent;
//           console.error("WebView error:", nativeEvent);
//         }}
//         onLoadEnd={() => {
//           webViewRef.current?.injectJavaScript(`
//             (function() {
//               const meta = document.createElement('meta');
//               meta.setAttribute('name', 'viewport');
//               meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
//               document.head.appendChild(meta);

//               // ✅ Skip postMessage if navigated from notification to avoid auto-redirect
//               if (localStorage.getItem('fromNotification') !== 'true') {
//                 const user = localStorage.getItem("user");
//                 window.ReactNativeWebView.postMessage(user);
//               } else {
//                 // Reset the flag after checking
//                 localStorage.removeItem('fromNotification');
//               }
//             })();
//             true;
//           `);
//         }}
//       />
//     </View>
//   );
// }


//=======================================================

// import {
//   PermissionsAndroid
// } from "react-native";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export default function App() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [canGoBack, setCanGoBack] = useState(false);
//   const [fcmToken, setFcmToken] = useState(null);

//   // ---------------------------------------------------------
//   // MICROPHONE PERMISSION STATE
//   // ---------------------------------------------------------
//   const [microphonePermissionChecked, setMicrophonePermissionChecked] =
//     useState(false);

//   const [microphonePermissionGranted, setMicrophonePermissionGranted] =
//     useState(false);

//   const webViewRef = useRef(null);
//   const [backPressCount, setBackPressCount] = useState(0);

//   const notificationListener = useRef();
//   const responseListener = useRef();

//   // ---------------------------------------------------------
//   // Calculate safe top padding for Android StatusBar
//   // ---------------------------------------------------------
//   const statusBarHeight =
//     Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0;

//   const reducedPadding = statusBarHeight > 30 ? statusBarHeight - 30 : 0;

//   // ---------------------------------------------------------
//   // Derived user ID for injection
//   // delegate_id OR customer_id
//   // ---------------------------------------------------------
//   const userId =
//     user?.data?.delegate_id || user?.data?.customer_id || "";

//   // =========================================================
//   // CHECK STORED USER WHEN APP STARTS
//   // =========================================================
//   useEffect(() => {
//     const checkUser = async () => {
//       try {
//         const storedUser = await AsyncStorage.getItem("user");

//         if (storedUser) {
//           const parsedUser = JSON.parse(storedUser);
//           setUser(parsedUser);
//         }
//       } catch (error) {
//         console.error("Error retrieving user data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkUser();
//   }, []);

//   // =========================================================
//   // REQUEST MICROPHONE PERMISSION
//   // =========================================================
//   useEffect(() => {
//     const requestMicrophonePermission = async () => {
//       // iOS / other platforms
//       if (Platform.OS !== "android") {
//         setMicrophonePermissionGranted(true);
//         setMicrophonePermissionChecked(true);
//         return;
//       }

//       try {
//         const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;

//         // ---------------------------------------------------
//         // Check if permission is already granted
//         // ---------------------------------------------------
//         const alreadyGranted = await PermissionsAndroid.check(
//           permission
//         );

//         if (alreadyGranted) {
//           console.log("Microphone permission already granted.");

//           setMicrophonePermissionGranted(true);
//           setMicrophonePermissionChecked(true);

//           return;
//         }

//         // ---------------------------------------------------
//         // Ask Android for microphone permission
//         // ---------------------------------------------------
//         console.log("Requesting microphone permission...");

//         const result = await PermissionsAndroid.request(permission, {
//           title: "Microphone Permission",
//           message:
//             "Air2o needs access to your microphone for voice and speech features.",
//           buttonPositive: "Allow",
//           buttonNegative: "Deny",
//         });

//         console.log("Microphone permission result:", result);

//         if (result === PermissionsAndroid.RESULTS.GRANTED) {
//           console.log("Microphone permission GRANTED.");

//           setMicrophonePermissionGranted(true);
//         } else {
//           console.log(
//             "Microphone permission NOT granted:",
//             result
//           );

//           setMicrophonePermissionGranted(false);
//         }

//         setMicrophonePermissionChecked(true);
//       } catch (error) {
//         console.error(
//           "Error requesting microphone permission:",
//           error
//         );

//         setMicrophonePermissionGranted(false);
//         setMicrophonePermissionChecked(true);
//       }
//     };

//     requestMicrophonePermission();
//   }, []);

//   // =========================================================
//   // HANDLE ANDROID HARDWARE BACK BUTTON
//   // =========================================================
//   useEffect(() => {
//     const backAction = () => {
//       if (canGoBack && webViewRef.current) {
//         webViewRef.current.goBack();
//         return true;
//       }

//       Alert.alert(
//         "Exit App",
//         "Are you sure you want to close the app?",
//         [
//           {
//             text: "Cancel",
//             onPress: () => setBackPressCount(0),
//             style: "cancel",
//           },
//           {
//             text: "Exit",
//             onPress: () => {
//               setBackPressCount(0);
//               BackHandler.exitApp();
//             },
//             style: "destructive",
//           },
//         ],
//         {
//           cancelable: false,
//         }
//       );

//       return true;
//     };

//     const backHandler = BackHandler.addEventListener(
//       "hardwareBackPress",
//       backAction
//     );

//     return () => backHandler.remove();
//   }, [canGoBack]);

//   // =========================================================
//   // HANDLE WEBVIEW MESSAGE FOR LOGIN
//   // =========================================================
//   const handleMessage = async (event) => {
//     const userData = event.nativeEvent.data;

//     try {
//       console.log("Received message from WebView:", userData);

//       if (userData && userData !== "null") {
//         const parsedUserData = JSON.parse(userData);

//         if (parsedUserData.status === "success") {
//           // Store logged in user
//           await AsyncStorage.setItem("user", userData);

//           setUser(parsedUserData);

//           // Let React application control navigation.
//         }
//       } else {
//         await AsyncStorage.removeItem("user");

//         setUser(null);

//         webViewRef.current?.injectJavaScript(`
//           if (window.location.pathname !== "/") {
//             window.location.href = "/";
//           }

//           true;
//         `);
//       }
//     } catch (error) {
//       console.error(
//         "Error handling WebView message:",
//         error
//       );
//     }
//   };

//   // =========================================================
//   // FCM TOKEN FETCHING + NOTIFICATION HANDLING
//   // =========================================================
//   useEffect(() => {
//     if (Platform.OS === "android") {
//       Notifications.setNotificationChannelAsync("new_emails", {
//         name: "New Emails",
//         importance: Notifications.AndroidImportance.HIGH,
//         sound: "my_sound_file.wav",
//       });
//     }

//     registerForPushNotificationsAsync().then((token) => {
//       if (token) {
//         setFcmToken(token);

//         console.log("Firebase FCM Token:", token);

//         // Inject token into WebView
//         if (webViewRef.current) {
//           webViewRef.current.injectJavaScript(`
//             window.fcmToken = "${token}";
//             true;
//           `);
//         }
//       }
//     });

//     notificationListener.current =
//       Notifications.addNotificationReceivedListener(
//         (notification) => {
//           console.log(
//             "Notification received:",
//             notification
//           );
//         }
//       );

//     responseListener.current =
//       Notifications.addNotificationResponseReceivedListener(
//         (response) => {
//           const data =
//             response.notification.request.content.data;

//           console.log("Notification response:", data);

//           if (
//             data.destinationPath &&
//             webViewRef.current
//           ) {
//             webViewRef.current.injectJavaScript(`
//               localStorage.setItem(
//                 'fromNotification',
//                 'true'
//               );

//               window.location.href =
//                 "${data.destinationPath}";

//               true;
//             `);
//           }
//         }
//       );

//     return () => {
//       if (notificationListener.current) {
//         Notifications.removeNotificationSubscription(
//           notificationListener.current
//         );
//       }

//       if (responseListener.current) {
//         Notifications.removeNotificationSubscription(
//           responseListener.current
//         );
//       }
//     };
//   }, []);

//   // =========================================================
//   // REQUEST PUSH NOTIFICATION PERMISSION + FCM TOKEN
//   // =========================================================
//   async function registerForPushNotificationsAsync() {
//     if (!Device.isDevice) {
//       alert(
//         "Must use physical device for push notifications"
//       );

//       return null;
//     }

//     const { status: existingStatus } =
//       await Notifications.getPermissionsAsync();

//     let finalStatus = existingStatus;

//     if (existingStatus !== "granted") {
//       const { status } =
//         await Notifications.requestPermissionsAsync();

//       finalStatus = status;
//     }

//     if (finalStatus !== "granted") {
//       alert("Failed to get push token!");

//       return null;
//     }

//     // Get Firebase FCM token
//     try {
//       const token = await messaging().getToken();

//       return token;
//     } catch (error) {
//       console.error(
//         "Error getting Firebase FCM token:",
//         error
//       );

//       return null;
//     }
//   }

//   // =========================================================
//   // INJECT INITIAL JAVASCRIPT INTO WEBVIEW
//   // =========================================================
//   useEffect(() => {
//     if (
//       webViewRef.current &&
//       (fcmToken || userId)
//     ) {
//       webViewRef.current.injectJavaScript(`
//         window.fcmToken = "${fcmToken || ""}";
//         window.userId = "${userId}";

//         true;
//       `);
//     }
//   }, [fcmToken, userId]);

//   // =========================================================
//   // WAIT FOR BOTH:
//   // 1. AsyncStorage user check
//   // 2. Microphone permission check
//   // =========================================================
//   if (
//     loading ||
//     !microphonePermissionChecked
//   ) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: "center",
//           alignItems: "center",
//         }}
//       >
//         <ActivityIndicator
//           size="large"
//           color="#0000ff"
//         />
//       </View>
//     );
//   }

//   // =========================================================
//   // SET INITIAL URL BASED ON LOGIN STATE
//   // =========================================================
//   let initialUrl = "/";

//   if (user && user.status === "success") {
//     if (user.data.delegate_id) {
//       initialUrl = user.data.hasMonitorPermission
//         ? "/delegate-machinescreen1"
//         : "/delegate-home";
//     } else if (user.data.customer_id) {
//       initialUrl = "/machinescreen1";
//     }
//   }

//   // =========================================================
//   // WEBVIEW
//   // =========================================================
//   return (
//     <View style={{ flex: 1 }}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor="#ffffff"
//       />

//       <WebView
//         ref={webViewRef}

//         source={{
//           // uri: `https://customer.air2o.net${initialUrl}`,
//           uri: `https://testcustomer.air2o.net${initialUrl}`,
//         }}

//         style={{ flex: 1 }}

//         // ---------------------------------------------------
//         // JavaScript / storage
//         // ---------------------------------------------------
//         javaScriptEnabled={true}
//         domStorageEnabled={true}

//         // ---------------------------------------------------
//         // Media settings
//         // ---------------------------------------------------
//         mediaPlaybackRequiresUserAction={false}
//         allowsInlineMediaPlayback={true}

//         // ---------------------------------------------------
//         // Inject FCM token + user ID
//         // ---------------------------------------------------
//         injectedJavaScript={`
//           window.fcmToken = "${fcmToken || ""}";
//           window.userId = "${userId}";

//           true;
//         `}

//         // ---------------------------------------------------
//         // Messages from website
//         // ---------------------------------------------------
//         onMessage={handleMessage}

//         // ---------------------------------------------------
//         // Navigation
//         // ---------------------------------------------------
//         onNavigationStateChange={(navState) => {
//           setCanGoBack(navState.canGoBack);

//           setBackPressCount(0);
//         }}

//         // ---------------------------------------------------
//         // WebView errors
//         // ---------------------------------------------------
//         onError={(syntheticEvent) => {
//           const { nativeEvent } =
//             syntheticEvent;

//           console.error(
//             "WebView error:",
//             nativeEvent
//           );
//         }}

//         // ---------------------------------------------------
//         // Page loaded
//         // ---------------------------------------------------
//         onLoadEnd={() => {
//           webViewRef.current?.injectJavaScript(`
//             (function() {
//               const meta =
//                 document.createElement('meta');

//               meta.setAttribute(
//                 'name',
//                 'viewport'
//               );

//               meta.setAttribute(
//                 'content',
//                 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
//               );

//               document.head.appendChild(meta);

//               // Skip postMessage if navigated
//               // from notification
//               if (
//                 localStorage.getItem(
//                   'fromNotification'
//                 ) !== 'true'
//               ) {
//                 const user =
//                   localStorage.getItem("user");

//                 window.ReactNativeWebView
//                   .postMessage(user);
//               } else {
//                 localStorage.removeItem(
//                   'fromNotification'
//                 );
//               }
//             })();

//             true;
//           `);
//         }}
//       />
//     </View>
//   );
// }


//=======================================================
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  PermissionsAndroid,
  Platform,
  StatusBar,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);

  const webViewRef = useRef(null);
  const [, setBackPressCount] = useState(0);

  const notificationListener = useRef();
  const responseListener = useRef();

  // ---------------------------------------------------------
  // Derived user ID for injection
  // delegate_id OR customer_id
  // ---------------------------------------------------------
  const userId = user?.data?.delegate_id || user?.data?.customer_id || "";

  // =========================================================
  // CHECK STORED USER WHEN APP STARTS
  // =========================================================
  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error retrieving user data:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // =========================================================
  // HANDLE ANDROID HARDWARE BACK BUTTON
  // =========================================================
  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }

      Alert.alert(
        "Exit App",
        "Are you sure you want to close the app?",
        [
          {
            text: "Cancel",
            onPress: () => setBackPressCount(0),
            style: "cancel",
          },
          {
            text: "Exit",
            onPress: () => {
              setBackPressCount(0);
              BackHandler.exitApp();
            },
            style: "destructive",
          },
        ],
        { cancelable: false }
      );

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  // =========================================================
  // HANDLE WEBVIEW MESSAGE FOR LOGIN
  // =========================================================
  const handleMessage = async (event) => {
    const userData = event.nativeEvent.data;

    try {
      console.log("Received message from WebView:", userData);

      if (userData && userData !== "null") {
        const parsedUserData = JSON.parse(userData);

        if (parsedUserData.status === "success") {
          await AsyncStorage.setItem("user", userData);
          setUser(parsedUserData);
        }
      } else {
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

  // =========================================================
  // REQUEST PUSH NOTIFICATION PERMISSION + FCM TOKEN
  // =========================================================
  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
      alert("Must use physical device for push notifications");
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token!");
      return null;
    }

    try {
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error("Error getting Firebase FCM token:", error);
      return null;
    }
  }

  // =========================================================
  // REQUEST MICROPHONE PERMISSION (Android)
  // Never blocks the UI. Resolves to true / false.
  // =========================================================
  async function requestMicrophonePermissionAsync() {
    if (Platform.OS !== "android") {
      return true;
    }

    try {
      const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;

      const alreadyGranted = await PermissionsAndroid.check(permission);
      if (alreadyGranted) {
        console.log("Microphone permission already granted.");
        return true;
      }

      console.log("Requesting microphone permission...");

      const result = await Promise.race([
        PermissionsAndroid.request(permission, {
          title: "Microphone Permission",
          message:
            "Air2o needs access to your microphone for voice and speech features.",
          buttonPositive: "Allow",
          buttonNegative: "Deny",
        }),
        // Safety net so this can never hang the startup flow
        new Promise((resolve) => setTimeout(() => resolve("timeout"), 20000)),
      ]);

      console.log("Microphone permission result:", result);

      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error("Error requesting microphone permission:", error);
      return false;
    }
  }

  // =========================================================
  // STARTUP: PERMISSIONS (ONE AFTER ANOTHER) + NOTIFICATION LISTENERS
  //   1. Microphone
  //   2. Notifications + FCM token
  // =========================================================
  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("new_emails", {
        name: "New Emails",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "my_sound_file.wav",
      });
    }

    const requestAllPermissions = async () => {
      // Step 1: microphone (wait until the dialog is closed)
      await requestMicrophonePermissionAsync();

      // Step 2: notifications + FCM token
      const token = await registerForPushNotificationsAsync();

      if (token) {
        setFcmToken(token);
        console.log("Firebase FCM Token:", token);
      }
    };

    requestAllPermissions();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        console.log("Notification response:", data);

        if (data?.destinationPath && webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            localStorage.setItem('fromNotification', 'true');
            window.location.href = ${JSON.stringify(data.destinationPath)};
            true;
          `);
        }
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }

      if (responseListener.current) {
        Notifications.removeNotificationSubscription(
          responseListener.current
        );
      }
    };
  }, []);

  // =========================================================
  // INJECT FCM TOKEN + USER ID INTO WEBVIEW WHEN THEY CHANGE
  // =========================================================
  useEffect(() => {
    if (webViewRef.current && (fcmToken || userId)) {
      webViewRef.current.injectJavaScript(`
        window.fcmToken = ${JSON.stringify(fcmToken || "")};
        window.userId = ${JSON.stringify(String(userId))};
        true;
      `);
    }
  }, [fcmToken, userId]);

  // =========================================================
  // WAIT ONLY FOR THE STORED USER CHECK
  // (permissions no longer block the app from opening)
  // =========================================================
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // =========================================================
  // SET INITIAL URL BASED ON LOGIN STATE
  // =========================================================
  let initialUrl = "/";

  if (user && user.status === "success") {
    if (user.data.delegate_id) {
      initialUrl = user.data.hasMonitorPermission
        ? "/delegate-machinescreen1"
        : "/delegate-home";
    } else if (user.data.customer_id) {
      initialUrl = "/machinescreen1";
    }
  }

  // =========================================================
  // WEBVIEW
  // =========================================================
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <WebView
        ref={webViewRef}
        source={{
          // uri: `https://customer.air2o.net${initialUrl}`,
          uri: `https://testcustomer.air2o.net${initialUrl}`,
        }}
        style={{ flex: 1 }}
        // JavaScript / storage
        javaScriptEnabled={true}
        domStorageEnabled={true}
        // Media settings
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        mediaCapturePermissionGrantType="grant"
        // Inject FCM token + user ID
        injectedJavaScript={`
          window.fcmToken = ${JSON.stringify(fcmToken || "")};
          window.userId = ${JSON.stringify(String(userId))};
          true;
        `}
        // Messages from website
        onMessage={handleMessage}
        // Navigation
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
          setBackPressCount(0);
        }}
        // WebView errors
        onError={(syntheticEvent) => {
          console.error("WebView error:", syntheticEvent.nativeEvent);
        }}
        // Page loaded
        onLoadEnd={() => {
          webViewRef.current?.injectJavaScript(`
            (function() {
              const meta = document.createElement('meta');
              meta.setAttribute('name', 'viewport');
              meta.setAttribute(
                'content',
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
              );
              document.head.appendChild(meta);

              // Skip postMessage if navigated from notification
              if (localStorage.getItem('fromNotification') !== 'true') {
                const user = localStorage.getItem("user");
                window.ReactNativeWebView.postMessage(user);
              } else {
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