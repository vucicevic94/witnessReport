# witnessReport
This is the REST API for the witness report. It only contains the POST method for sending the reports with parameters such as name and phone number. All reports are stored in a report file (the name and location of the file could be defined in config.ts file). API will check whether the FBI case is valid (by getting information from FBI Most Wanted API: https://api.fbi.gov/wanted) and whether the provided phone number is valid. Based on the phone number the country will be inserted into the report (if the country couldn't be found from the phone, the country will be retrieved based on the IP address of the client).

## Request example
POST http://127.0.0.1:5002/api/v1/report

```json

{
	"name":"OMAR ALEXANDER CARDENAS",
	"phone_number": "+7 401 450 6457"
}


```

