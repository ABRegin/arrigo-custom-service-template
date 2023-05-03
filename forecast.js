const ENV = require('./environment');
const fetch = require('node-fetch');
const fs = require('fs');

async function getForecast(){
    // The centre of Stockholm (Sweden) is at
        // latitude 59.3293° N and longitude 18.0686° E
        const url =
          "https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/18.0686/lat/59.3293/data.json";
        const response = await fetch(url);

        // Convert the response to an object
        const forecast = await response.json();

        // The forecast object is basically a list of timeSeries objects,
        // where each item contains a list of parameters
        // (temperature, precipitation, visibility etc.).
        //
        // For this example we have already asserted that
        // the temperature is stored at index 10.
        // We then get the first value from that entry.
        const inOneHour = forecast.timeSeries[0].parameters[10].values[0];
        const inTwoHours = forecast.timeSeries[1].parameters[10].values[0];
        const inThreeHours = forecast.timeSeries[2].parameters[10].values[0];

        return { inOneHour, inTwoHours, inThreeHours };
}

async function main(){
    //Fetch forecast
    const forecast = await getForecast();
    //Save the object to a JSON file.
    //Get the project path from environment. 
    const path = `${ENV.projectPath}/shared/forecast.json`;
    const content = JSON.stringify(forecast, true);
    fs.writeFileSync(path, content, {encoding:'utf-8'});

    console.log(`Forecast saved to ${path} at ${Date.now().toString()}`)
}

main();