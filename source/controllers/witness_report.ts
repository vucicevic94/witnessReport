import { RequestHandler } from 'express';
import logging from '../config/logging';
import WitnessReport from '../modules/WitnessReport';
import config from '../config/config';
import { Country } from '../config/countries.enum';
import fs from 'fs';
import moment from 'moment';
import path from 'path';

const NAMESPACE = 'Witness Report';

const witnessReport: RequestHandler = async (req, res, next) => {
    logging.info(NAMESPACE, `Request name - ${req.query.name}, Request phone - ${req.query.phone_number}`);
    logging.info(NAMESPACE, `WitnessReport route called.`);

    //get report file path

    var filepath: string = getReportFilePath();

    if (!fs.existsSync(filepath)) {
        logging.info(NAMESPACE, `Report File not found.`);
        const fileheader: string =
            'Title' +
            config.context.report_file_separator +
            'Phone Number' +
            config.context.report_file_separator +
            'Country' +
            config.context.report_file_separator +
            'Valid FBI Case' +
            config.context.report_file_separator +
            'Valid Phone Number';
        createFile(filepath);
        fs.writeFile(filepath, fileheader, (err) => {
            if (err) {
                return res.status(404).json({
                    message: 'Report file not found and error happend while creating the file'
                });
            }
            logging.info(NAMESPACE, `Report File with header successfully created.`);
        });
    }

    const name: string = (req.body as { name: string }).name;
    const phoneNumber: string = (req.body as { phone_number: string }).phone_number;
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
    var country: string | undefined;
    var validCase: boolean;
    var validPhone: boolean;
    var message: string[] = [];

    //init WitnessReport
    const WR: WitnessReport = new WitnessReport(name, phoneNumber);
    //check if case exists
    if (await WR.caseExists()) {
        validCase = true;
        logging.info(NAMESPACE, 'FBI Case for provided name successfully found.');
    } else {
        logging.info(NAMESPACE, 'FBI Case for provided name not found.');
        validCase = false;
        message.push('FBI Case with provided name not found.');
    }
    if (WR.isValidPhone()) {
        logging.info(NAMESPACE, 'Provided phone number is valid.');
        validPhone = true;
        //get Country Region based on provided phone number
        country = WR.getCountryByPhone();
    } else {
        validPhone = false;
        logging.info(NAMESPACE, 'Provided phone number is not valid.');
        message.push('Provided phone number is not valid.');
    }
    //if country was not found from phone number - IP will be used for getting the client country
    if (country === null || country === undefined) {
        logging.info(NAMESPACE, 'Country was not found by provided phone number. The IP address will be taken to find the county.');
        country = await getCountyFromIp(req.ip);
    }

    // get country name based on the found region
    var countryName: Country = Country[country as keyof typeof Country];

    const report_record: string =
        name +
        config.context.report_file_separator +
        phoneNumber +
        config.context.report_file_separator +
        countryName +
        config.context.report_file_separator +
        validCase +
        config.context.report_file_separator +
        validPhone;
    const new_line = '\r\n';

    // append report file with record from client request
    fs.appendFile(filepath, new_line + report_record, (err) => {
        if (err) {
            return res.status(404).json({
                message: 'Error happened while writing record into report file.'
            });
        }
        logging.info(NAMESPACE, 'Record is successfully written to the report file.');
    });
    if (message.length == 0) {
        message.push('Validation passed. Record successfully written in report file.');
    }
    return res.status(200).json({
        message: message,
        report: WR
    });
};

// call https://geo.ipify.org/ - to get country based on IP address from client - IP address is defined as a context in config file
async function getCountyFromIp(ip: string): Promise<string | undefined> {
    //prepare URL
    let url: URL = new URL(config.context.geo_ipify_endpoint);
    url.searchParams.append(config.context.geo_ipify_apiKey_queryparam, config.context.geo_ipify_apiKey_value);
    url.searchParams.append(config.context.geo_ipify_ipAddress_queryparam, ip);
    //call API to check if case exists (case exists if number of total cases in higher then 0)
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }
        const country: string = (await response.json()).location.country;
        return country;
    } catch (error) {
        if (error instanceof Error) {
            logging.error('Get Country From IP', error.message);
            return 'ZZ';
        } else {
            logging.error('Get Country From IP', 'Unexpected Error');
            console.log(error);
            return 'ZZ';
        }
    }
}

//This function is used to get the file path of report file based on context values defined in config file
function getReportFilePath(): string {
    try {
        let formattedDate = moment(new Date()).format(config.context.report_file_dateformat);
        const fileName = `${config.context.report_file_name}_${formattedDate}.${config.context.report_file_extension}`;
        return path.join(__dirname, '..', config.context.report_file_path, fileName);
    } catch (error) {
        logging.warn('Get Report File Path', 'There was an issue with setting file path based on provided config parameters.');
        logging.warn('Get Report File Path', 'Report file will be set as based on default values (reports/report.csv).');
        return path.join(__dirname, '..', 'reports', 'report.csv');
    }
}

//This function is used to create a report file if file not exists
function createFile(filename: string) {
    var parentFolder = path.join(filename, '..');
    fs.mkdirSync(parentFolder, { recursive: true });

    fs.open(filename, 'r', function (err) {
        if (err) {
            fs.writeFile(filename, '', function (err) {
                if (err) {
                    logging.error(NAMESPACE, 'Error happened.');
                    console.log(err);
                }
                logging.info(NAMESPACE, 'The file was saved!');
            });
        } else {
            logging.info(NAMESPACE, 'Report file already exists!');
        }
    });
}

export default { witnessReport };
