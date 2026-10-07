import { useEffect, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import FeedbackMessage from "../components/FeedbackMessage";
import { apiRequest } from "../lib/api";
import "../App.css";

type CustomerTrip = {
  trip_id: string;
  request_id: string;
  status: string;
  price: number | string | null;
  payment_method?: string | null;
  pickup: string;
  destination: string;
  payment_status?: string | null;
  payment_method_used?: string | null;
  paid_at?: string | null;
};

type PaymentIntentResponse = {
  paymentId: string;
  clientSecret: string;
  publishableKey: string;
  currency: string;
  amount: number;
};

const stripePromises = new Map<string, ReturnType<typeof loadStripe>>();

function getStripe(publishableKey: string) {
  let promise = stripePromises.get(publishableKey);
  if (!promise) {
    promise = loadStripe(publishableKey);
    stripePromises.set(publishableKey, promise);
  }
  return promise;
}

function statusLabel(status?: string | null) {
  if (!status) return "Unpaid";
  if (status === "successful") return "Paid";
  if (status === "refunded") return "Refunded";
  if (status === "pending") return "Payment processing";
  return status[0].toUpperCase() + status.slice(1);
}

function CheckoutForm({
  checkout,
  onCancel,
  onComplete,
}: {
  checkout: PaymentIntentResponse;
  onCancel: () => void;
  onComplete: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/MyTrips` },
        redirect: "if_required",
      });
      if (result.error) {
        setError(result.error.message ?? "Payment could not be confirmed.");
      } else if (result.paymentIntent?.status === "succeeded") {
        onComplete("Payment submitted. Stripe is confirming it; refresh the trip status shortly.");
      } else {
        onComplete("Payment submitted and is being processed.");
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Payment could not be completed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <section className="role-modal customer-checkout" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 id="checkout-title">Pay for trip</h2>
            <p>{new Intl.NumberFormat(undefined, { style: "currency", currency: checkout.currency.toUpperCase() }).format(checkout.amount)}</p>
          </div>
          <button className="modal-close" type="button" aria-label="Close checkout" onClick={onCancel}>×</button>
        </div>
        <form onSubmit={(event) => void submitPayment(event)}>
          <div className="modal-body">
            <PaymentElement />
            {error && <p className="error" role="alert">{error}</p>}
          </div>
          <div className="modal-footer">
            <button className="secondary-btn" type="button" onClick={onCancel} disabled={submitting}>Cancel</button>
            <button className="primary-btn" type="submit" disabled={!stripe || !elements || submitting}>
              {submitting ? "Processing..." : "Pay securely"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function CustomerTrips() {
  const [trips, setTrips] = useState<CustomerTrip[]>([]);
  const [checkout, setCheckout] = useState<PaymentIntentResponse | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [startingTrip, setStartingTrip] = useState("");

  const loadTrips = async () => {
    try {
      const rows = await apiRequest<CustomerTrip[]>("/trips/mine");
      setTrips(rows ?? []);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to load your trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTrips();
  }, []);

  const beginPayment = async (trip: CustomerTrip) => {
    setStartingTrip(trip.trip_id);
    setFeedback("");
    try {
      const result = await apiRequest<PaymentIntentResponse>(`/payments/trips/${trip.trip_id}/intent`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!result.clientSecret || !result.publishableKey) {
        throw new Error("Stripe is not fully configured for checkout.");
      }
      setCheckout(result);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to start payment.");
    } finally {
      setStartingTrip("");
    }
  };

  const completePayment = (message: string) => {
    setCheckout(null);
    setFeedback(message);
    void loadTrips();
  };

  return (
    <main className="customer-payment-page">
      <header className="customer-payment-header">
        <div>
          <p className="customer-payment-eyebrow">Workhorse</p>
          <h1>My Trips</h1>
          <p>Review your trip details and outstanding payments.</p>
        </div>
        <button className="secondary-btn" type="button" onClick={() => void loadTrips()} disabled={loading}>Refresh</button>
      </header>

      {feedback && <FeedbackMessage message={feedback} />}

      {loading ? (
        <p>Loading trips...</p>
      ) : trips.length === 0 ? (
        <p className="customer-trips-empty">No trips are associated with this account yet.</p>
      ) : (
        <div className="customer-trips-list">
          {trips.map((trip) => {
            const isPaid = trip.payment_status === "successful";
            const canPay = trip.status !== "cancelled" && !isPaid && trip.payment_status !== "refunded";
            return (
              <article className="customer-trip-row" key={trip.trip_id}>
                <div className="customer-trip-route">
                  <strong>{trip.pickup}</strong>
                  <span aria-hidden="true">→</span>
                  <strong>{trip.destination}</strong>
                </div>
                <div className="customer-trip-meta">
                  <span>Trip {trip.trip_id.slice(0, 8)}</span>
                  <span>{trip.status.replaceAll("_", " ")}</span>
                  <span>{statusLabel(trip.payment_status)}</span>
                  <strong>{trip.price == null ? "Price unavailable" : Number(trip.price).toFixed(2)}</strong>
                </div>
                {canPay && trip.price != null && Number(trip.price) > 0 && (
                  <button className="primary-btn" type="button" onClick={() => void beginPayment(trip)} disabled={startingTrip === trip.trip_id}>
                    {startingTrip === trip.trip_id ? "Preparing..." : trip.payment_status === "pending" ? "Continue payment" : "Pay by card"}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {checkout && (
        <Elements stripe={getStripe(checkout.publishableKey)} options={{ clientSecret: checkout.clientSecret }}>
          <CheckoutForm checkout={checkout} onCancel={() => setCheckout(null)} onComplete={completePayment} />
        </Elements>
      )}
    </main>
  );
}

export default CustomerTrips;
