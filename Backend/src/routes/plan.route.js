import express from "express"
import { getPlans, getSinglePlan, getPriceHistory, submitPlan, getRankings, getRankingFormats } from "../controllers/plan.controller.js";
import { getPlanReviews, createReview, updateReview, deleteReview } from "../controllers/review.controller.js";
import { userAuth } from "../middlewares/verifyAuth.middleware.js";

export const planRouter = express.Router();

planRouter.post("/submit", userAuth, submitPlan);
planRouter.get("/rankings/formats", getRankingFormats);
planRouter.get("/rankings", getRankings);
planRouter.get("/price-history/:id", getPriceHistory)
planRouter.get("/:id/reviews", getPlanReviews)
planRouter.post("/:id/reviews", userAuth, createReview)
planRouter.put("/reviews/:id", userAuth, updateReview)
planRouter.delete("/reviews/:id", userAuth, deleteReview)
planRouter.get("/:id", getSinglePlan);
planRouter.get("/", getPlans);