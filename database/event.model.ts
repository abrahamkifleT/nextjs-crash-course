import {
  Schema,
  model,
  models,
  Document,
  Model,
  CallbackError,
} from "mongoose";

// Interface defining the Event document structure
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    overview: { type: String, required: true },
    image: { type: String, required: true },
    venue: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, required: true },
    audience: { type: String, required: true },
    agenda: { type: [String], required: true },
    organizer: { type: String, required: true },
    tags: { type: [String], required: true },
  },
  { timestamps: true }
);

// Pre-save hook for slug generation and data normalization
EventSchema.pre("save", function (next: (err?: CallbackError) => void) {
  // Generate slug from title if modified
  if (this.isModified("title")) {
    this.slug = (this as any).title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
      .replace(/(^-|-$)+/g, ""); // Remove leading/trailing hyphens
  }

  // Normalize date to ISO string if modified (basic validation)
  if (this.isModified("date")) {
    const validDate = new Date((this as any).date);
    if (!isNaN(validDate.getTime())) {
      (this as any).date = validDate.toISOString();
    } else {
      return next(new Error("Invalid date format"));
    }
  }

  // Ensure consistent time format (e.g., trim whitespace)
  if (this.isModified("time")) {
    (this as any).time = (this as any).time.trim();
  }

  next();
});

// Check if model exists to prevent overwrite in dev (hot-reloading)
const Event: Model<IEvent> =
  models?.Event || model<IEvent>("Event", EventSchema);

export default Event;
