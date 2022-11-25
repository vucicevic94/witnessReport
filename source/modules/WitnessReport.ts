import { PhoneNumberUtil, PhoneNumber } from 'google-libphonenumber';
import config from '../config/config';
import logging from '../config/logging';

export default class WitnessReport {
    private name: string;
    private phone_number: string;

    constructor(name: string, phone_number: string) {
        this.name = name;
        this.phone_number = phone_number;
    }

    public async caseExists(): Promise<boolean> {
        //prepare URL
        let wanted_url: URL = new URL(config.context.fbi_mw_api_endpoint);
        wanted_url.searchParams.append(config.context.fbi_mw_api_search_param, this.name);
        //call API to check if case exists (case exists if number of total cases in higher then 0)
        try {
            const response = await fetch(wanted_url);

            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }
            const total: number = (await response.json()).total;
            if (total > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            if (error instanceof Error) {
                logging.error('Witness Report - Case Exists', error.message);
            } else {
                logging.error('Witness Report - Case Exists', 'Unexpected error');
                console.log(error);
            }
            return false;
        }
    }

    public isValidPhone(): boolean {
        let isValid = false;

        const phoneUtil: PhoneNumberUtil = PhoneNumberUtil.getInstance();

        try {
            const phone_number: PhoneNumber = phoneUtil.parse(this.phone_number);

            if (phoneUtil.isValidNumber(phone_number)) {
                isValid = true;
                logging.info('Witness Report - is Valid Phone', 'Phone number is valid');
            } else {
                logging.info('Witness Report - is Valid Phone', 'Phone number is not valid');
            }
        } catch (error) {
            if (error instanceof Error) {
                logging.error('Witness Report - is Valid Phone', error.message);
            } else {
                logging.error('Witness Report - is Valid Phone', 'Unexpected error');
                console.log(error);
            }
            return false;
        }

        return isValid;
    }

    public getCountryByPhone(): string | undefined {
        try {
            const phoneUtil: PhoneNumberUtil = PhoneNumberUtil.getInstance();
            const phone_number: PhoneNumber = phoneUtil.parse(this.phone_number);
            const region: string | undefined = phoneUtil.getRegionCodeForNumber(phone_number);

            if (typeof region === 'string') {
                return region;
            } else {
                return undefined;
            }
        } catch (error) {
            if (error instanceof Error) {
                logging.error('Witness Report - getCountryByPhone', error.message);
            } else {
                logging.error('Witness Report - getCountryByPhone', 'Unexpected error');
                console.log(error);
            }
            return undefined;
        }
    }
}
