const INTERNAL_SERVER_ERROR = ['Internal server error.', 500];
const INVALID_PAYLOAD = ['Invalid payload.', 400];
const INVALID_TOKEN = ['Invalid token.', 401];

const send = (msg, res) => {
  const [message, status] = msg;
  res.status(status);
  res.json({ message });
};

module.exports = {
  send,
  INTERNAL_SERVER_ERROR,
  INVALID_PAYLOAD,
  INVALID_TOKEN,
};
