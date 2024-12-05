<a href="https://your-project-url">
  <h1 align="center">Examine.com live data retrieving API</h1>
</a>

<p align="center">
  An API for Supplement Data Extraction 
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#api-endpoints"><strong>API Endpoints</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running Locally</strong></a> ·
  <a href="#using-docker"><strong>Using Docker</strong></a>
  <a href="#technologies-used"><strong>Technologies Used</strong></a>
</p>
<br/>

## Features

- **Dynamic Supplement Data Extraction**
  - Fetch detailed supplement information from [Examine.com](https://examine.com).
  - Search by specific fields like benefits, dosage, drawbacks, and more.
  - Generate suggestions when the queried supplement is not found.
- **Optimized Web Scraping**
  - Intelligent scraping using Puppeteer with request interception to block unnecessary resources.
  - Summarize responses for concise results.
- **Error Handling and Suggestions**
  - Suggest relevant supplements when no direct match is found.
  - Provide a human-readable summary of supplement data.
- **Easy to Deploy**
  - Docker support for seamless containerized deployment.
  - Postman workspace for easy API testing.
## RUNNING LOCALLY WITH DOCKER
**Step 1**: Clone the Repository via the terminal
```bash
git clone https://github.com/vakulenko10/nutrish-case.git .
```
**Step 2**: Build and Start the Docker Container via the terminal
```bash
docker-compose up --build
```
or run 
```bash
npm run docker
```
**Step 3**: Access the Application
Once the container is running, the application will be available at:

```bash
http://localhost:5000
```
## API Endpoints

### Fetch Supplement Data

**Endpoint**: `GET /fetch-dynamically`

**Description**: This endpoint retrieves detailed information about a specified supplement from Examine.com. If the requested supplement is not found, the API intelligently searches Examine.com and provides relevant suggestions with links to similar supplements or related pages.

**Parameters**:
- `query` (required): Name of the supplement (e.g., `vitamin-c`).
- `fields` (optional): Comma-separated fields to extract (e.g., `benefits,dosage`).
- `maxResults` (optional): Limit the number of results.
- `summary` (optional):A boolean value that determines whether the extracted data should be trimmed to smaller chunks for concise output. Instead of generating a true summary, this limits each item's length in the extracted Data object to provide a more compact view of the data.

**Example Request**:
```bash
GET http://localhost:5000/fetch-dynamically?query=vitamin-c&fields=benefits,dosage&maxResults=5&summary=true
```

### Check API

**Endpoint**: `GET /health`

**Description**: Check if the app is running

## Technologies Used

<p align="center">
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/nodejs/nodejs.png" alt="Node.js" height="60">
  <img src="https://cdn.icon-icons.com/icons2/2415/PNG/512/typescript_original_logo_icon_146317.png" alt="TypeScript" height="60">
  <img src="https://seeklogo.com/images/P/puppeteer-logo-254C5F1692-seeklogo.com.png" alt="Puppeteer" height="60">
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/docker/docker.png" alt="Docker" height="60">
  
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/postman/postman.png" alt="Postman" height="60">
</p>
