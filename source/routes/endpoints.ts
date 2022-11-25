import express from 'express';
import controller from '../controllers/witness_report';

interface Empty {}

const router = express.Router();
// <Params,ResBody,ReqBody,ReqQuery,Locals>
router.post('/report', controller.witnessReport);
export = router;
