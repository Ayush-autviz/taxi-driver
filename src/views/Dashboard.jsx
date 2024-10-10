import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Switch,
  PermissionsAndroid,
  Platform,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { connect } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  normal,
  bold,
  regular,
  screenHeight,
  screenWidth,
  dashboard,
  api_url,
  change_online_status,
  LATITUDE_DELTA,
  LONGITUDE_DELTA,
  f_s,
  f_tiny,
  f_xs,
  gth_get_location,
  gth_status_change,
  loader,
} from "../config/Constants";
import FusedLocation from "react-native-fused-location";
import Geolocation from "@react-native-community/geolocation";
import database from "@react-native-firebase/database";
import axios from "axios";
import MapView, { PROVIDER_GOOGLE, Heatmap } from "react-native-maps";
import * as colors from "../assets/css/Colors";
import Icon, { Icons } from "../components/Icons";
import { changeLocation } from "../actions/ChangeLocationActions";
import {
  initialLat,
  initialLng,
  initialRegion,
} from "../actions/BookingActions";
import DropShadow from "react-native-drop-shadow";
import LottieView from "lottie-react-native";
import messaging from "@react-native-firebase/messaging";

const Dashboard = (props) => {
  const navigation = useNavigation();
  const map_ref = useRef();
  const [loading, setLoading] = useState(false);
  const [switch_value, setSwitchValue] = useState("");
  const [gtn_status, setGtnStatus] = useState(false);
  const [language, setLanguage] = useState(global.lang);
  const [heat_map_coordinates, setHeatMapCoordinates] = useState([]);
  const [today_bookings, setTodayBookings] = useState(0);
  const [pending_hire_bookings, setPendingHireBookings] = useState(0);
  const [wallet, setWallet] = useState(0);
  const [today_earnings, setTodayEarnings] = useState(0);
  const [vehicle_type, setVehicleType] = useState(0);
  const [sync_status, setSyncStatus] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [map_region, setMapRegion] = useState(undefined);

  useEffect(() => {
    const interval = setInterval(() => {
      //call_get_heatmap_coordinates();
    }, 5000);
    setTimeout(function () {
      //booking_sync()
    }, 3000);
    const unsubscribe = navigation.addListener("focus", async () => {
      await call_dashboard();
    });
    if (Platform.OS === "android") {
      requestCameraPermission();
    } else {
      getInitialLocation();
    }
    const unsub = messaging().onMessage(async (remoteMessage) => {
      const { data } = remoteMessage;
      if (data != undefined) {
        const { id, type, driver_id } = data;
        console.log("id" + id);
        console.log("type" + type);
        if (type == 1 && id != undefined) {
          navigation.navigate("BookingRequest", { trip_id: id });
        }
      }
    });
    return interval, unsubscribe, unsub;
  }, []);

  const change_state = (value) => {
    if (value != 2) {
      if (value) {
        setSwitchValue(value);
        call_change_online_status(1, 1);
      } else {
        setSwitchValue(value);
        call_change_online_status(0, 1);
      }
    } else {
      navigate_gth_location();
    }
  };

  const call_gth_status_change = async (status) => {
    setLoading(true);
    await axios({
      method: "post",
      url: api_url + gth_status_change,
      data: { driver_id: global.id, gth_status: status },
    })
      .then(async (response) => {
        console.log(response.data.result);
        setLoading(false);
        if (response.data.result == 1) {
          setHomeSwitchValue(true);
          navigate_gth_location();
        } else {
          setHomeSwitchValue(false);
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const navigate_gth_location = () => {
    navigation.navigate("SelectGthLocation");
  };

  const saveData = async (status) => {
    try {
      await AsyncStorage.setItem("online_status", status.toString());
    } catch (e) {}
  };

  const call_dashboard = async () => {
    console.log("Dashboard Call : ");
    setLoading(true);
    await axios({
      method: "post",
      url: api_url + dashboard,
      data: { id: global.id },
    })
      .then(async (response) => {
        setLoading(false);
        await call_change_online_status(response.data.result.online_status, 2);
        if (response.data.result.vehicle_type != 0 && vehicle_type == 0) {
          await get_location(
            response.data.result.vehicle_type,
            response.data.result.sync_status
          );
          setVehicleType(response.data.result.vehicle_type);
        }
        setTodayBookings(response.data.result.today_bookings);
        setTodayEarnings(response.data.result.today_earnings);
        setSyncStatus(response.data.result.sync_status);
        setPendingHireBookings(response.data.result.pending_hire_bookings);
        setWallet(response.data.result.wallet);
        check_booking(
          response.data.result.booking_id,
          response.data.result.trip_type
        );
        setGtnStatus(response.data.result.gth_status);
        check_request(response.data.result.request_booking_id);
        console.log("Request : " + response.data.result.request_booking_id);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const check_request = (booking_id) => {
    if (booking_id != 0) {
      navigation.navigate("BookingRequest", { trip_id: booking_id });
    }
  };
  const check_booking = (booking_id, trip_type) => {
    //alert(booking_id+'-'+trip_type)
    if (booking_id != 0 && trip_type != 5) {
      navigation.navigate("Trip", { trip_id: booking_id, from: "home" });
    } else if (booking_id != 0 && trip_type == 5) {
      setTimeout(function () {
        navigation.navigate("SharedTrip", {
          trip_id: booking_id,
          from: "home",
        });
      }, 2000);
    }
  };

  const call_change_online_status = async (status, type) => {
    setLoading(true);
    await axios({
      method: "post",
      url: api_url + change_online_status,
      data: { id: global.id, online_status: status, type: type },
    })
      .then(async (response) => {
        setLoading(false);
        if (response.data.status == 2) {
          setSwitchValue(0);
          global.live_status == 0;
          saveData(0);
          vehicle_details();
        } else if (response.data.status == 3) {
          setSwitchValue(0);
          global.live_status == 0;
          saveData(0);
          vehicle_documents();
        }
        if (response.data.status == 1 && status == 1) {
          global.live_status == 1;
          saveData(1);
          setSwitchValue(1);
          if (type == 1) {
            setGtnStatus(0);
          }
        } else {
          global.live_status == 0;
          saveData(0);
          setSwitchValue(0);
          if (type == 1) {
            setGtnStatus(0);
          }
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  vehicle_details = () => {
    navigation.navigate("VehicleDetails");
  };

  vehicle_documents = () => {
    navigation.navigate("VehicleDocument");
  };

  const get_background_location_permission = async () => {
    const bg_granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      {
        title:
          app_name + " App Access your location for tracking in background",
        message: "Access your location for tracking in background",
        buttonPositive: "OK",
      }
    );
  };

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title:
            app_name + " App Access your location for tracking in background",
          message: "Access your location for tracking in background",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        await get_background_location_permission();
        await getInitialLocation();
      }
    } catch (err) {
      alert(strings.sorry_cannot_fetch_your_location);
    }
  };

  const getInitialLocation = async () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setMapRegion({
          latitude: await position.coords.latitude,
          longitude: await position.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        });
        await props.initialRegion(map_region);
        await props.initialLat(position.coords.latitude);
        await props.initialLng(position.coords.longitude);
      },
      (error) => getInitialLocation(),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const get_location = async (vt, sy) => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title:
          { app_name } +
          "access your location in background for get nearest trip requests",
        message:
          { app_name } +
          " needs to access your location in background for get nearest trips, show live location to customers that will be always in use",
      }
    );
    if (granted && vt != 0) {
      FusedLocation.setLocationPriority(FusedLocation.Constants.HIGH_ACCURACY);

      // Get location once.
      const location = await FusedLocation.getFusedLocation();
      setLatitude(location.latitude);
      setLongitude(location.longitude);

      // Set options.
      FusedLocation.setLocationPriority(FusedLocation.Constants.BALANCED);
      FusedLocation.setLocationInterval(5000);
      FusedLocation.setFastestLocationInterval(5000);
      FusedLocation.setSmallestDisplacement(10);

      // Keep getting updated location.
      FusedLocation.startLocationUpdates();

      // Place listeners.
      const subscription = FusedLocation.on(
        "fusedLocation",
        async (location) => {
          props.changeLocation(location);
          let bearing = 0;
          if (!isNaN(location.bearing)) {
            bearing = location.bearing;
          }
          console.log(vt);
          if (location) {
            if (sy == 1) {
              database().ref(`drivers/${vt}/${global.id}/geo`).update({
                lat: location.latitude,
                lng: location.longitude,
                bearing: bearing,
              });
            }
          }
        }
      );
    } else if (Platform.OS === "android") {
      requestCameraPermission();
    } else {
      getInitialLocation();
    }
  };

  booking_sync = () => {
    /*if (sync_status == 1) {
      database().ref(`drivers/${vehicle_type}/${global.id}`).on('value', snapshot => {
        if (snapshot.val().booking.booking_status == 1 && snapshot.val().online_status == 1) {
          navigation.navigate('BookingRequest', { trip_id: snapshot.val().booking.booking_id });
        }
      });
    }*/
  };

  const navigate_document_verify = async () => {
    if (sync_status == 2) {
      vehicle_details();
    } else {
      vehicle_documents();
    }
  };

  navigate_rental = () => {
    navigation.navigate("MyRentalRides");
  };

  navigate_wallet = () => {
    navigation.navigate("Wallet");
  };

  call_trip_settings = () => {
    navigation.navigate("TripSettings");
  };

  const call_today_rides = () => {
    navigation.navigate("TodayBookings");
  };

  const call_earnings = () => {
    navigation.navigate("Earnings");
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.theme_bg} />
      <MapView
        provider={PROVIDER_GOOGLE}
        ref={map_ref}
        style={styles.map}
        region={map_region}
        showsUserLocation={true}
        showsMyLocationButton={false}
      ></MapView>
      <View
        style={{
          padding: 15,
          backgroundColor: colors.theme_bg_three,
          flexDirection: "row",
          position: "absolute",
          top: 20,
          width: "90%",
          marginLeft: "5%",
          borderRadius: 10,
        }}
      >
        {/* <View style={{ width: 50, right: 0, top: 450, position: "absolute" }}>
          <TouchableOpacity onPress={call_trip_settings.bind(this)}>
            <Icon
              type={Icons.Ionicons}
              name="settings"
              style={{ fontSize: 40, color: colors.theme_bg_two }}
            />
          </TouchableOpacity>
        </View> */}

        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <View style={{ width: 50 }}>
            <TouchableOpacity onPress={call_trip_settings.bind(this)}>
              <Icon
                type={Icons.Ionicons}
                name="settings"
                style={{ fontSize: 30, color: colors.theme_bg_two }}
              />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              color: switch_value ? colors.theme_bg : "#000",
              fontWeight: "700",
            }}
          >
            {switch_value ? "Online" : "Offline"}
          </Text>
          {/* <View style={{ borderRadius: 10, padding: 5, flexDirection: "row" }}>
            <TouchableOpacity
              onPress={change_state.bind(this, 0)}
              activeOpacity={1}
              style={{
                width: "20%",
                borderRadius: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                type={Icons.MaterialCommunityIcons}
                name="engine-off"
                style={{
                  fontSize: 25,
                  color: switch_value == 0 ? colors.theme_fg_two : colors.grey,
                }}
              />
              <Text
                style={{
                  color: switch_value == 0 ? colors.theme_fg_two : colors.grey,
                  fontSize: f_s,
                  fontFamily: bold,
                }}
              >
                Offline
              </Text>
            </TouchableOpacity>
            <View
              style={{
                width: "20%",
                borderBottomWidth: 1,
                height: 10,
                borderStyle: "dotted",
                marginTop: 15,
              }}
            />
            <TouchableOpacity
              onPress={change_state.bind(this, 1)}
              activeOpacity={1}
              style={{
                width: "20%",
                borderRadius: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                type={Icons.FontAwesome5}
                name="car"
                style={{
                  fontSize: 25,
                  color:
                    switch_value == 1 && gtn_status == 0
                      ? colors.success
                      : colors.grey,
                }}
              />
              <Text
                style={{
                  color:
                    switch_value == 1 && gtn_status == 0
                      ? colors.success
                      : colors.grey,
                  fontSize: f_s,
                  fontFamily: bold,
                }}
              >
                Online
              </Text>
            </TouchableOpacity>
            <View
              style={{
                width: "20%",
                borderBottomWidth: 1,
                height: 10,
                borderStyle: "dotted",
                marginTop: 15,
              }}
            />
            <TouchableOpacity
              onPress={change_state.bind(this, 2)}
              activeOpacity={1}
              style={{
                width: "20%",
                borderRadius: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                type={Icons.Entypo}
                name="home"
                style={{
                  fontSize: 25,
                  color: gtn_status == 1 ? colors.theme_fg : colors.grey,
                }}
              />
              <Text
                style={{
                  color: gtn_status == 1 ? colors.theme_fg : colors.grey,
                  fontSize: f_s,
                  fontFamily: bold,
                }}
              >
                Home
              </Text>
            </TouchableOpacity>
          </View> */}
          <Switch
            trackColor={{ false: colors.grey, true: colors.success }}
            thumbColor={switch_value ? colors.success : colors.grey}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(val) => (val ? change_state(1) : change_state(0))}
            value={switch_value ? true : false}
            disabled={loading ? true : false}
          />
        </View>
        {/*<View style={{ width: '45%', justifyContent:"center", alignItems:"center" }}>
        <Text style={{ color: colors.theme_fg, fontSize: f_s, fontFamily: bold }}>Go Home</Text>
        <View style={{ margin: 5 }} />
          <View style={{ justifyContent:"center", alignItems:"center" }}>
          <Switch
            trackColor={{ false: colors.grey, true: colors.success }}
            thumbColor={gtn_status ? colors.success : colors.grey}
            ios_backgroundColor="#3e3e3e"
            onValueChange={home_toggleSwitch}
            value={gtn_status}
          />
          </View>
      </View>*/}
      </View>
      <View
        style={{
          padding: 15,
          backgroundColor: colors.theme_bg,
          height: 150,
          position: "absolute",
          bottom: 80,
          width: "90%",
          marginLeft: "5%",
          borderRadius: 10,
        }}
      >
        <DropShadow
          style={{
            width: "100%",
            marginBottom: 5,
            marginTop: 5,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0.1,
            shadowRadius: 5,
          }}
        >
          <View style={{ flexDirection: "row", width: "100%" }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={call_today_rides.bind(this)}
              style={{
                width: "33%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                type={Icons.Ionicons}
                name="bookmark"
                style={{ fontSize: 30, color: colors.theme_fg_three }}
              />
              <View style={{ margin: 5 }} />
              <Text
                style={{
                  color: colors.theme_fg_three,
                  fontSize: f_s,
                  fontFamily: bold,
                }}
              >
                {today_bookings}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={call_earnings.bind(this)}
              style={{
                width: "33%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                type={Icons.FontAwesome}
                name="dollar"
                style={{ fontSize: 30, color: colors.theme_fg_three }}
              />
              <View style={{ margin: 5 }} />
              <Text
                style={{
                  color: colors.theme_fg_three,
                  fontSize: f_s,
                  fontFamily: bold,
                }}
              >
                {global.currency}
                {today_earnings}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                width: "33%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                type={Icons.MaterialIcons}
                name="money"
                style={{ fontSize: 30, color: colors.theme_fg_three }}
              />
              <View style={{ margin: 5 }} />
              <Text
                style={{
                  color: colors.theme_fg_three,
                  fontSize: f_s,
                  fontFamily: bold,
                }}
              >
                {global.currency}
                {pending_hire_bookings}
              </Text>
            </View>
          </View>
          <View style={{ margin: 5 }} />
          <View style={{ flexDirection: "row", width: "100%" }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={call_today_rides.bind(this)}
              style={{
                width: "33%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.theme_fg_three,
                  fontSize: f_tiny,
                  fontFamily: normal,
                }}
              >
                Today Bookings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={call_earnings.bind(this)}
              style={{
                width: "33%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.theme_fg_three,
                  fontSize: f_tiny,
                  fontFamily: normal,
                }}
              >
                Today Earnings
              </Text>
            </TouchableOpacity>
            <View
              style={{
                width: "33%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.theme_fg_three,
                  fontSize: f_tiny,
                  fontFamily: normal,
                }}
              >
                Incentive
              </Text>
            </View>
          </View>
        </DropShadow>
      </View>

      <View style={{ position: "absolute", top: 90, width: "100%" }}>
        {pending_hire_bookings > 0 && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={navigate_rental.bind(this)}
            style={{
              flexDirection: "row",
              backgroundColor: colors.success_background,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
              width: "90%",
              marginLeft: "5%",
              marginBottom: 10,
            }}
          >
            <Icon
              type={Icons.Ionicons}
              name="bookmark"
              style={{ fontSize: 20, color: colors.success }}
            />
            <View style={{ margin: 5 }} />
            <Text
              style={{
                fontFamily: regular,
                fontSize: f_xs,
                color: colors.success,
              }}
            >
              You have received driver hire request
            </Text>
          </TouchableOpacity>
        )}
        {wallet == 0 && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={navigate_wallet.bind(this)}
            style={{
              flexDirection: "row",
              backgroundColor: colors.error_background,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
              width: "90%",
              marginLeft: "5%",
            }}
          >
            <Icon
              type={Icons.Ionicons}
              name="wallet"
              style={{ fontSize: 20, color: colors.error }}
            />
            <View style={{ margin: 5 }} />
            <Text
              style={{
                fontFamily: regular,
                fontSize: f_xs,
                color: colors.error,
              }}
            >
              Your wallet balance is low please recharge immediately
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {loading == true && (
        <View
          style={{
            height: 100,
            width: 100,
            alignSelf: "center",
            marginTop: "30%",
          }}
        >
          <LottieView style={{ flex: 1 }} source={loader} autoPlay loop />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: screenHeight,
    width: screenWidth,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

const mapDispatchToProps = (dispatch) => ({
  changeLocation: (data) => dispatch(changeLocation(data)),
  initialLat: (data) => dispatch(initialLat(data)),
  initialLng: (data) => dispatch(initialLng(data)),
  initialRegion: (data) => dispatch(initialRegion(data)),
});

export default connect(null, mapDispatchToProps)(Dashboard);
