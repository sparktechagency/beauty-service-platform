import { Types } from "mongoose";
import { IUserTakeService } from "../app/modules/usertakeservice/usertakeservice.interface";

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
