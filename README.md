# Faro
> Home-made [Lighthouse](https://developers.google.com/web/tools/lighthouse/). 
>Analyzes performance metrics collected using [Puppeteer](https://github.com/GoogleChrome/puppeteer).
<p align="center">
  <img src="https://github.com/gamestoy/faro/blob/master/public/img/faro.jpg?raw=true" />
</p>

## Usage
```sh
npm install
node faro.js <url>
```

### Options
```sh
  --path, -p     Provide a file path where the report will be saved
  --before, -b   Choose the metric or mark to set as time limit
  --cpu, -c      Set CPU throttling                                     
  --device, -d   Select desktop computer or mobile device
                           [options: "mobile", "desktop"]
  --network, -n  Select a network type
                           [options: "native", "cable", "lte", "4g", "3gFast", "3g", "3gSlow", "2g"]
```

### Examples
```sh
node faro.js "https://www.google.com"
# Analizes the desktop site without throttling. The report is saved in "./logs".

node faro.js "https://www.google.com" -c=4 -d=mobile -n=3g
# Simulates a mid-range smartphone

node faro.js "https://www.google.com" -p=<new_path>
# Saves the report in a new folder
```
