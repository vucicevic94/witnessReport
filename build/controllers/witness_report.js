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
const logging_1 = __importDefault(require("../config/logging"));
const WitnessReport_1 = __importDefault(require("../modules/WitnessReport"));
const config_1 = __importDefault(require("../config/config"));
const countries_enum_1 = require("../config/countries.enum");
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
const path_1 = __importDefault(require("path"));
const NAMESPACE = 'Witness Report';
const witnessReport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    logging_1.default.info(NAMESPACE, `Request name - ${req.query.name}, Request phone - ${req.query.phone_number}`);
    logging_1.default.info(NAMESPACE, `WitnessReport route called.`);
    //get report file path
    var filepath = getReportFilePath();
    if (!fs_1.default.existsSync(filepath)) {
        logging_1.default.info(NAMESPACE, `Report File not found.`);
        const fileheader = 'Title' +
            config_1.default.context.report_file_separator +
            'Phone Number' +
            config_1.default.context.report_file_separator +
            'Country' +
            config_1.default.context.report_file_separator +
            'Valid FBI Case' +
            config_1.default.context.report_file_separator +
            'Valid Phone Number';
        createFile(filepath);
        fs_1.default.writeFile(filepath, fileheader, (err) => {
            if (err) {
                return res.status(404).json({
                    message: 'Report file not found and error happend while creating the file'
                });
            }
            logging_1.default.info(NAMESPACE, `Report File with header successfully created.`);
        });
    }
    const name = req.body.name;
    const phoneNumber = req.body.phone_number;
    console.log(name);
    if (name === null || name === undefined) {
        return res.status(400).json({
            message: 'Missing mandatory field: name'
        });
    }
    if (phoneNumber === null || phoneNumber === undefined) {
        return res.status(400).json({
            message: 'Missing mandatory field: phoneNumber'
        });
    }
    console.log(phoneNumber);
    var country;
    var validCase;
    var validPhone;
    var message = [];
    //init WitnessReport
    const WR = new WitnessReport_1.default(name, phoneNumber);
    //check if case exists
    if (yield WR.caseExists()) {
        validCase = true;
        logging_1.default.info(NAMESPACE, 'FBI Case for provided name successfully found.');
    }
    else {
        logging_1.default.info(NAMESPACE, 'FBI Case for provided name not found.');
        validCase = false;
        message.push('FBI Case with provided name not found.');
    }
    if (WR.isValidPhone()) {
        logging_1.default.info(NAMESPACE, 'Provided phone number is valid.');
        validPhone = true;
        //get Country Region based on provided phone number
        country = WR.getCountryByPhone();
    }
    else {
        validPhone = false;
        logging_1.default.info(NAMESPACE, 'Provided phone number is not valid.');
        message.push('Provided phone number is not valid.');
    }
    //if country was not found from phone number - IP will be used for getting the client country
    if (country === null || country === undefined) {
        logging_1.default.info(NAMESPACE, 'Country was not found by provided phone number. The IP address will be taken to find the county.');
        country = yield getCountyFromIp(req.ip);
    }
    // get country name based on the found region
    var countryName = countries_enum_1.Country[country];
    const report_record = name +
        config_1.default.context.report_file_separator +
        phoneNumber +
        config_1.default.context.report_file_separator +
        countryName +
        config_1.default.context.report_file_separator +
        validCase +
        config_1.default.context.report_file_separator +
        validPhone;
    const new_line = '\r\n';
    // append report file with record from client request
    fs_1.default.appendFile(filepath, new_line + report_record, (err) => {
        if (err) {
            return res.status(404).json({
                message: 'Error happened while writing record into report file.'
            });
        }
        logging_1.default.info(NAMESPACE, 'Record is successfully written to the report file.');
    });
    if (message.length == 0) {
        message.push('Validation passed. Record successfully written in report file.');
    }
    return res.status(200).json({
        message: message,
        report: WR
    });
});
// call https://geo.ipify.org/ - to get country based on IP address from client - IP address is defined as a context in config file
function getCountyFromIp(ip) {
    return __awaiter(this, void 0, void 0, function* () {
        //prepare URL
        let url = new URL(config_1.default.context.geo_ipify_endpoint);
        url.searchParams.append(config_1.default.context.geo_ipify_apiKey_queryparam, config_1.default.context.geo_ipify_apiKey_value);
        url.searchParams.append(config_1.default.context.geo_ipify_ipAddress_queryparam, ip);
        //call API to check if case exists (case exists if number of total cases in higher then 0)
        try {
            const response = yield fetch(url);
            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }
            const country = (yield response.json()).location.country;
            return country;
        }
        catch (error) {
            if (error instanceof Error) {
                logging_1.default.error('Get Country From IP', error.message);
                return 'ZZ';
            }
            else {
                logging_1.default.error('Get Country From IP', 'Unexpected Error');
                console.log(error);
                return 'ZZ';
            }
        }
    });
}
//This function is used to get the file path of report file based on context values defined in config file
function getReportFilePath() {
    try {
        let formattedDate = (0, moment_1.default)(new Date()).format(config_1.default.context.report_file_dateformat);
        const fileName = `${config_1.default.context.report_file_name}_${formattedDate}.${config_1.default.context.report_file_extension}`;
        return path_1.default.join(__dirname, '..', config_1.default.context.report_file_path, fileName);
    }
    catch (error) {
        logging_1.default.warn('Get Report File Path', 'There was an issue with setting file path based on provided config parameters.');
        logging_1.default.warn('Get Report File Path', 'Report file will be set as based on default values (reports/report.csv).');
        return path_1.default.join(__dirname, '..', 'reports', 'report.csv');
    }
}
//This function is used to create a report file if file not exists
function createFile(filename) {
    var parentFolder = path_1.default.join(filename, '..');
    fs_1.default.mkdirSync(parentFolder, { recursive: true });
    fs_1.default.open(filename, 'r', function (err) {
        if (err) {
            fs_1.default.writeFile(filename, '', function (err) {
                if (err) {
                    logging_1.default.error(NAMESPACE, 'Error happened.');
                    console.log(err);
                }
                logging_1.default.info(NAMESPACE, 'The file was saved!');
            });
        }
        else {
            logging_1.default.info(NAMESPACE, 'Report file already exists!');
        }
    });
}
exports.default = { witnessReport };
