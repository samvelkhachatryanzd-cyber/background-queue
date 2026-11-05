# newsletter-api

The service that sends the newsletter. An editor creates a campaign with a subject and a text, then sends it to every subscriber. Subscribers, campaigns and a log of every email sent (`deliveries`) live in MySQL. Emails go out over SMTP.

## Stack

| Part | Technology | Local address |
|---|---|---|
| API | Node.js 22, Express 5 | http://localhost:4000 |
| Database | MySQL 8.4, Sequelize 6 with sequelize-cli migrations | `localhost:3308` |
| Message broker | RabbitMQ 4.4 with the management plugin | AMQP on `localhost:5672`, management UI on http://localhost:15672 |
| Email | Nodemailer over SMTP, Mailpit as the local mail server | SMTP on `localhost:1025`, web UI on http://localhost:8025 |

Docker Compose runs MySQL, RabbitMQ and Mailpit. The API runs on your machine. Mailpit is a mail server for development: it accepts every email and shows it in its web UI instead of delivering it. The application does not use RabbitMQ today.

## Run it

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm start
```

The API listens on http://localhost:4000. Every email the service sends shows up in Mailpit at http://localhost:8025. The RabbitMQ management UI is at http://localhost:15672; log in with `RABBITMQ_USER` and `RABBITMQ_PASSWORD` from `.env`. `npm run dev` restarts on file changes. `npm run db:reset` drops, migrates and reseeds.

If a port is taken on your machine, change `DB_PORT`, `RABBITMQ_PORT`, `RABBITMQ_UI_PORT`, `SMTP_PORT` or `MAILPIT_PORT` in `.env` before `docker compose up`.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Database connectivity check |
| POST | `/api/campaigns` | Create a draft campaign. JSON body with `subject` and `body` |
| GET | `/api/campaigns/:id` | One campaign with its `status` and `sentCount` |
| POST | `/api/campaigns/:id/send` | Send the campaign to every subscriber |

```bash
curl -X POST http://localhost:4000/api/campaigns -H 'Content-Type: application/json' \
     -d '{"subject": "November news", "body": "Our winter collection is out."}'
```
```json
{"id":1,"subject":"November news","body":"Our winter collection is out.","status":"draft","sentAt":null,"createdAt":"2026-11-05T11:03:27.000Z","updatedAt":"2026-11-05T11:03:27.000Z","sentCount":0}
```

```bash
curl -X POST http://localhost:4000/api/campaigns/1/send
```

Almost two minutes later:

```json
{"id":1,"subject":"November news","body":"Our winter collection is out.","status":"sent","sentAt":"2026-11-05T11:05:10.000Z","createdAt":"2026-11-05T11:03:27.000Z","updatedAt":"2026-11-05T11:05:10.000Z","sentCount":1000}
```

Errors come back as JSON, `{"error": "...", "details": [...]}`, with status 400, 404 or 409.

## Scripts

| Command | What it does |
|---|---|
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Insert `SEED_SUBSCRIBERS` subscribers, 1,000 by default. Refuses on a non-empty table |
| `npm run db:reset` | Drop all tables, migrate and seed again |

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | HTTP port |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | see `.env.example` | MySQL connection. Docker Compose reads the same values |
| `SMTP_HOST`, `SMTP_PORT` | `127.0.0.1`, `1025` | Mail server. Locally this is Mailpit |
| `MAIL_FROM` | `newsletter@example.com` | Sender address |
| `MAIL_DELAY_MS` | `100` | Wait before each email. The production mail provider takes about this long per email, while Mailpit answers instantly |
| `MAILPIT_PORT` | `8025` | Host port of the Mailpit web UI |
| `RABBITMQ_USER`, `RABBITMQ_PASSWORD` | `newsletter` | RabbitMQ login, also for the management UI. Docker Compose creates this user on first start |
| `RABBITMQ_PORT`, `RABBITMQ_UI_PORT` | `5672`, `15672` | Host ports for AMQP and for the management UI. The application does not use RabbitMQ today |
| `SEED_SUBSCRIBERS` | `1000` | How many subscribers `db:seed` creates |
| `SQL_LOG` | `0` | `1` prints every SQL query |

## Known issues

In production:

- Campaigns go out a few times per week, always to the whole subscriber list. The list grows every week.
- The mail provider takes about 100 ms per email.
- The API runs behind a proxy that closes any request after 30 seconds.

What the service does today:

- `POST /api/campaigns/:id/send` sends every email inside the HTTP request, one after another.
- The proxy closes the request after 30 seconds. The person who clicked Send gets an error, while the server keeps sending.
- A campaign is either `draft` or `sent`. A send that is still running and a send that died halfway look the same.
- If the mail server fails on one email, the request fails with a 500 and the rest of the list is not sent.
- A deploy or crash during a send stops it, and nothing picks it up again.

Measured on a developer machine with the default settings:

| Metric | Value |
|---|---|
| Subscribers | 1,000 |
| Duration of `POST /api/campaigns/:id/send` | ~104 s |

## Your task

Move slow work out of the HTTP request into background processing, so that requests stay responsive and the work can be monitored and retried.

Requirements:

1. Identify a suitable operation to execute asynchronously.
2. Implement a job queue using RabbitMQ.
3. Create a worker that processes queued jobs.
4. Track job status, including pending, processing, completed, and failed states where appropriate.
5. Implement error handling and a reasonable retry strategy.
6. Provide a way to inspect the result or status of a submitted job.

Expected outcome:

- Starting a send answers immediately, and the response tells the client how to follow the send.
- A worker processes the queued jobs.
- The status of a send can be checked at any time: pending, processing, completed or failed.
- Temporary failures, such as the mail server being down for a minute, are retried. A send that keeps failing ends as failed, with the reason visible.

How we work:

- Research freely: official documentation first, anything else that helps. Keep a note of what you relied on.
- When blocked, ask a focused question and include what you already tried.
- Commit in small steps so the path you took is visible.
- At the end we review the implementation together. Be ready to walk through the code, explain the trade-offs you made, and name what you would do differently with more time.
