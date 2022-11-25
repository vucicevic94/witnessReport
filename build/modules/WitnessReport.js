"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const google_libphonenumber_1 = require("google-libphonenumber");
const config_1 = __importDefault(require("../config/config"));
const logging_1 = __importDefault(require("../config/logging"));
class WitnessReport {
    constructor(name, phone_number) {
        this.name = name;
        this.phone_number = phone_number;
    }
    caseExists() {
        return __awaiter(this, void 0, void 0, function* () {
            //prepare URL
            let wanted_url = new URL(config_1.default.context.fbi_mw_api_endpoint);
            wanted_url.searchParams.append(config_1.default.context.fbi_mw_api_search_param, this.name);
            //call API to check if case exists (case exists if number of total cases in higher then 0)
            try {
                const response = yield fetch(wanted_url);
                if (!response.ok) {
                    throw new Error(`Error! status: ${response.status}`);
                }
                const total = (yield response.json()).total;
                if (total > 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    logging_1.default.error('Witness Report - Case Exists', error.message);
                }
                else {
                    logging_1.default.error('Witness Report - Case Exists', 'Unexpected error');
                    console.log(error);
                }
                return false;
            }
        });
    }
    isValidPhone() {
        let isValid = false;
        const phoneUtil = google_libphonenumber_1.PhoneNumberUtil.getInstance();
        try {
            const phone_number = phoneUtil.parse(this.phone_number);
            if (phoneUtil.isValidNumber(phone_number)) {
                isValid = true;
                logging_1.default.info('Witness Report - is Valid Phone', 'Phone number is valid');
            }
            else {
                logging_1.default.info('Witness Report - is Valid Phone', 'Phone number is not valid');
            }
        }
        catch (error) {
            if (error instanceof Error) {
                logging_1.default.error('Witness Report - is Valid Phone', error.message);
            }
            else {
                logging_1.default.error('Witness Report - is Valid Phone', 'Unexpected error');
                console.log(error);
            }
            return false;
        }
        return isValid;
    }
    getCountryByPhone() {
        try {
            const phoneUtil = google_libphonenumber_1.PhoneNumberUtil.getInstance();
            const phone_number = phoneUtil.parse(this.phone_number);
            const region = phoneUtil.getRegionCodeForNumber(phone_number);
            if (typeof region === 'string') {
                return region;
            }
            else {
                return undefined;
            }
        }
        catch (error) {
            if (error instanceof Error) {
                logging_1.default.error('Witness Report - getCountryByPhone', error.message);
            }
            else {
                logging_1.default.error('Witness Report - getCountryByPhone', 'Unexpected error');
                console.log(error);
            }
            return undefined;
        }
    }
}
exports.default = WitnessReport;
