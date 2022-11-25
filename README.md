# witnessReport
This is the REST API for witness report. It only contains the POST method for sending the reports with parameters such as name and phone number.
All reports are stored in a report file (name and location of file could be defined in config.ts file). 
API will check wheter FBI case is valid (by getting information from FBI Most Wanted API:  https://api.fbi.gov/wanted) and whether provided phone number is valid.
Based on phone number the country will be inserted into report (if country couldn't be found from phone, country will be retrieved based on IP address of client).

## Request example
POST http://127.0.0.1:5002/api/v1/report

```json

{
	"name":"OMAR ALEXANDER CARDENAS",
	"phone_number": "+7 401 450 6457"
}


```

