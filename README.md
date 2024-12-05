<a href="https://your-project-url">
  <h1 align="center">Examine.com live data retrieving API</h1>
</a>

<p align="center">
  An API for Supplement Data Extraction 
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#api-endpoints"><strong>API Endpoints</strong></a> ·
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
## Using Docker
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

## Approach

### Web Scraping with Puppeteer
- Scraped data from [Examine.com](https://examine.com) dynamically based on the query.
- Used request interception to optimize performance by blocking unnecessary resources like ads and images.

### Dynamic Query Handling
- Validated and sanitized user queries to avoid errors.
- Suggested related supplements if no exact match was found.

### Error Handling and Summaries
- Implemented robust error handling to handle missing data gracefully.
- Added a summary feature for concise data representation.

### Deployment Ready
- Dockerized the application for portability and ease of deployment.

## Challenges Faced

### 1. Dynamic Content Handling
Examine.com pages contain dynamically loaded content. To address this, the scraping logic used `waitUntil: 'domcontentloaded'` to ensure the page was fully loaded before extracting data.

### 2. Query Validation
Queries with spaces or special characters caused issues. This was resolved by sanitizing queries to replace spaces with hyphens and encoding them correctly.

### 3. Blocking Unnecessary Requests
Scraping efficiency was initially slow due to heavy resource loading. Request interception was implemented to block irrelevant resources like images, fonts, and ads.

### 4. Data Duplication
Extracted data often had redundant entries. This was resolved by using a `Set` to ensure uniqueness in the response.

### 5. Error Messaging
Informative error messages were added to guide users when no data was found or input was invalid.

## Technologies Used

<p align="center">
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/nodejs/nodejs.png" alt="Node.js" height="60">
  <img src="https://cdn.icon-icons.com/icons2/2415/PNG/512/typescript_original_logo_icon_146317.png" alt="TypeScript" height="60">
  <img src="https://seeklogo.com/images/P/puppeteer-logo-254C5F1692-seeklogo.com.png" alt="Puppeteer" height="60">
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/docker/docker.png" alt="Docker" height="60">
  
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/postman/postman.png" alt="Postman" height="60">
</p>
