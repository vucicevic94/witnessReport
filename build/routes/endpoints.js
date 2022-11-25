"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const witness_report_1 = __importDefault(require("../controllers/witness_report"));
const router = express_1.default.Router();
// <Params,ResBody,ReqBody,ReqQuery,Locals>
router.post('/report', witness_report_1.default.witnessReport);
module.exports = router;
