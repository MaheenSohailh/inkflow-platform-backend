import { Router } from "express";
import { checkoutSession, webHook } from "../controller/StripController.js";


const router = Router();
 
router.post('/create-checkout-session', checkoutSession);
router.post('/payment-success-webhook', webHook);

export default router;