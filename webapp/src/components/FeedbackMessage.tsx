type FeedbackMessageProps = {
  message: string;
  tone?: "success" | "error";
};

function FeedbackMessage({ message, tone = "success" }: FeedbackMessageProps) {
  return <div className={`feedback-message ${tone}`}>{message}</div>;
}

export default FeedbackMessage;
