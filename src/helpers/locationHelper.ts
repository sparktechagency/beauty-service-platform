import { Types } from "mongoose";
import { IUserTakeService } from "../app/modules/usertakeservice/usertakeservice.interface";
import axios from "axios";
import config from "../config";

export interface ILocationHelper {
  receiver: Types.ObjectId;
  data: IUserTakeService;
}

export const locationHelper = (data: ILocationHelper) => {
  // @ts-ignore
  const socketIo = global.io;
  if (socketIo) {
    socketIo.emit(`get-location::${data?.receiver}`, data);
  }
};

export const locationRemover = (data:any) => {
  // @ts-ignore
  const socketIo = global.io;
  if (socketIo) {
    socketIo.emit(`get-location-remove::${data?.receiver}`, data);
  }
};


const getNearbyProviders = async (data: any) => {
  // @ts-ignore
  const socketIo = global.io;
  if (socketIo) {
    socketIo.emit(`get-nearby-provider::${data?.receiver}`, data);
  }
};


// get address details using latitude and longitude using google map api key
export const getAddressDetailsUsingLatLong = async (lat: number, lng: number) => {
  
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${config.gooogle.mapKey}`;

    const { data } = await axios.get(url);

    if (data.status === "OK" && data.results.length > 0) {
      let state = null;

      for (const component of data.results[0].address_components) {
        if (component.types.includes("administrative_area_level_1")) {
          state = component.long_name;
          break;
        }
      }

      if (state) {
        return state;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching geocode:", error);
    return null;
  }
}