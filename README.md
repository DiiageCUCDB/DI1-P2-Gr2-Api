# NodeJs API with Prisma

<!-- COVERAGE_BADGE_PLACEHOLDER -->

This project is a basic Node.js API built with **Express** and **Prisma**. It includes basic functionality for fetching users from a database and tests for the API endpoints

## Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express**: Web framework for building APIs.
- **Prisma**: ORM for interacting with the database.
- **Jest**: Testing framework for writing unit and integration tests.
- **TypeScript**: Typed superset of JavaScript.
- **Supertest**: HTTP assertions library used for testing API endpoints.
  
## Installation

### Prerequisites

Ensure you have **Node.js** (v18 or above) installed. You can download it from the official website: [Node.js](https://nodejs.org/).

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Set up the Prisma database schema. Make sure you have a running database and have set up the connection in the `.env` file.

4. To generate Prisma client and perform initial setup:

   ```bash
   npx prisma generate
   ```

## Development

To start the development server:

```bash
npm run dev
```

This will start the server at `http://localhost:3000`. You can use this endpoint to test the API:

- **GET /api/users**: Fetches a list of users from the database.

## Seeding the Database

You can seed the database with sample data by running the following command:

```bash
npm run prisma seed
```

This will execute the `prisma/seed.ts` file and populate the database with initial data.

### Example seed file (prisma/seed.ts):

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
  });
  console.log('User created');
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Running Tests

To run tests, simply run:

```bash
npm test
```

### Example Test (`__tests__/api.test.ts`):

```typescript
import request from 'supertest';
import { app } from '../src/app'; // import the app

describe("API Test", () => {
  it("should return users", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("users");
  });
});
```

### Jest Configuration

Your `jest.config.ts` should look like this to properly work with TypeScript:

```typescript
import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};

export default config;
```

## Directory Structure

- **`src`**: Source code for the application.
  - **`controllers`**: Contains logic for handling requests and interacting with the database.
  - **`routes`**: Defines API routes and routes to controllers.
  - **`app.ts`**: Main entry point of the application, initializes Express and routes.
  
- **`prisma`**: Contains Prisma schema and seed file.
  - **`schema.prisma`**: Defines the database schema and models.
  - **`seed.ts`**: Seeds the database with sample data.

- **`__tests__`**: Contains the test files for the application.

## Notes

- **Prisma Client**: After modifying the Prisma schema, remember to run `npx prisma generate` to regenerate the Prisma client.
- **Environment Variables**: Ensure that your `.env` file is set up with the correct database connection.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

This `README.md` includes all the information you need to run the project, seed the database, and run tests. Let me know if you'd like to modify or add anything else!
