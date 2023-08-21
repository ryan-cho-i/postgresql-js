# Simple Dashboard

## 1. Usage

Download this github repository.

```
git clone https://github.com/ryan-cho-i/simple-dashboard
```

Implement docker-compose

```
docker-compose up
```

After typing address (http://localhost:8080/) on your browser, the dashboard will show up

## 2. Environment

1. Web : ExpressJS

2. Database : Postgres

3. DevOps : Docker

## 3. System Design

1. Install PostgreSQL using Docker.

2. Upload xlsx File to PostgreSQL Database.

3. Access website (http://localhost:8080/)

4. Website send HTTP Request to the server.

5. Server send Query to database for extracting data.

6. Database send data to server according to Query

7. After receiving data, server send it to website

8. Website display that.

## 4. Problem & Solution

1. Continue to try connecting

```
async function connectToDatabase() {
  while (!client) {
    try {
      client = await pool.connect();
      return client;
    } catch (err) {
      console.log(
        "Error connecting to PostgreSQL, retrying in 5 seconds:",
        err
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
```

"depends_on" option doesn't guarantee the sequence of processes.

Therefore, I use the "setTimeout" function to continue to try connecting.
