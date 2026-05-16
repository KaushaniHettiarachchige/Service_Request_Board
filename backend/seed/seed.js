const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const JobRequest = require("../models/JobRequest");

dotenv.config();

const seedUserData = {
  name: "Seed User",
  email: "seeduser@example.com",
  password: "password123",
};

const sampleJobs = [
  {
    title: "Need a plumber for leaking kitchen tap",
    description:
      "The kitchen tap is leaking under the sink and needs urgent repair.",
    category: "Plumbing",
    location: "Glasgow",
    contactName: "John Smith",
    contactEmail: "john@example.com",
    status: "Open",
  },
  {
    title: "Electrical repair needed",
    description:
      "Lights flicker in the living room and one wall socket is not working.",
    category: "Electrical",
    location: "Edinburgh",
    contactName: "Sarah Brown",
    contactEmail: "sarah@example.com",
    status: "In Progress",
  },
  {
    title: "Interior painting for two bedrooms",
    description:
      "Looking for a painter to paint two bedrooms and touch up wall corners.",
    category: "Painting",
    location: "Dundee",
    contactName: "Emma Taylor",
    contactEmail: "emma@example.com",
    status: "Open",
  },
  {
    title: "Door lock replacement",
    description:
      "The front door lock is faulty and needs to be replaced with a secure lock.",
    category: "Joinery",
    location: "Aberdeen",
    contactName: "David Wilson",
    contactEmail: "david@example.com",
    status: "Closed",
  },
  {
    title: "Garden cleanup service required",
    description:
      "Need help trimming hedges, removing weeds, and cleaning garden waste.",
    category: "Landscaping",
    location: "Glasgow",
    contactName: "Saman Perera",
    contactEmail: "saman@example.com",
    status: "Open",
  },
  {
    title: "AC not cooling properly",
    description:
      "The air conditioner is running but the room is not cooling effectively.",
    category: "Appliances",
    location: "Kandy",
    contactName: "Thilina M",
    contactEmail: "thilina@example.com",
    status: "Open",
  },
  {
    title: "Bathroom pipe repair",
    description:
      "Water is leaking from a bathroom pipe and needs to be checked.",
    category: "Plumbing",
    location: "Colombo",
    contactName: "Nimal Fernando",
    contactEmail: "nimal@example.com",
    status: "In Progress",
  },
  {
    title: "Small handyman repairs",
    description:
      "Need help fixing a loose cupboard handle and repairing a small shelf.",
    category: "Handyman",
    location: "Negombo",
    contactName: "Dilini Weerasekara",
    contactEmail: "dilini@example.com",
    status: "Open",
  },
];

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");

    let seedUser = await User.findOne({ email: seedUserData.email });

    if (!seedUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(seedUserData.password, salt);

      seedUser = await User.create({
        name: seedUserData.name,
        email: seedUserData.email,
        password: hashedPassword,
      });

      console.log("Seed user created");
    } else {
      console.log("Seed user already exists");
    }

    await JobRequest.deleteMany({ createdBy: seedUser._id });

    const jobsWithUser = sampleJobs.map((job) => ({
      ...job,
      createdBy: seedUser._id,
    }));

    await JobRequest.insertMany(jobsWithUser);

    console.log(`${sampleJobs.length} sample jobs inserted successfully`);
    console.log("Seed login account:");
    console.log(`Email: ${seedUserData.email}`);
    console.log(`Password: ${seedUserData.password}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();