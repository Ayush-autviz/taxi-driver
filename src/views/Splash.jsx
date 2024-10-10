import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
  PermissionsAndroid,
} from "react-native";
import {
  logo,
  app_settings,
  api_url,
  LATITUDE_DELTA,
  LONGITUDE_DELTA,
} from "../config/Constants";
import { useNavigation, CommonActions } from "@react-navigation/native";
import * as colors from "../assets/css/Colors";
import { connect } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  initialLat,
  initialLng,
  initialRegion,
} from "../actions/BookingActions";
import { promptForEnableLocationIfNeeded } from "react-native-android-location-enabler";
import Geolocation from "@react-native-community/geolocation";
import VersionNumber from "react-native-version-number";
import { addEventListener } from "@react-native-community/netinfo";
import DropdownAlert, {
  DropdownAlertData,
  DropdownAlertType,
} from "react-native-dropdownalert";
import messaging from "@react-native-firebase/messaging";
import notifee, {
  AndroidStyle,
  AndroidColor,
  AndroidCategory,
  AndroidImportance,
} from "@notifee/react-native";

const Splash = (props) => {
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  const navigation = useNavigation();
  let dropDownAlertRef = useRef();

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  }

  useEffect(() => {
    requestUserPermission();
    checkToken();
    const unsubscribe = addEventListener((state) => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      if (state.isConnected == true) {
        check_data();
      } else {
        dropDownAlertRef({
          type: DropdownAlertType.Error,
          title: "Internet connection error",
          message: "Please enable your internet connection",
        });
      }
    });
    unsubscribe();
  }, []);

  const checkToken = async () => {
    console.log("check");
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log("fcm_token:" + fcmToken);
        global.fcm_token = fcmToken;
        check_data();
      } else {
        Alert.alert("Sorry unable to get your token");
      }
      console.log(fcmToken, "fcmtoken");
    } catch (error) {
      console.log(error);
    }
  };

  const check_data = () => {
    if (Platform.OS == "android") {
      call_settings();
      //global.fcm_token = '123456'
    } else {
      global.fcm_token = "123456";
      call_settings();
    }
  };

  const call_settings = async () => {
    //  console.log('ko')
    await axios({
      method: "get",
      url: api_url + app_settings,
    })
      .then(async (response) => {
        /* if(response.data.result.android_latest_version.version_code > app_version_code){
          navigate_update_app('https://play.google.com/store/apps/details?id=com.letsgo.driver');
        }else{
          home(response.data.result);
        } */
        home(response.data.result);
      })
      .catch((error) => {
        //console.log(error)
        //alert(strings.sorry_something_went_wrong);
      });
  };

  const navigate_update_app = (url) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "AppUpdate", params: { url: url } }],
      })
    );
  };

  const home = async (data) => {
    const id = await AsyncStorage.getItem("id");
    const first_name = await AsyncStorage.getItem("first_name");
    const phone_with_code = await AsyncStorage.getItem("phone_with_code");
    const email = await AsyncStorage.getItem("email");
    const lang = await AsyncStorage.getItem("lang");
    global.live_status = await AsyncStorage.getItem("online_status");
    const profile_picture = await AsyncStorage.getItem("profile_picture");
    global.stripe_key = data.stripe_key;
    global.razorpay_key = data.razorpay_key;
    global.app_name = data.app_name;
    global.language_status = data.language_status;
    global.default_language = data.default_language;
    global.polyline_status = data.polyline_status;
    global.driver_trip_time = data.driver_trip_time;
    global.mode = data.mode;
    global.currency = data.default_currency_symbol;

    //Note
    global.lang = "en";
    /*if(global.language_status == 1){
       global.lang = await global.default_language;
    }
    if(lang){
      strings.setLanguage(lang);
      global.lang = await lang;
    }else{
      strings.setLanguage('en');
      global.lang = await 'en';
    }
 
   if(global.lang == 'en' && I18nManager.isRTL){
     I18nManager.forceRTL(false);
     await RNRestart.Restart();
   }
 
   if(global.lang == 'ar' && !I18nManager.isRTL){
     I18nManager.forceRTL(true);
     await RNRestart.Restart();
   }*/

    if (id !== null) {
      global.id = id;
      global.first_name = first_name;
      global.phone_with_code = phone_with_code;
      global.email = email;
      global.profile_picture = profile_picture;
      check_location();
    } else {
      global.id = 0;
      check_location();
    }
  };

  const check_location = async () => {
    //await getInitialLocation();
    if (Platform.OS === "android") {
      promptForEnableLocationIfNeeded({ interval: 10000, fastInterval: 5000 })
        .then(async (data) => {
          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                title: "App Access your location for tracking in background",
                message:
                  app_name +
                  " will track your location in background when the app is closed or not in use.",
              }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              await getInitialLocation();
            } else {
              navigation.navigate("LocationEnable");
              alert("Sorry unable to fetch your location");
            }
          } catch (err) {
            console.log(err);
            console.log(1);
            navigation.navigate("LocationEnable");
          }
        })
        .catch((err) => {
          console.log(err);
          console.log(2);
          navigation.navigate("LocationEnable");
        });
    } else {
      await getInitialLocation();
    }
  };

  const getInitialLocation = async () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        let location = position.coords;
        let region = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        await props.initialRegion(region);
        await props.initialLat(location.latitude);
        await props.initialLng(location.longitude);
        navigate();
      },
      (error) => navigation.navigate("LocationEnable"),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const navigate = () => {
    if (global.id > 0) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      );
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "CheckPhone" }],
        })
      );
    }
  };

  return (
    <TouchableOpacity activeOpacity={1} style={styles.background}>
      <StatusBar backgroundColor={colors.theme_bg} />
      <View style={styles.logo_container}>
        <Image style={styles.logo} source={logo} />
      </View>
      <DropdownAlert alert={(func) => (dropDownAlertRef = func)} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  background: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.theme_bg_three,
  },
  logo_container: {
    height: 200,
    width: 300,
  },
  logo: {
    height: undefined,
    width: undefined,
    flex: 1,
    borderRadius: 10,
  },
});

function mapStateToProps(state) {
  return {
    initial_lat: state.booking.initial_lat,
    initial_lng: state.booking.initial_lng,
    initial_region: state.booking.initial_region,
  };
}

const mapDispatchToProps = (dispatch) => ({
  initialLat: (data) => dispatch(initialLat(data)),
  initialLng: (data) => dispatch(initialLng(data)),
  initialRegion: (data) => dispatch(initialRegion(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Splash);
