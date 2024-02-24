export default {
  type: "object",
  properties: {
    to: { type: "string" },
    from: { type: "string" },
    subject: { type: "string" },
    message: { type: "string" },
  },
  required: ["to", "from", "message"],
} as const;
