const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const JobRequest = require("../models/JobRequest");
const User = require("../models/User");

let mongoServer;
let authToken;

beforeAll(async () => {
  process.env.JWT_SECRET = "test_jwt_secret";
  process.env.JWT_EXPIRES_IN = "1d";

  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri());

  const testUser = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: "123456",
  });

  authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
});

beforeEach(async () => {
  await JobRequest.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await JobRequest.deleteMany({});
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Job Routes API Tests", () => {
  test("GET /api/jobs should return all job requests", async () => {
    await JobRequest.create([
      {
        title: "Need a plumber",
        description: "Kitchen tap is leaking",
        category: "Plumbing",
        location: "Glasgow",
        contactName: "John",
        contactEmail: "john@example.com",
        status: "Open",
      },
      {
        title: "Need an electrician",
        description: "Bedroom socket is not working",
        category: "Electrical",
        location: "Edinburgh",
        contactName: "Sarah",
        contactEmail: "sarah@example.com",
        status: "In Progress",
      },
    ]);

    const response = await request(app).get("/api/jobs");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(2);
    expect(response.body.data.length).toBe(2);
  });

  test("GET /api/jobs?category=Plumbing should return filtered jobs", async () => {
    await JobRequest.create([
      {
        title: "Need a plumber",
        description: "Kitchen tap is leaking",
        category: "Plumbing",
        location: "Glasgow",
        contactName: "John",
        contactEmail: "john@example.com",
        status: "Open",
      },
      {
        title: "Need painting service",
        description: "Paint living room walls",
        category: "Painting",
        location: "Dundee",
        contactName: "Emma",
        contactEmail: "emma@example.com",
        status: "Open",
      },
    ]);

    const response = await request(app).get("/api/jobs?category=Plumbing");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(1);
    expect(response.body.data[0].category).toBe("Plumbing");
  });

  test("POST /api/jobs should reject request without JWT token", async () => {
    const newJob = {
      title: "Need a plumber",
      description: "Kitchen sink pipe is leaking",
      category: "Plumbing",
      location: "Glasgow",
      contactName: "John",
      contactEmail: "john@example.com",
    };

    const response = await request(app).post("/api/jobs").send(newJob);

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Not authorized. Please login first.");
  });

  test("POST /api/jobs should create a job when valid JWT token is provided", async () => {
    const newJob = {
      title: "Need a plumber",
      description: "Kitchen sink pipe is leaking",
      category: "Plumbing",
      location: "Glasgow",
      contactName: "John",
      contactEmail: "john@example.com",
    };

    const response = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(newJob);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe("Need a plumber");
    expect(response.body.data.status).toBe("Open");
  });

  test("PATCH /api/jobs/:id should update job status when JWT token is provided", async () => {
    const job = await JobRequest.create({
      title: "Need painting service",
      description: "Paint bedroom walls",
      category: "Painting",
      location: "Glasgow",
      contactName: "Emma",
      contactEmail: "emma@example.com",
      status: "Open",
    });

    const response = await request(app)
      .patch(`/api/jobs/${job._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        status: "In Progress",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("In Progress");
  });

  test("DELETE /api/jobs/:id should delete a job when JWT token is provided", async () => {
    const job = await JobRequest.create({
      title: "Need electrician",
      description: "Fix broken switch",
      category: "Electrical",
      location: "Edinburgh",
      contactName: "David",
      contactEmail: "david@example.com",
      status: "Open",
    });

    const response = await request(app)
      .delete(`/api/jobs/${job._id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Job request deleted successfully");

    const deletedJob = await JobRequest.findById(job._id);
    expect(deletedJob).toBeNull();
  });
});