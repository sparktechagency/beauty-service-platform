import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IReport, ISupport } from "./report.interface";
import { Report, Support } from "./report.model";
import QueryBuilder from "../../builder/queryBuilder";
import { User } from "../user/user.model";
import { emailHelper } from "../../../helpers/emailHelper";
import { emailTemplate } from "../../../shared/emailTemplate";
import { JwtPayload } from "jsonwebtoken";
import { UserTakeService } from "../usertakeservice/usertakeservice.model";
import { USER_ROLES } from "../../../enums/user";
import config from "../../../config";
import {
  sendNotifications,
  sendNotificationsAdmin,
} from "../../../helpers/notificationsHelper";
import { IUserTakeService } from "../usertakeservice/usertakeservice.interface";
import stripe from "../../../config/stripe";

const createReportToDB = async (
  payload: IReport,
  user: JwtPayload
): Promise<IReport> => {
  const userData = await User.findById(user.id);
  const order = await UserTakeService.findOne({ _id: payload.reservation });
  if (!order)
    throw new ApiError(StatusCodes.BAD_REQUEST, "Reservation Not Found ");
  const email =
    user.role == USER_ROLES.USER
      ? config.email.user_email
      : config.email.artist_email;

  const reportTemplate = emailTemplate.sendReportMessageEmail({
    user: userData as any,
    order: order,
    email: email!,
    message: payload.reason,
  });
  await emailHelper.sendEmail(reportTemplate);
  const report = await Report.create(payload);
  await sendNotificationsAdmin({
    title: `Report from ${userData?.name}`,
    message: `Reported by ${userData?.name} for ${payload.reason}`,
    isRead: false,
    serviceId: report._id,
    filePath: "payment",
  });
  if (!report)
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to created Report ");
  return report;
};

const getAllReportsFromDB = async (query: Record<string, any>) => {
  const result = new QueryBuilder(Report.find(), query)
    .sort()
    .paginate()
    .filter();
  const reports = await result.modelQuery
    .populate([
      { path: "user", select: "name profile email" },
      { path: "reservation" },
    ])
    .lean()
    .exec();
  const pagination = await result.getPaginationInfo();
  return {
    reports,
    pagination,
  };
};

const changeReportStatusToDB = async (
  id: string,
  payload: Partial<IReport>
): Promise<IReport> => {
  if (payload.refund) {
    const report = await Report.findOne({ _id: id }).populate("reservation");
    const order = report?.reservation as any as IUserTakeService;

    await stripe.refunds.create({
      charge: order.payment_intent,
      amount: payload.refund * 100,
      reason: "requested_by_customer",
    });
  }
  const report: any = await Report.findByIdAndUpdate(id, payload, {
    new: true,
  }).populate(["user", "reservation"]);
  if (!report)
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update Report ");

  const supportEmailTamplate = emailTemplate.sendSupportMessage({
    name: report?.user?.name,
    message: payload.note!,
    email: report?.user?.email,
    role: report?.user?.role,
  });
  await emailHelper.sendEmail(supportEmailTamplate);
  return report;
};

const getReportByIdFromDB = async (id: string): Promise<IReport | null> => {
  const report = await Report.findById(id)
    .populate([
      {
        path: "user",
        select: "name profile email",
      },
      {
        path: "reservation",
        populate: [
          {
            path: "serviceId",
            select: ["name", "category", "subCategory", "image", "addOns"],
            populate: [
              {
                path: "category",
                select: ["name"],
              },
              {
                path: "subCategory",
                select: ["name"],
              },
            ],
          },
          {
            path: "userId",
            select: [
              "name",
              "email",
              "phone",
              "profile",
              "isActive",
              "status",
              "subscription",
              "location",
            ],
            populate: [
              {
                path: "subscription",
                select: ["package", "status"],
                populate: [
                  {
                    path: "package",
                    select: ["name", "price", "price_offer"],
                  },
                ],
              },
            ],
          },
          {
            path: "artiestId",
            select: [
              "name",
              "email",
              "phone",
              "profile",
              "isActive",
              "status",
              "subscription",
              "location",
            ],
            populate: [
              {
                path: "subscription",
                select: ["package", "status"],
                populate: [
                  {
                    path: "package",
                    select: ["name", "price", "price_offer"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
    .lean()
    .exec();
  return report;
};

const createSupportMessageToDB = async (
  payload: ISupport
): Promise<ISupport> => {
  const support = await Support.create(payload);
  if (!support)
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to created Support ");
  const user = await User.findById(payload.customer);
  const email =
    user?.role == USER_ROLES.USER
      ? config.email.user_email
      : config.email.artist_email;
  if (!user) throw new ApiError(StatusCodes.BAD_REQUEST, "Customer Not Found ");
  const supportEmailTamplate = emailTemplate.sendSupportMessage({
    name: user.name,
    message: payload.message,
    email: user.email,
    role: user.role,
  });
  await emailHelper.sendEmail(supportEmailTamplate);
  return support;
};

const getSupportMessageFromDB = async (query: Record<string, any>) => {
  const result = new QueryBuilder(Support.find(), query)
    .sort()
    .paginate()
    .filter();
  const supports = await result.modelQuery
    .populate([{ path: "customer", select: "name profile email" }])
    .lean()
    .exec();
  const pagination = await result.getPaginationInfo();
  return {
    supports,
    pagination,
  };
};

const sentReplyToSupportMessage = async (
  id: string,
  message: string
): Promise<ISupport> => {
  const support = await Support.findByIdAndUpdate(
    id,
    { reply: message, status: "resolved" },
    { new: true }
  );
  if (!support)
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update Support ");
  const user = await User.findById(support.customer);
  if (!user) throw new ApiError(StatusCodes.BAD_REQUEST, "Customer Not Found ");

  const supportEmailTamplate = emailTemplate.sendSupportMessageToUser({
    name: user.name,
    message: message,
    email: user.email,
  });

  await emailHelper.sendEmail(supportEmailTamplate);

  return support;
};

const getSupportMessageByIdFromDB = async (
  id: string
): Promise<ISupport | null> => {
  const support = await Support.findById(id)
    .populate(["customer"])
    .lean()
    .exec();
  return support;
};

const reportedOrdersFromDb = async (query: Record<string, any>) => {
  const result = new QueryBuilder(Report.find(), query)
    .sort()
    .paginate()
    .filter();
  const reports = await result.modelQuery
    .populate([
        {
            path: "user",
            select: "name profile email",
        },
      {
        path: "reservation",
        populate: [
          {
            path: "serviceId",
            select: ["name", "category", "subCategory", "image", "addOns"],
            populate: [
              {
                path: "category",
                select: ["name"],
              },
              {
                path: "subCategory",
                select: ["name"],
              },
            ],
          },
          {
            path: "userId",
            select: [
              "name",
              "email",
              "phone",
              "profile",
              "isActive",
              "status",
              "subscription",
              "location",
            ],
            populate: [
              {
                path: "subscription",
                select: ["package", "status"],
                populate: [
                  {
                    path: "package",
                    select: ["name", "price", "price_offer"],
                  },
                ],
              },
            ],
          },
          {
            path: "artiestId",
            select: [
              "name",
              "email",
              "phone",
              "profile",
              "isActive",
              "status",
              "subscription",
              "location",
            ],
            populate: [
              {
                path: "subscription",
                select: ["package", "status"],
                populate: [
                  {
                    path: "package",
                    select: ["name", "price", "price_offer"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
    .lean()
    .exec();
  const pagination = await result.getPaginationInfo();
  return {
    reports,
    pagination,
  };
};

export const ReportService = {
  createReportToDB,
  getAllReportsFromDB,
  changeReportStatusToDB,
  getReportByIdFromDB,
  createSupportMessageToDB,
  getSupportMessageFromDB,
  sentReplyToSupportMessage,
  getSupportMessageByIdFromDB,
  reportedOrdersFromDb,
};
