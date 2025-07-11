import express, { Request, Response } from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import { Morgan } from "./shared/morgan";
import router from '../src/app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import session from "express-session";
import { handleWebHook } from "./app/modules/webhook/handleWebhook";
import { handleCheckrWebhook } from "./app/modules/webhook/handleCheckrWebhook";
import rateLimit from "express-rate-limit";
import requestIp from 'request-ip';
import ApiError from "./errors/ApiErrors";
const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
        if (!req.clientIp) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Unable to determine client IP!');
        }
        return req.clientIp;
    },
    handler: (req, res, next, options) => {
        throw new ApiError(options?.statusCode, `Rate limit exceeded. Try again in ${options.windowMs / 60000} minutes.`);
    }
});



// morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

// webhook
app.post("/api/webhook",express.raw({ type: "application/json" }),handleWebHook);
app.post("/api/webhook/checkr",express.json(),handleCheckrWebhook);

//body parser
app.use(cors({
    origin:["https://rahat3000.binarybards.online","http://10.0.80.47:5173","http://31.97.133.34:3000","https://web.oohahplatform.com"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//file retrieve
app.use(express.static('uploads'));
app.use("/default", express.static("assets"));

// Session middleware (must be before passport initialization)
app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Secure should be true in production with HTTPS
}));
app.use(requestIp.mw());
app.use(limiter);


//router
app.use('/api/v1', router);

app.get("/", (req: Request, res: Response)=>{
    res.send("Hey Backend, How can I assist you ");
})

//global error handle
app.use(globalErrorHandler);

// handle not found route
app.use((req: Request, res: Response)=>{
    res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Not Found",
        errorMessages: [
            {
                path: req.originalUrl,
                message: "API DOESN'T EXIST"
            }
        ]
    })
});

export default app;