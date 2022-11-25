import dotenv from 'dotenv';

dotenv.config();

const SERVER_PORT = process.env.SERVER_PORT || 5002;
const SERVER_HOST = process.env.SERVER_HOST || 'http://127.0.0.1';

const SERVER = {
    hostname: SERVER_HOST,
    port: SERVER_PORT
};

const CONTEXTS = {
    geo_ipify_endpoint: 'https://geo.ipify.org/api/v2/country',
    geo_ipify_apiKey_value: 'at_DILEfuh2IZhClrjbZJYi9RlB1U6Ij',
    geo_ipify_apiKey_queryparam: 'apiKey',
    geo_ipify_ipAddress_queryparam: 'ipAddress',
    fbi_mw_api_endpoint: 'https://api.fbi.gov/wanted',
    fbi_mw_api_search_param: 'title',
    report_file_path: 'reports',
    report_file_name: 'report',
    report_file_extension: 'csv',
    report_file_separator: ',',
    report_file_dateformat: 'YYYYMMDD'
};

const config = {
    server: SERVER,
    context: CONTEXTS
};

export default config;
